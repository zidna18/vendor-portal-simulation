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

  // Vendor master data fetched live from SAP S/4HANA via BTP Destination 'S4HC'
  // banks / lfb1 / lfm1 are JSON strings (parse on frontend)
  type VendorMasterResult {
    id         : String;
    name       : String;
    tax        : String;
    addr       : String;
    phone      : String;
    fax        : String;
    email      : String;
    cat        : String;
    since      : String;
    rep        : String;
    status     : String;
    website    : String;
    pkp        : String;
    taxStatus  : String;
    certExpiry : String;
    npwpAddress: String;
    banks      : String;
    lfb1       : String;
    lfm1       : String;
  }
  function vendorMaster(vendorId: String) returns VendorMasterResult;
}
