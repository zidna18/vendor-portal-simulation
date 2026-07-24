const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
  // Temporary email→vendorId map until vendor master sync UI is built
  const VENDOR_MAP = {
    'zidna.q.tsaqila@accenture.com': '2100000010',
  };

  // ── CC scope helper ─────────────────────────────────────────────────
  // Returns the list of company codes the current BRM user is authorized for.
  // Vendor users are scoped by vendorId (XSUAA attribute), not by CC — returns null.
  // Empty array means the user has no CC assignments; all queries should return nothing.
  async function getUserCCScope(req) {
    if (req.user.is('Vendor')) return null;
    const db = await cds.connect.to('db');
    const { UserScopes } = db.entities('vendor.portal');
    const rows = await db.run(SELECT.from(UserScopes).where({ userId: req.user.id }));
    const allowedCCs = rows.map(r => r.companyCode);
    const rolesByCC = {};
    rows.forEach(r => { rolesByCC[r.companyCode] = JSON.parse(r.roles || '[]'); });
    return { allowedCCs, rolesByCC };
  }

  // Injects a companyCode IN filter into a CQN SELECT query.
  function applyCCFilter(query, allowedCCs) {
    if (!query.SELECT) return;
    const ccCondition = { companyCode: { in: allowedCCs.length ? allowedCCs : ['__NONE__'] } };
    const existing = query.SELECT.where;
    query.SELECT.where = existing ? { and: [existing, ccCondition] } : ccCondition;
  }

  // ── Entity-level authorization hooks ───────────────────────────────
  // READ: vendors see only their own records; BRM sees only their CC-scoped records.
  // CREATE/UPDATE: validate the companyCode in the payload is within the user's scope.
  const SCOPED_ENTITIES = ['Invoices', 'Quotations', 'RFQs'];

  srv.before('READ', SCOPED_ENTITIES, async req => {
    if (req.user.is('Vendor')) {
      const attrs = req.user.attr || {};
      const vendorId = (Array.isArray(attrs.vendorId) ? attrs.vendorId[0] : attrs.vendorId)
        || VENDOR_MAP[req.user.id] || null;
      if (vendorId && req.query.SELECT) {
        const existing = req.query.SELECT.where;
        const vCond = { vendorId: vendorId };
        req.query.SELECT.where = existing ? { and: [existing, vCond] } : vCond;
      }
      return;
    }
    const scope = await getUserCCScope(req);
    if (scope) applyCCFilter(req.query, scope.allowedCCs);
  });

  srv.before('CREATE', SCOPED_ENTITIES, async req => {
    if (req.user.is('Vendor')) {
      // Auto-stamp vendorId from XSUAA attribute — vendor cannot impersonate another
      const attrs = req.user.attr || {};
      const vendorId = (Array.isArray(attrs.vendorId) ? attrs.vendorId[0] : attrs.vendorId)
        || VENDOR_MAP[req.user.id] || null;
      if (vendorId) req.data.vendorId = vendorId;
      return;
    }
    const scope = await getUserCCScope(req);
    if (scope && req.data.companyCode && !scope.allowedCCs.includes(req.data.companyCode)) {
      return req.error(403, `Not authorized for company code ${req.data.companyCode}`);
    }
  });

  srv.before('UPDATE', SCOPED_ENTITIES, async req => {
    if (req.user.is('Vendor')) return; // vendors can only update their own (READ filter already scopes)
    const scope = await getUserCCScope(req);
    if (!scope) return;
    // If CC is being changed in the payload, validate target CC
    if (req.data.companyCode && !scope.allowedCCs.includes(req.data.companyCode)) {
      return req.error(403, `Not authorized for company code ${req.data.companyCode}`);
    }
    // Also validate the existing record's CC (prevent update of out-of-scope records)
    const db = await cds.connect.to('db');
    const entity = srv.entities[req.entity?.split('.').pop()];
    if (entity && req.data.id) {
      const existing = await db.run(SELECT.one.from(entity).columns('companyCode').where({ id: req.data.id }));
      if (existing && !scope.allowedCCs.includes(existing.companyCode)) {
        return req.error(403, `Not authorized for company code ${existing.companyCode}`);
      }
    }
  });

  // ── whoami ──────────────────────────────────────────────────────────
  srv.on('whoami', async req => {
    const u = req.user;
    let role = 'brm';
    if (u.is('PortalAdmin')) role = 'admin';
    else if (u.is('Director')) role = 'director';
    else if (u.is('Approver')) role = 'approver';
    else if (u.is('Vendor')) role = 'vendor';
    const attrs = u.attr || {};
    const email = u.id || '';
    const vendorId = (Array.isArray(attrs.vendorId) ? attrs.vendorId[0] : attrs.vendorId)
      || VENDOR_MAP[email]
      || null;
    // BRM/Approver/Director: include allowed company codes from UserScopes for frontend filtering
    let allowedCCs = [];
    if (role !== 'vendor') {
      try {
        const db = await cds.connect.to('db');
        const { UserScopes } = db.entities('vendor.portal');
        const rows = await db.run(SELECT.from(UserScopes).where({ userId: email }));
        allowedCCs = rows.map(r => r.companyCode);
      } catch (e) {
        console.warn('[whoami] UserScopes lookup failed:', e.message);
      }
    }
    return { id: email, email, name: email, role, vendorId, allowedCCs: JSON.stringify(allowedCCs) };
  });

  // ── vendorMaster ────────────────────────────────────────────────────
  // Fetches vendor master data from SAP S/4HANA via BTP Destination 'S4HC'.
  // Destination must be configured in BTP Cockpit → Connectivity → Destinations.
  srv.on('vendorMaster', async req => {
    const { vendorId } = req.data;
    if (!vendorId) return req.error(400, 'vendorId is required');

    let executeHttpRequest;
    try {
      ({ executeHttpRequest } = require('@sap-cloud-sdk/http-client'));
    } catch (e) {
      return req.error(503, 'SAP Cloud SDK not available: ' + e.message);
    }

    const dest = { destinationName: process.env.S4HC_DESTINATION || 'S4HC' };
    const baseUrl = `/sap/opu/odata/SAP/API_BUSINESS_PARTNER`;
    const hdrs = { Accept: 'application/json', 'sap-client': process.env.S4HC_CLIENT || '120' };

    let bp = {}, sup = {}, bankData = [], taxNumbers = [];
    try {
      const [bpRes, supRes, bankRes, taxRes] = await Promise.all([
        executeHttpRequest(dest, {
          method: 'GET',
          url: `${baseUrl}/A_BusinessPartner('${vendorId}')?$expand=to_BusinessPartnerAddress`,
          headers: hdrs,
        }),
        executeHttpRequest(dest, {
          method: 'GET',
          url: `${baseUrl}/A_Supplier('${vendorId}')?$expand=to_SupplierCompany,to_SupplierPurchasingOrg`,
          headers: hdrs,
        }),
        executeHttpRequest(dest, {
          method: 'GET',
          url: `${baseUrl}/A_BusinessPartnerBank?$filter=BusinessPartner eq '${vendorId}'`,
          headers: hdrs,
        }).catch(e => { console.warn('[vendorMaster] bank accounts unavailable:', e.message); return null; }),
        executeHttpRequest(dest, {
          method: 'GET',
          url: `${baseUrl}/A_BusinessPartnerTaxNumber?$filter=BusinessPartner eq '${vendorId}'`,
          headers: hdrs,
        }).catch(e => { console.warn('[vendorMaster] tax numbers unavailable:', e.message); return null; }),
      ]);
      bp = bpRes.data?.d || bpRes.data || {};
      sup = supRes.data?.d || supRes.data || {};
      bankData = bankRes ? (bankRes.data?.d?.results || bankRes.data?.value || []) : [];
      taxNumbers = taxRes ? (taxRes.data?.d?.results || taxRes.data?.value || []) : [];
    } catch (e) {
      const status = e.response?.status;
      const body = JSON.stringify(e.response?.data)?.slice(0, 500) || '';
      console.error(`[vendorMaster] SAP API failed: HTTP ${status} — ${e.message} — body: ${body}`);
      return req.error(502, `SAP API HTTP ${status}: ${e.message}. Body: ${body}`);
    }

    // ── Address — one entry per SAP Address Overview row ─────────────
    const addresses = bp.to_BusinessPartnerAddress?.results
      || bp.to_BusinessPartnerAddress?.value
      || [];
    const mainAddr = addresses[0] || {};
    const addrStr = [
      mainAddr.StreetName,
      mainAddr.HouseNumber,
      mainAddr.CityName,
      mainAddr.PostalCode,
    ].filter(Boolean).join(', ');

    // Map each SAP address to a flat object for the UI table
    const addrRows = addresses.map((a, i) => ({
      no:      String(i + 1).padStart(4, '0'),
      street:  [a.StreetName, a.HouseNumber].filter(Boolean).join(' '),
      city:    a.CityName || '',
      postal:  a.PostalCode || '',
      country: a.Country || 'ID',
      region:  a.Region || '',
      phone:   a.PhoneNumber || '',
      fax:     a.FaxNumber || '',
      email:   a.EmailAddress || '',
      default: i === 0,
    }));

    // ── Tax numbers (ID1=NPWP, ID3=NPPKP, ID5=NITKU) ─────────────────
    const taxByCategory = {};
    taxNumbers.forEach(t => { taxByCategory[t.TaxNumberCategory] = t.TaxNumber || t.TaxNumberLong || ''; });
    const npwp  = taxByCategory['ID1'] || sup.TaxNumber1 || '';
    const nppkp = taxByCategory['ID3'] || '';
    const nitku = taxByCategory['ID5'] || '';

    // ── PKP status from LegalForm ─────────────────────────────────────
    const legalForm = bp.LegalForm || '';
    const pkpStatus = legalForm === 'Z1' ? 'PKP' : legalForm === 'Z2' ? 'Non PKP' : legalForm === 'Z9' ? 'Others' : '';

    // ── Bank accounts ─────────────────────────────────────────────────
    const banks = bankData.map((b, i) => ({
      no: i + 1,
      name: b.BankName || b.BankNumber || '—',
      branch: b.BankBranch || '',
      acc: b.BankAccount || '',
      aname: b.BankAccountHolderName || bp.BusinessPartnerFullName || '',
      currency: b.CurrencyCode || 'IDR',
      swift: b.SWIFTCode || '',
      primary: i === 0,
    }));

    // ── LFB1 (vendor per company code) ───────────────────────────────
    const lfb1 = (
      sup.to_SupplierCompany?.results ||
      sup.to_SupplierCompany?.value ||
      []
    ).map(r => ({
      bukrs: r.CompanyCode || '',
      akont: r.ReconciliationAccount || '',
      zterm: r.PaymentTerms || '',
      zwels: r.PaymentMethodsList || '',
      reprf: r.CheckDoubleInvoice === 'true' || r.CheckDoubleInvoice === true,
      busab: r.AccountingClerk || '',
      fdgrp: r.PlanningGroup || '',
      reconcAcct: 'Accounts Payable',
    }));

    // ── LFM1 (vendor per purchasing org) ─────────────────────────────
    const lfm1 = (
      sup.to_SupplierPurchasingOrg?.results ||
      sup.to_SupplierPurchasingOrg?.value ||
      []
    ).map(r => ({
      ekorg: r.PurchasingOrganization || '',
      bukrs: r.CompanyCode || '',
      waers: r.PurchaseOrderCurrency || 'IDR',
      zterm: r.PaymentTerms || '',
      inco1: r.IncotermsClassification || '',
      inco2: r.IncotermsTransferLocation || '',
      minbw: parseFloat(r.MinimumOrderAmount || '0'),
      verkf: r.SupplierSalesperson || '',
      telf1: r.SupplierPhoneNumber || '',
      autom: r.AutomaticPurchaseOrderAllowed === 'true' || r.AutomaticPurchaseOrderAllowed === true,
    }));

    // ── Parse OData v2 /Date(ms)/ to ISO ─────────────────────────────
    const parseDate = val => {
      const ms = parseInt((String(val || '')).match(/\d+/)?.[0] || '0');
      return ms ? new Date(ms).toISOString().split('T')[0] : '';
    };

    return {
      id:          vendorId,
      name:        bp.BusinessPartnerFullName || bp.OrganizationBPName1 || '',
      tax:         npwp,
      addr:        addrStr,
      phone:       mainAddr.PhoneNumber || '',
      fax:         mainAddr.FaxNumber || '',
      email:       mainAddr.EmailAddress || '',
      cat:         bp.IndustrySector || 'Services',
      since:       parseDate(bp.CreationDate),
      rep:         '',
      status:      sup.DeletionIndicator ? 'Inactive' : 'Active',
      website:     bp.WebsiteURL || '',
      pkp:         pkpStatus,
      pkpStatus:   pkpStatus,
      legalForm:   legalForm,
      taxStatus:   'Active',
      certExpiry:  '',
      npwp:        npwp,
      nppkp:       nppkp,
      nitku:       nitku,
      npwpAddress: addrStr,
      addresses:   JSON.stringify(addrRows),
      banks:       JSON.stringify(banks),
      lfb1:        JSON.stringify(lfb1),
      lfm1:        JSON.stringify(lfm1),
    };
  });

  // ── purchaseOrders ──────────────────────────────────────────────────
  // Fetches PO headers for the vendor F4 value help popup (SAP_COM_0238).
  // PO header entity has no total amount field — must expand _PurchaseOrderItem
  // and sum GrossAmount (per-item gross order value) to get PO total (PDF confirmed).
  srv.on('purchaseOrders', async req => {
    const { vendorId } = req.data;
    if (!vendorId) return req.error(400, 'vendorId is required');

    let executeHttpRequest;
    try {
      ({ executeHttpRequest } = require('@sap-cloud-sdk/http-client'));
    } catch (e) {
      return req.error(503, 'SAP Cloud SDK not available: ' + e.message);
    }

    const dest   = { destinationName: process.env.S4HC_DESTINATION || 'S4HC' };
    const hdrsV4 = { Accept: 'application/json', 'sap-client': process.env.S4HC_CLIENT || '120' };
    try {
      // Expand _PurchaseOrderItem to get GrossAmount per item — no header-level total exists.
      // GrossAmount = gross order value per item in document currency (NetPriceAmount × qty incl. discounts).
      // NetPriceAmount + NetPriceQuantity + OrderQuantity are kept as fallback if GrossAmount is null.
      const itemSelect = 'PurchaseOrder,PurchaseOrderItem,GrossAmount,NetPriceAmount,NetPriceQuantity,OrderQuantity,DocumentCurrency';
      const res = await executeHttpRequest(dest, {
        method: 'GET',
        url: `/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/PurchaseOrder?$filter=Supplier eq '${vendorId}'&$expand=_PurchaseOrderItem($select=${itemSelect})&$top=100`,
        headers: hdrsV4,
      });
      const rows = res.data?.value || [];
      console.log(`[purchaseOrders] V4 returned ${rows.length} POs for vendor ${vendorId}`);

      return rows.map(r => {
        const itemList = r._PurchaseOrderItem?.value || r._PurchaseOrderItem || [];
        const totalGross = itemList.reduce((sum, itm) => {
          const gross = parseFloat(itm.GrossAmount || '0');
          if (gross > 0) return sum + gross;
          // Fallback: NetPriceAmount / NetPriceQuantity × OrderQuantity
          const np  = parseFloat(itm.NetPriceAmount   || '0');
          const npq = parseFloat(itm.NetPriceQuantity  || '1') || 1;
          const oq  = parseFloat(itm.OrderQuantity     || '0');
          return sum + (np / npq * oq);
        }, 0);
        return {
          po:          r.PurchaseOrder || '',
          companyCode: r.CompanyCode   || '',
          supplier:    r.Supplier      || '',
          currency:    r.DocumentCurrency || 'IDR',
          netAmount:   String(totalGross),
          poDate:      r.CreationDate  || '',
          description: r.PurchaseOrderType || '',
          plant:       r.Plant         || '',
          purchOrg:    r.PurchasingOrganization || '',
        };
      });
    } catch (e) {
      const status = e.response?.status;
      const body = JSON.stringify(e.response?.data)?.slice(0, 300) || '';
      console.error(`[purchaseOrders] SAP API failed: HTTP ${status} — ${e.message} — body: ${body}`);
      return req.error(502, `SAP API HTTP ${status}: ${e.message}`);
    }
  });

  // ── purchaseOrderItems ──────────────────────────────────────────────
  // Fetches PO line items (SAP_COM_0238) + real GR amounts (SAP_COM_0002).
  // GR amounts: API_OPLACCTGDOCITEMCUBE_SRV / A_OperationalAcctgDocItemCube
  //   AccountingDocumentType='WE' (Wareneingang = Goods Receipt), DebitCreditCode='S'
  //   PurchaseOrderScheduleLine has NO delivered-qty field (PDF confirmed) — old approach removed.
  srv.on('purchaseOrderItems', async req => {
    const { poNumbers } = req.data;
    const poList = (poNumbers || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!poList.length) return req.error(400, 'poNumbers is required');

    let executeHttpRequest;
    try {
      ({ executeHttpRequest } = require('@sap-cloud-sdk/http-client'));
    } catch (e) {
      return req.error(503, 'SAP Cloud SDK not available: ' + e.message);
    }

    const dest = { destinationName: process.env.S4HC_DESTINATION || 'S4HC' };
    const hdrs = { Accept: 'application/json', 'sap-client': process.env.S4HC_CLIENT || '120' };
    const poFilter = poList.map(p => `PurchaseOrder eq '${p}'`).join(' or ');

    // ── 1. Fetch PO items from V2 (price fields) ─────────────────────
    let items = [];
    try {
      const itemRes = await executeHttpRequest(dest, {
        method: 'GET',
        url: `/sap/opu/odata/SAP/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem?$filter=${poFilter}`,
        headers: hdrs,
      });
      items = itemRes.data?.d?.results || itemRes.data?.value || [];
    } catch (e) {
      const status = e.response?.status;
      const body = JSON.stringify(e.response?.data)?.slice(0, 300) || '';
      console.error(`[poItems] PO item fetch failed: HTTP ${status} — ${e.message} — ${body}`);
      return req.error(502, `SAP API HTTP ${status}: ${e.message}`);
    }

    // ── 2. Fetch GR amounts from Operational Accounting Document Item Cube ──
    // API_OPLACCTGDOCITEMCUBE_SRV (SAP_COM_0002 — Financial Accounting, Read Access)
    // AccountingDocumentType 'WE' = Wareneingang (Goods Receipt posting in FI)
    // DebitCreditCode 'S' = debit side = inventory / expense account (the GR cost amount)
    const grAmounts = {}; // key: "PO/item" → cumulative GR amount
    try {
      const grPoFilter = poList.map(p => `PurchasingDocument eq '${p}'`).join(' or ');
      const grSelect = 'PurchasingDocument,PurchasingDocumentItem,AmountInTransactionCurrency,TransactionCurrency,DebitCreditCode';
      const grRes = await executeHttpRequest(dest, {
        method: 'GET',
        url: `/sap/opu/odata/sap/API_OPLACCTGDOCITEMCUBE_SRV/A_OperationalAcctgDocItemCube?$filter=(${grPoFilter}) and AccountingDocumentType eq 'WE' and DebitCreditCode eq 'H'&$select=${grSelect}`,
        headers: hdrs,
      });
      const grRows = grRes.data?.d?.results || grRes.data?.value || [];
      console.log(`[poItems] GR rows from ACDOCA: ${grRows.length}`);
      grRows.forEach(g => {
        const key = `${g.PurchasingDocument}/${g.PurchasingDocumentItem}`;
        grAmounts[key] = (grAmounts[key] || 0) + parseFloat(g.AmountInTransactionCurrency || '0');
      });
    } catch (e) {
      // GR API is optional — SAP_COM_0002 may not be configured; log and continue with 0
      console.warn('[poItems] GR amount API unavailable (SAP_COM_0002 required):', e.response?.status, e.message);
    }

    // ── 3. Map items ──────────────────────────────────────────────────
    return items.map(r => {
      const key      = `${r.PurchaseOrder}/${r.PurchaseOrderItem}`;
      const orderQty = parseFloat(r.OrderQuantity    || '0');
      const netPrice = parseFloat(r.NetPriceAmount   || '0');
      const priceQty = parseFloat(r.NetPriceQuantity || '1') || 1;
      const unitPrc  = netPrice / priceQty;
      const poAmount = unitPrc * orderQty;
      const grAmount = grAmounts[key] !== undefined ? Math.abs(grAmounts[key]) : 0;
      const dpAmount = parseFloat(r.DownPaymentAmount || '0');

      return {
        po:        r.PurchaseOrder        || '',
        item:      r.PurchaseOrderItem    || '',
        material:  r.Material             || '',
        desc:      r.PurchaseOrderItemText|| '',
        qty:       String(orderQty),
        uom:       r.PurchaseOrderQuantityUnit || '',
        unitPrice: String(unitPrc),
        poAmount:  String(poAmount),
        grAmount:  String(grAmount),
        dpAmount:  String(dpAmount),
        currency:  r.DocumentCurrency    || 'IDR',
        plant:     r.Plant               || '',
      };
    });
  });

  // ── Startup: register Express routes + clear mock seed data ────────
  cds.on('served', async () => {
    // ── File attachment routes (binary — bypass OData) ───────────────
    const express = require('express');

    // Upload: POST /api/attach  (outside CDS service path to avoid OData 404 interception)
    cds.app.post('/api/attach', express.json({ limit: '20mb' }), async (req, res) => {
      try {
        const { invoiceId, fileName, mimeType, content } = req.body;
        if (!invoiceId || !fileName || !content) return res.status(400).json({ error: 'invoiceId, fileName, content required' });
        const db = await cds.connect.to('db');

        // CC scope check: validate user is authorized for the invoice's company code
        if (req.user && !req.user.is('Vendor')) {
          const { Invoices, UserScopes } = db.entities('vendor.portal');
          const [inv, scopeRows] = await Promise.all([
            db.run(SELECT.one.from(Invoices).columns('companyCode').where({ id: invoiceId })),
            db.run(SELECT.from(UserScopes).where({ userId: req.user.id })),
          ]);
          const allowedCCs = scopeRows.map(r => r.companyCode);
          if (inv && allowedCCs.length && !allowedCCs.includes(inv.companyCode)) {
            return res.status(403).json({ error: `Not authorized for company code ${inv.companyCode}` });
          }
        }
        const id = cds.utils.uuid();
        const buf = Buffer.from(content, 'base64');
        // HANA LargeBinary: insert as Buffer (CAP marshals to BLOB)
        const { InvoiceAttachments } = cds.entities('vendor.portal');
        await db.run(INSERT.into(InvoiceAttachments).entries({
          id, invoiceId, fileName,
          mimeType: mimeType || 'application/octet-stream',
          fileSize: buf.length,
          content: buf,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user?.id || 'user',
        }));
        res.json({ id, fileName, fileSize: buf.length });
      } catch (e) {
        console.error('[attach upload]', e.message);
        res.status(500).json({ error: e.message });
      }
    });

    // Download: GET /api/attach/:id
    cds.app.get('/api/attach/:id', async (req, res) => {
      try {
        const db = await cds.connect.to('db');
        const { InvoiceAttachments } = cds.entities('vendor.portal');
        const row = await db.run(SELECT.one.from(InvoiceAttachments).where({ id: req.params.id }));
        if (!row) return res.status(404).send('Not found');
        res.set('Content-Type', row.mimeType || 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${row.fileName}"`);
        res.send(row.content);
      } catch (e) {
        console.error('[attach download]', e.message);
        res.status(500).send(e.message);
      }
    });

    // ── Post Supplier Invoice to SAP S/4HANA (Parked as Completed) ──────
    // Calls API_SUPPLIERINVOICE_PROCESS_SRV via BTP Destination 'S4HC'
    // Communication scenario: SAP_COM_0057 (Supplier Invoice Integration)
    cds.app.post('/api/postInvoice', express.json({ limit: '1mb' }), async (req, res) => {
      try {
        const inv = req.body;
        if (!inv || !inv.id) return res.status(400).json({ error: 'invoice payload required' });

        // CC scope check: BRM user must be authorized for the invoice's company code
        if (req.user && !req.user.is('Vendor')) {
          const db = await cds.connect.to('db');
          const { UserScopes } = db.entities('vendor.portal');
          const scopeRows = await db.run(SELECT.from(UserScopes).where({ userId: req.user.id }));
          const allowedCCs = scopeRows.map(r => r.companyCode);
          if (allowedCCs.length && inv.companyCode && !allowedCCs.includes(inv.companyCode)) {
            return res.status(403).json({ error: `Not authorized for company code ${inv.companyCode}` });
          }
        }

        let executeHttpRequest;
        try {
          ({ executeHttpRequest } = require('@sap-cloud-sdk/http-client'));
        } catch (e) {
          return res.status(503).json({ error: 'SAP Cloud SDK not available: ' + e.message });
        }

        const dest = { destinationName: process.env.S4HC_DESTINATION || 'S4HC' };
        const base = `/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV`;
        const client = process.env.S4HC_CLIENT || '120';

        // 0. If inv.items is empty, fetch PO line items from SAP before building payload
        let invItems = inv.items || [];
        if (invItems.length === 0 && (inv.poNumbers || []).length > 0) {
          console.log('[postInvoice] inv.items empty — fetching PO items from SAP for:', inv.poNumbers);
          try {
            const poList = inv.poNumbers;
            const poFilter = poList.map(p => `PurchaseOrder eq '${p}'`).join(' or ');
            const poItemRes = await executeHttpRequest(dest, {
              method: 'GET',
              url: `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem?$filter=${poFilter}`,
              headers: { 'Accept': 'application/json', 'sap-client': client },
            });
            const rawItems = poItemRes.data?.d?.results || poItemRes.data?.value || [];
            invItems = rawItems.map(r => ({
              po:       r.PurchaseOrder || '',
              item:     r.PurchaseOrderItem || '',
              plant:    r.Plant || '',
              qty:      r.OrderQuantity || '0',
              uom:      r.PurchaseOrderQuantityUnit || 'EA',
              poAmount: String(parseFloat(r.NetPriceAmount || '0') / (parseFloat(r.NetPriceQuantity || '1') || 1) * parseFloat(r.OrderQuantity || '0')),
            }));
            console.log('[postInvoice] fetched', invItems.length, 'PO items from SAP');
          } catch (e) {
            console.warn('[postInvoice] PO items fetch failed:', e.message, '— proceeding without items');
          }
        }
        console.log('[postInvoice] items count:', invItems.length, JSON.stringify(invItems).slice(0, 300));

        // 1. Fetch CSRF token — use Accept:*/* so $metadata (XML-only) doesn't 406
        const tokenRes = await executeHttpRequest(dest, {
          method: 'GET',
          url: `${base}/$metadata`,
          headers: { 'Accept': '*/*', 'sap-client': client, 'x-csrf-token': 'Fetch' },
        });
        const csrfToken = tokenRes.headers['x-csrf-token'] || tokenRes.headers['X-CSRF-Token'] || '';
        // Carry session cookies so SAP validates the CSRF token against the same session
        const rawCookies = tokenRes.headers['set-cookie'];
        const sessionCookie = Array.isArray(rawCookies)
          ? rawCookies.map(c => c.split(';')[0]).join('; ')
          : (rawCookies ? rawCookies.split(';')[0] : '');
        console.log('[postInvoice] step1 done, token length:', csrfToken.length, 'cookie:', sessionCookie ? 'yes' : 'none');

        // 2. Build PO item lines
        const poItems = invItems.map((item, idx) => ({
          SupplierInvoiceItem:           String(idx + 1).padStart(5, '0'),
          PurchaseOrder:                 item.po || '',
          PurchaseOrderItem:             String(item.item || '').padStart(5, '0'),
          Plant:                         item.plant || '',
          SupplierInvoiceItemAmount:     String(Number(item.invoiceAmt || item.poAmount || 0).toFixed(2)),
          TaxCode:                       inv.vatTaxCode || 'V1',  // V1 = Input VAT 11% (CPMS)
          DocumentCurrency:              inv.currency || 'IDR',
          PurchaseOrderQuantityUnit:     item.uom || 'EA',
          QuantityInPurchaseOrderUnit:   String(Number(item.qty || 0).toFixed(3)),
        }));

        // Tax is derived automatically from TaxCode on each PO item line (FF/812 if duplicated here)

        // 4. Build WHT lines if applicable
        const whtLines = (inv.whtType && Number(inv.whtAmt || 0) > 0) ? [{
          WithholdingTaxType:           inv.whtType,
          WithholdingTaxCode:           inv.whtCode || '',
          WithholdingTaxBaseAmount:     String(Number(inv.whtBase || inv.amount || 0).toFixed(2)),
          ManuallyEnteredWhldgTaxAmount: String(Number(inv.whtAmt || 0).toFixed(2)),
          WhldgTaxIsEnteredManually:    true,
          DocumentCurrency:             inv.currency || 'IDR',
        }] : [];

        // 5. Build header payload — DocumentHeaderInProcessingStatus "B" = Parked as Completed
        // OData V2 requires Edm.DateTime as /Date(milliseconds)/ — plain YYYY-MM-DD is rejected
        const toODataDate = (d) => {
          const s = d ? String(d).slice(0, 10) : new Date().toISOString().slice(0, 10);
          return `/Date(${new Date(s + 'T00:00:00Z').getTime()})/`;
        };
        const today = new Date().toISOString().slice(0, 10);
        const payload = {
          CompanyCode:                        inv.companyCode || 'BRMS',
          DocumentDate:                       toODataDate(inv.invoiceDate || today),
          PostingDate:                        toODataDate(today),
          SupplierInvoiceIDByInvcgParty:      inv.invoiceNo || '',
          InvoicingParty:                     inv.vendorId  || '',
          DocumentCurrency:                   inv.currency  || 'IDR',
          InvoiceGrossAmount:                 String(Number(inv.amount || 0).toFixed(2)),
          DocumentHeaderText:                 inv.desc || inv.invoiceNo || '',
          PaymentTerms:                       inv.paymentTerms || inv.pmtTerms || '',
          SupplierInvoiceStatus:              'B',
          TaxIsCalculatedAutomatically:       true,
          TaxDeterminationDate:               toODataDate(inv.invoiceDate || today),
          // Tax document reference
          ...(inv.taxDocNo ? { AssignmentReference: inv.taxDocNo } : {}),
          to_SuplrInvcItemPurOrdRef:    { results: poItems },
          ...(whtLines.length ? { to_SupplierInvoiceWhldgTax: { results: whtLines } } : {}),
        };

        console.log('[postInvoice] PaymentTerms:', JSON.stringify(inv.paymentTerms), 'pmtTerms:', JSON.stringify(inv.pmtTerms));
        console.log('[postInvoice] payload:', JSON.stringify(payload));

        // 6. POST to SAP — Accept:*/* lets SAP respond in whatever format it supports
        const postHdrs = {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'sap-client': client,
          'x-csrf-token': csrfToken,
          ...(sessionCookie ? { 'Cookie': sessionCookie } : {}),
        };
        console.log('[postInvoice] POST headers:', JSON.stringify(postHdrs));
        const sapRes = await executeHttpRequest(dest, {
          method: 'POST',
          url: `${base}/A_SupplierInvoice`,
          headers: postHdrs,
          data: payload,
          responseType: 'text',
        });

        // Parse SupplierInvoice + FiscalYear from OData V2 XML response
        const xmlBody = typeof sapRes.data === 'string' ? sapRes.data : JSON.stringify(sapRes.data);
        const docMatch = xmlBody.match(/<[^>]*:?SupplierInvoice[^>]*>([^<]+)<\/[^>]*:?SupplierInvoice>/);
        const yrMatch  = xmlBody.match(/<[^>]*:?FiscalYear[^>]*>([^<]+)<\/[^>]*:?FiscalYear>/);
        const sapDocNo   = docMatch ? docMatch[1].trim() : '';
        const fiscalYear = yrMatch  ? yrMatch[1].trim()  : today.slice(0, 4);
        const fullDocNo  = sapDocNo ? `${sapDocNo}/${fiscalYear}` : '';
        const sapDoc     = { SupplierInvoice: sapDocNo, FiscalYear: fiscalYear };

        console.log('[postInvoice] SAP response:', JSON.stringify(sapDoc, null, 2));

        // 7. Persist status + sapDocNo to HANA
        const db = await cds.connect.to('db');
        const { Invoices, InvoiceAttachments } = cds.entities('vendor.portal');
        await db.run(UPDATE(Invoices).set({
          status:    'Posted',
          sapDocNo:  fullDocNo,
          postedAt:  today,
        }).where({ id: inv.id }));

        // 8. Upload attachments to SAP via API_CV_ATTACHMENT_SRV (same SAP_COM_0057 destination)
        const attachResults = [];
        if (sapDocNo) {
          try {
            const attachments = await db.run(
              SELECT.from(InvoiceAttachments).where({ invoiceId: inv.id })
            );
            if (attachments && attachments.length > 0) {
              const attachBase = `/sap/opu/odata/sap/API_CV_ATTACHMENT_SRV`;
              // CSRF token for attachment service
              const aTokenRes = await executeHttpRequest(dest, {
                method: 'GET', url: `${attachBase}/$metadata`,
                headers: { Accept: '*/*', 'sap-client': client, 'x-csrf-token': 'Fetch' },
              });
              const aCsrf = aTokenRes.headers['x-csrf-token'] || aTokenRes.headers['X-CSRF-Token'] || '';

              // LinkedSAPObjectKey for BKPF: CompanyCode(4) + DocNumber(10) + FiscalYear(4)
              const compCode = (inv.companyCode || 'BRMS').padEnd(4, ' ');
              const belnr    = sapDocNo.padStart(10, '0');
              const linkedKey = `${compCode}${belnr}${fiscalYear}`;

              for (const att of attachments) {
                try {
                  // content is Buffer (HANA LargeBinary); convert if returned as base64 string
                  const buf = Buffer.isBuffer(att.content)
                    ? att.content
                    : Buffer.from(att.content, 'base64');

                  await executeHttpRequest(dest, {
                    method: 'POST',
                    url: `${attachBase}/A_AttachmentContent`,
                    headers: {
                      'Content-Type':          att.mimeType || 'application/octet-stream',
                      'slug':                  att.fileName || 'attachment',
                      'x-csrf-token':          aCsrf,
                      'BusinessObjectTypeName': 'BKPF',
                      'LinkedSAPObjectKey':     linkedKey,
                      'SemanticObject':         'SupplierInvoice',
                      'sap-client':             process.env.S4HC_CLIENT || '120',
                    },
                    data: buf,
                  });
                  console.log('[postInvoice] Attachment uploaded to SAP:', att.fileName);
                  attachResults.push({ fileName: att.fileName, ok: true });
                } catch (attErr) {
                  const attDetail = attErr.response?.data || attErr.message;
                  console.error('[postInvoice] Attachment upload failed:', att.fileName, JSON.stringify(attDetail));
                  attachResults.push({ fileName: att.fileName, ok: false, error: String(attDetail) });
                }
              }
            }
          } catch (attStepErr) {
            console.error('[postInvoice] Attachment step error:', attStepErr.message);
            attachResults.push({ ok: false, error: attStepErr.message });
          }
        }

        res.json({ sapDocNo: fullDocNo, sapDoc, attachments: attachResults });

      } catch (e) {
        const status  = e.response?.status;
        const headers = e.response?.headers;
        const detail  = e.response?.data || e.message;
        console.error('[postInvoice] error status:', status);
        console.error('[postInvoice] error headers:', JSON.stringify(headers));
        console.error('[postInvoice] error body:', typeof detail === 'string' ? detail : JSON.stringify(detail));
        res.status(500).json({ error: typeof detail === 'string' ? detail : JSON.stringify(detail) });
      }
    });

    // ── Clear mock seed data ─────────────────────────────────────────
    try {
      const db = await cds.connect.to('db');
      const { Invoices, Quotations, RFQs } = db.entities('vendor.portal');
      const mockRow = await db.run(SELECT.one.from(Invoices).where({ id: 'PI-2025-0001' }));
      if (!mockRow) return;
      console.log('[init] Mock data detected — clearing all tables');
      await db.run(DELETE.from(Invoices));
      await db.run(DELETE.from(Quotations));
      await db.run(DELETE.from(RFQs));
      console.log('[init] Tables cleared — ready for real data');
    } catch (e) {
      console.error('[init] Clear failed:', e.message);
    }
  });

  // ── Admin: Vendor provisioning list ─────────────────────────────
  // GET /api/admin/vendors — returns VendorProvisioning records merged with SAP BP data
  cds.app.get('/api/admin/vendors', async (req, res) => {
    try {
      const db = await cds.connect.to('db');
      const { VendorProvisioning } = db.entities('vendor.portal');
      const rows = await db.run(SELECT.from(VendorProvisioning).orderBy('bp'));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/admin/createPortalUser — creates IAS user via SCIM + assigns VENDOR role collection
  // IAS SCIM API: POST /scim/v2/Users with custom vendorId attribute
  // XSUAA API: PUT /Groups/{vendorRoleCollId}/members to assign VENDOR role collection
  cds.app.post('/api/admin/createPortalUser', express.json(), async (req, res) => {
    try {
      const { bp } = req.body;
      if (!bp) return res.status(400).json({ error: 'bp is required' });
      const db = await cds.connect.to('db');
      const { VendorProvisioning } = db.entities('vendor.portal');
      const vendor = await db.run(SELECT.one.from(VendorProvisioning).where({ bp }));
      if (!vendor || !vendor.email) return res.status(400).json({ error: 'Vendor not found or no email on file' });

      // TODO: Call IAS SCIM API to create user
      // POST {IAS_URL}/scim/v2/Users { userName: vendor.email, emails: [...], customAttribute: { vendorId: bp } }
      // TODO: Call XSUAA Management API to assign VENDOR role collection
      // PUT {XSUAA_URL}/Groups/{vendorGroupId}/members { value: iasUserId }

      await db.run(UPDATE(VendorProvisioning).set({ iasStatus: 'pending', provisionedAt: new Date().toISOString() }).where({ bp }));
      res.json({ ok: true, message: 'IAS user created and activation email sent (stub)' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: BRM user list ─────────────────────────────────────────
  // GET /api/admin/brmUsers — returns BRM users with their current UserScopes
  cds.app.get('/api/admin/brmUsers', async (req, res) => {
    try {
      const db = await cds.connect.to('db');
      const { UserScopes } = db.entities('vendor.portal');
      const scopeRows = await db.run(SELECT.from(UserScopes));

      // TODO: fetch real user list from SAP API_BUSINESSUSER or maintain a BrmUsers table
      // For now, return scopes so the frontend can merge with its own user list
      const byUser = {};
      scopeRows.forEach(r => {
        if (!byUser[r.userId]) byUser[r.userId] = {};
        byUser[r.userId][r.companyCode] = JSON.parse(r.roles || '[]');
      });
      res.json(byUser);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/admin/assignBrmRole — assigns XSUAA parent role collection to a BRM user
  cds.app.post('/api/admin/assignBrmRole', express.json(), async (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email) return res.status(400).json({ error: 'email is required' });
      // TODO: Call XSUAA Management API
      // PUT {XSUAA_URL}/Groups/{roleGroupId}/members with SCIM user reference
      console.log(`[admin] assignBrmRole: email=${email} role=${role}`);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/admin/saveScopes — persists role matrix to UserScopes HANA table
  cds.app.post('/api/admin/saveScopes', express.json({ limit: '1mb' }), async (req, res) => {
    try {
      const { scopes } = req.body; // [{ userId, cc, roles[] }]
      if (!Array.isArray(scopes)) return res.status(400).json({ error: 'scopes array required' });
      const db = await cds.connect.to('db');
      const { UserScopes } = db.entities('vendor.portal');
      const now = new Date().toISOString();
      await Promise.all(scopes.map(async ({ userId, cc, roles }) => {
        const existing = await db.run(SELECT.one.from(UserScopes).where({ userId, companyCode: cc }));
        if (existing) {
          await db.run(UPDATE(UserScopes).set({ roles: JSON.stringify(roles), updatedAt: now }).where({ userId, companyCode: cc }));
        } else {
          await db.run(INSERT.into(UserScopes).entries({ userId, companyCode: cc, roles: JSON.stringify(roles), updatedAt: now }));
        }
        // TODO: Call XSUAA API to sync role collection membership for each CC
      }));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});
