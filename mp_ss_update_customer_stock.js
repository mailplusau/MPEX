/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-04-11 12:25:19   		ankith.ravindran
 *
 * Description: Update the Customer Stock Level        
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-10-06 10:43:22
 *
 */

var usage_threshold = 50; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

var barcodes_prefix = ['mpeb', 'mpec', 'mped', 'mpen', 'mpet', 'mpef', 'mpeg'];
var barcodes_prefix_status = [0, 0, 0, 0, 0, 0, 0];

function main() {


    nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock'));
    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }

    /**
     * SEARCH: MPEX - Update Customer Stock
     */
    var prodStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_prod_stock_per_customer_2_2');
    var resultProdStock = prodStockSearch.runSearch();

    var old_customer_id = null;
    var product_order_id;
    var stock_mped = false

    resultProdStock.forEachResult(function(searchResult) {

        var usage_loopstart_cust = ctx.getRemainingUsage();
  
        var customer_id = searchResult.getValue("custrecord_cust_prod_stock_customer", null, "GROUP");
        var barcode_beg = searchResult.getValue("custrecord_ap_item_sku", "CUSTRECORD_CUST_STOCK_PROD_NAME", "GROUP");
        var product_count = searchResult.getValue("name", null, "COUNT");

        var index = barcodes_prefix.indexOf(barcode_beg.toLowerCase());
        if (index > -1) {
            barcodes_prefix_status[index] = 1;
        }

        var field = 'custentity_' + barcode_beg.toLowerCase();

        if (!isNullorEmpty(old_customer_id) && old_customer_id != customer_id) {
            updateCustomer(old_customer_id, barcodes_prefix, barcodes_prefix_status);
            var params = {
                custscript_prev_deploy_update_stock: ctx.getDeploymentId(),
            }

            reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
            nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
            if (reschedule == false) {

                return false;
            }
        }

        var customer_record = nlapiLoadRecord('customer', customer_id);
        customer_record.setFieldValue(field, product_count);

        nlapiSubmitRecord(customer_record);

        old_customer_id = customer_id;

        return true;
    });

    if (!isNullorEmpty(old_customer_id)) {
        updateCustomer(old_customer_id, barcodes_prefix, barcodes_prefix_status);
    }
}

/**
 * @old_customer_id  {Customer ID}
 * @barcodes_prefix  {Array of Barcode prefix}
 * @barcodes_prefix_status  {Array}
 * @return None
 */
function updateCustomer(old_customer_id, barcodes_prefix, barcodes_prefix_status) {
    var customer_record = nlapiLoadRecord('customer', old_customer_id);
    customer_record.setFieldValue('custentity_mpex_usage_update', 1);
    for (var x = 0; x < barcodes_prefix_status.length; x++) {
        if (barcodes_prefix_status[x] == 0) {
            var field = 'custentity_' + barcodes_prefix[x];
            customer_record.setFieldValue(field, 0);
        }
    }
    customer_record.setFieldValue('custentity_mpex_usage_update', 1);

    nlapiSubmitRecord(customer_record);
}