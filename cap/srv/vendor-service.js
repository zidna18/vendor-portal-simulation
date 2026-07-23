const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
  // Temporary email→vendorId map until vendor master sync UI is built
  const VENDOR_MAP = {
    'zidna.q.tsaqila@accenture.com': '2100000010',
  };

  // ── whoami ──────────────────────────────────────────────────────────
  srv.on('whoami', req => {
    const u = req.user;
    let role = 'brm';
    if (u.is('Director')) role = 'director';
    else if (u.is('Approver')) role = 'approver';
    else if (u.is('Vendor')) role = 'vendor';
    const attrs = u.attr || {};
    const email = u.id || '';
    const vendorId = (Array.isArray(attrs.vendorId) ? attrs.vendorId[0] : attrs.vendorId)
      || VENDOR_MAP[email]
      || null;
    return { id: email, email, name: email, role, vendorId };
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
  srv.on('purchaseOrders', async req => {
    const { vendorId } = req.data;
    if (!vendorId) return req.error(400, 'vendorId is required');

    let executeHttpRequest;
    try {
      ({ executeHttpRequest } = require('@sap-cloud-sdk/http-client'));
    } catch (e) {
      return req.error(503, 'SAP Cloud SDK not available: ' + e.message);
    }

    const dest = { destinationName: process.env.S4HC_DESTINATION || 'S4HC' };
    const hdrsV4 = { Accept: 'application/json', 'sap-client': process.env.S4HC_CLIENT || '120' };
    try {
      const res = await executeHttpRequest(dest, {
        method: 'GET',
        url: `/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/PurchaseOrder?$filter=Supplier eq '${vendorId}'&$top=100`,
        headers: hdrsV4,
      });
      const rows = res.data?.value || [];
      if (rows.length > 0) console.log('[purchaseOrders] V4 sample row keys:', Object.keys(rows[0]).join(','));
      else console.log('[purchaseOrders] V4 returned 0 rows for vendorId:', vendorId);
      return rows.map(r => ({
        po:          r.PurchaseOrder || r.PurchasingDocument || '',
        companyCode: r.CompanyCode || '',
        supplier:    r.Supplier || r.SupplierAddressID || '',
        currency:    r.DocumentCurrency || r.PurchaseOrderCurrency || 'IDR',
        netAmount:   String(r.NetAmount || r.TotalNetAmount || r.NetOrderValue || '0'),
        poDate:      r.CreationDate || r.PurchaseOrderDate || '',
        description: r.PurchaseOrderType || r.PurchaseOrderLongText || '',
        plant:       r.Plant || '',
        purchOrg:    r.PurchasingOrganization || '',
      }));
    } catch (e) {
      const status = e.response?.status;
      const body = JSON.stringify(e.response?.data)?.slice(0, 300) || '';
      console.error(`[purchaseOrders] SAP API failed: HTTP ${status} — ${e.message} — body: ${body}`);
      return req.error(502, `SAP API HTTP ${status}: ${e.message}`);
    }
  });

  // ── purchaseOrderItems ──────────────────────────────────────────────
  // Fetches real PO line items + GR amounts from SAP (SAP_COM_0053).
  // DP amounts require SAP_COM_0002 (Journal Entry API) — returns 0 until configured.
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
    const base = `/sap/opu/odata/SAP/API_PURCHASEORDER_PROCESS_SRV`;

    // Build OData filter for multiple POs
    const poFilter = poList.map(p => `PurchaseOrder eq '${p}'`).join(' or ');

    let items = [], v4Items = {};
    try {
      // V2: expand to_ScheduleLine to get delivered quantities for GR amount
      // V4: NetAmount (PO amount directly), IsCompletelyDelivered flag
      const hdrsV4 = { Accept: 'application/json', 'sap-client': process.env.S4HC_CLIENT || '120' };
      const v4ItemFilter = poList.map(p => `PurchaseOrder eq '${p}'`).join(' or ');
      const [itemRes, v4Res] = await Promise.all([
        executeHttpRequest(dest, {
          method: 'GET',
          url: `${base}/A_PurchaseOrderItem?$filter=${poFilter}&$expand=to_ScheduleLine`,
          headers: hdrs,
        }),
        executeHttpRequest(dest, {
          method: 'GET',
          url: `/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/PurchaseOrderItem?$filter=${v4ItemFilter}`,
          headers: hdrsV4,
        }).catch(e => { console.warn('[poItems] V4 item unavailable:', e.message); return null; }),
      ]);

      items = itemRes.data?.d?.results || itemRes.data?.value || [];

      const rawV4 = v4Res ? (v4Res.data?.value || []) : [];
      if (rawV4.length > 0) {
        rawV4.forEach(r => { v4Items[`${r.PurchaseOrder}/${r.PurchaseOrderItem}`] = r; });
      }
    } catch (e) {
      const status = e.response?.status;
      const body = JSON.stringify(e.response?.data)?.slice(0, 300) || '';
      console.error(`[poItems] SAP API failed: HTTP ${status} — ${e.message} — ${body}`);
      return req.error(502, `SAP API HTTP ${status}: ${e.message}`);
    }

    return items.map(r => {
      const key = `${r.PurchaseOrder}/${r.PurchaseOrderItem}`;
      const v4   = v4Items[key];

      // PO Amount: use V4 NetAmount directly (confirmed available); fallback to calculation
      const orderQty = parseFloat(r.OrderQuantity    || '0');
      const netPrice = parseFloat(r.NetPriceAmount   || '0');
      const priceQty = parseFloat(r.NetPriceQuantity || '1') || 1;
      const poAmount = v4 ? parseFloat(v4.NetAmount || '0') : netPrice / priceQty * orderQty;

      // DP Amount: directly on V2 item (DownPaymentAmount confirmed in response)
      const dpAmount = parseFloat(r.DownPaymentAmount || '0');

      // GR Amount: IsCompletelyDelivered=true → full PO amount; otherwise
      // try V4 schedule line delivered qty (richer than V2), then V2 schedule lines
      let grAmount = 0;
      if (v4?.IsCompletelyDelivered === true) {
        grAmount = poAmount;
      } else {
        // V4 schedule lines (expanded via _ScheduleLine)
        const v4Sls = v4?._ScheduleLine?.value || v4?._ScheduleLine || [];
        const v4DeliveredQty = v4Sls.reduce((sum, sl) => {
          return sum + parseFloat(
            sl.ScheduleLineDeliveredQtyInOrdUnit ?? sl.DeliveredQuantity ??
            sl.QuantityDelivered ?? sl.GoodsReceiptQty ?? '0'
          );
        }, 0);
        if (v4DeliveredQty > 0) {
          grAmount = v4DeliveredQty * (netPrice / priceQty);
        } else {
          // Fallback: V2 schedule lines
          const v2Sls = r.to_ScheduleLine?.results || [];
          const v2DeliveredQty = v2Sls.reduce((sum, sl) => {
            return sum + parseFloat(
              sl.ScheduleLineDeliveredQtyInOrdUnit ?? sl.DeliveredQuantity ?? sl.QuantityDelivered ?? '0'
            );
          }, 0);
          if (v2DeliveredQty > 0) grAmount = v2DeliveredQty * (netPrice / priceQty);
        }
      }

      return {
        po:        r.PurchaseOrder || '',
        item:      r.PurchaseOrderItem || '',
        material:  r.Material || '',
        desc:      r.PurchaseOrderItemText || '',
        qty:       String(orderQty),
        uom:       r.PurchaseOrderQuantityUnit || '',
        unitPrice: String(netPrice / priceQty),
        poAmount:  String(poAmount),
        grAmount:  String(grAmount),
        dpAmount:  String(dpAmount),
        currency:  r.DocumentCurrency || 'IDR',
        plant:     r.Plant || '',
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
                headers: { ...hdrs, 'x-csrf-token': 'Fetch' },
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
});
