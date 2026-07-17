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

  // Clear mock seed data if present — BTP uses real data only
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
