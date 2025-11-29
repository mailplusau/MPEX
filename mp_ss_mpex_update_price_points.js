/**
 * Module Description
 *
 * NSVersion    Date                        Author
 * 1.00         2020-07-31 12:31:01         Ankith
 *
 * Description:Schedule Script to update the MPEX current price points with the new price points
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2021-11-01T09:00:42+11:00
 *
 */

var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

/**
 * [updateMPEXCurrentPricePoints description]
 */
function updateMPEXCurrentPricePoints() {

  /**
   * Search: MPEX Price Point - Customer List - Update Current Pricing
   */
  var mpexPricingCustomerList = nlapiLoadSearch('customer',
    'customsearch_mpex_price_point_customer_7');
  var resultSetMpexPricing = mpexPricingCustomerList.runSearch();

  resultSetMpexPricing.forEachResult(function(searchResult) {


    var custid = searchResult.getValue("internalid");
    var entityid = searchResult.getValue("entityid");
    var zee_id = searchResult.getValue("partner");
    var companyname = searchResult.getValue("companyname");
    var mpex_1kg = searchResult.getValue("custentity_mpex_1kg_price_point");
    var mpex_3kg = searchResult.getValue("custentity_mpex_3kg_price_point");
    var mpex_5kg = searchResult.getValue("custentity_mpex_5kg_price_point");
    var mpex_500g = searchResult.getValue(
      "custentity_mpex_500g_price_point");
    var mpex_b4 = searchResult.getValue("custentity_mpex_b4_price_point");
    var mpex_c5 = searchResult.getValue("custentity_mpex_c5_price_point");
    var mpex_dl = searchResult.getValue("custentity_mpex_dl_price_point");
    var mpex_1kg_new = searchResult.getValue(
      "custentity_mpex_1kg_price_point_new");
    var mpex_3kg_new = searchResult.getValue(
      "custentity_mpex_3kg_price_point_new");
    var mpex_5kg_new = searchResult.getValue(
      "custentity_mpex_5kg_price_point_new");
    var mpex_500g_new = searchResult.getValue(
      "custentity_mpex_500g_price_point_new");
    var mpex_b4_new = searchResult.getValue(
      "custentity_mpex_b4_price_point_new");
    var mpex_c5_new = searchResult.getValue(
      "custentity_mpex_c5_price_point_new");
    var mpex_dl_new = searchResult.getValue(
      "custentity_mpex_dl_price_point_new");

    var customer_record = nlapiLoadRecord('customer', custid);

    customer_record.setFieldValue('custentity_mpex_1kg_price_point',
      mpex_1kg_new);
    customer_record.setFieldValue('custentity_mpex_3kg_price_point',
      mpex_3kg_new);
    customer_record.setFieldValue('custentity_mpex_5kg_price_point',
      mpex_5kg_new);
    customer_record.setFieldValue('custentity_mpex_500g_price_point',
      mpex_500g_new);
    customer_record.setFieldValue('custentity_mpex_b4_price_point',
      mpex_b4_new);
    customer_record.setFieldValue('custentity_mpex_c5_price_point',
      mpex_c5_new);
    customer_record.setFieldValue('custentity_mpex_dl_price_point',
      mpex_dl_new);

    customer_record.setFieldValue('custentity_mpex_1kg_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_3kg_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_5kg_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_500g_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_b4_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_c5_price_point_new',
      null);
    customer_record.setFieldValue('custentity_mpex_dl_price_point_new',
      null);

    customer_record.setFieldValue('custentity_mpex_price_date_update',
      getDate());

    nlapiSubmitRecord(customer_record)

    reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
    nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
    if (reschedule == false) {
      return false;
    }
    return true;
  });

}


/**
 * [Return today's date]
 * @return {[string]} date [description]
 */
function getDate() {
  var date = new Date();
  if (date.getHours() > 6) {
    date = nlapiAddDays(date, 1);
  }
  date = nlapiDateToString(date);

  return date;
}
