const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
  srv.on('whoami', req => {
    const u = req.user;
    let role = 'brm';
    if (u.is('Director')) role = 'director';
    else if (u.is('Approver')) role = 'approver';
    else if (u.is('Vendor')) role = 'vendor';
    const attrs = u.attr || {};
    const vendorId = (Array.isArray(attrs.vendorId) ? attrs.vendorId[0] : attrs.vendorId) || null;
    const email = u.id || '';
    return { id: email, email, name: email, role, vendorId };
  });

  // Seed initial data on first boot when tables are empty
  cds.on('served', async () => {
    try {
      const db = await cds.connect.to('db');
      const { Invoices, Quotations, RFQs } = db.entities('vendor.portal');
      const row = await db.run(SELECT.one.from(Invoices).columns('count(*) as n'));
      if (parseInt(row?.n ?? '0') > 0) return;

      const { seedInvoices, seedQuotations, seedRfqs } = require('./seed-data');
      console.log('[seed] Tables empty — seeding initial data…');
      if (seedInvoices.length)   await db.run(INSERT.into(Invoices).entries(seedInvoices));
      if (seedQuotations.length) await db.run(INSERT.into(Quotations).entries(seedQuotations));
      if (seedRfqs.length)       await db.run(INSERT.into(RFQs).entries(seedRfqs));
      console.log(`[seed] Done — ${seedInvoices.length} invoices, ${seedQuotations.length} quotations, ${seedRfqs.length} RFQs`);
    } catch (e) {
      console.error('[seed] Seed failed:', e.message);
    }
  });
});
