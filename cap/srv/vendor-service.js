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
          url: `${baseUrl}/A_SupplierBankAccount?$filter=Supplier eq '${vendorId}'`,
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

  // ── Startup: clear mock seed data on BTP ───────────────────────────
  cds.on('served', async () => {
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
