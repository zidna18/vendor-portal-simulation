using vendor.portal as db from '../db/schema';

@requires: 'authenticated-user'
service VendorPortal @(path: '/api/VendorPortal') {
  entity Invoices   as projection on db.Invoices;
  entity Quotations as projection on db.Quotations;
  entity RFQs       as projection on db.RFQs;

  type WhoAmIResult {
    id      : String;
    email   : String;
    name    : String;
    role    : String;
    vendorId: String;
  }
  function whoami() returns WhoAmIResult;
}
