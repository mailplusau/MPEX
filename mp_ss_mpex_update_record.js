/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-08-05 11:40:56         Ankith
 *
 * Description: Update the new fields based on the product name        
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-08-07 09:03:40
 *
 */

var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

    nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_create_prod_order'));

    prev_inv_deploy = ctx.getDeploymentId();


    /**
     * MPEX - Update Record Fields
     */
    var createProdOrderSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_mpex_update_record_fields');
    var resultCreateProdOrder = createProdOrderSearch.runSearch();

    var old_customer_id = null;
    var product_order_id;
    var count = 0;

    /**
     * Go through each line item from the search. 
     */
    resultCreateProdOrder.forEachResult(function(searchResult) {
        var internalid = searchResult.getValue("internalid");
        var prod_name = searchResult.getValue("custrecord_cust_stock_prod_name");
        var SP_MP= searchResult.getValue("custrecord_ap_item_standard_mp_rate", "CUSTRECORD_CUST_STOCK_PROD_NAME", null);
        var SP_TOLL = searchResult.getValue("custrecord_ap_item_standard_toll_rate", "CUSTRECORD_CUST_STOCK_PROD_NAME", null);
        var direct_TOLL = searchResult.getValue("custrecord_ap_item_direct_toll_rate", "CUSTRECORD_CUST_STOCK_PROD_NAME", null);
        var direct_MP= searchResult.getValue("custrecord_ap_item_direct_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null);

        nlapiLogExecution('DEBUG', 'internalid', internalid)

        var mpexRecord = nlapiLoadRecord('customrecord_customer_product_stock', internalid);
        mpexRecord.setFieldValue('custrecord_mpex_standard_mp_rate', SP_MP);
        mpexRecord.setFieldValue('custrecord_mpex_standard_toll_rate', SP_TOLL);
        mpexRecord.setFieldValue('custrecord_cust_prod_stock_direct_toll', direct_TOLL);
        mpexRecord.setFieldValue('custrecord_cust_prod_stock_direct_mp', direct_MP);
        nlapiSubmitRecord(mpexRecord);

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
        nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
        if (reschedule == false) {

            return false;
        }

        return true;

    })
}