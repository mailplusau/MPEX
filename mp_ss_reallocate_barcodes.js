/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-22 11:29:00 Raphael
 *
 * Description: Scheduled script used to reallocate inactivate barcodes who were allocated to the wrong customer.
 *              The barcodes are then duplicated and allocated to another customer.
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-06-02 14:09:00
 *
 */
var adhoc_inv_deploy = 'customdeploy_ss_reallocate_barcodes';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function reallocateBarcodes() {

    var selector_id = ctx.getSetting('SCRIPT', 'custscript_selector_id');
    var selector_type = ctx.getSetting('SCRIPT', 'custscript_selector_type');
    var customer_id = ctx.getSetting('SCRIPT', 'custscript_customer_id2');
    var zee_id = ctx.getSetting('SCRIPT', 'custscript_zee_id2');
    var timestamp = ctx.getSetting('SCRIPT', 'custscript_timestamp2');

    var count = 0;

    // Get MPEX transfer record name
    switch (selector_type) {
        case 'invoice_number':
            var record_name = 'inv_id_' + selector_id + '_ts_' + timestamp;
            break;

        case 'barcode_number':
            var record_name = 'barcode_id_' + selector_id + '_ts_' + timestamp;
            break;

        case 'product_order_id':
            var record_name = 'po_id_' + selector_id + '_ts_' + timestamp;
            break;
    }

    // Load MPEX transfer record
    var mpexJSONSearch = nlapiLoadSearch('customrecord_mpex_tr_customer_zee', 'customsearch_mpex_tr_customer_zee');
    var newFilterExpression = [["name", "startswith", record_name]];
    mpexJSONSearch.setFilterExpression(newFilterExpression);
    var mpexJSONSearchResultSet = mpexJSONSearch.runSearch();
    var resultsMpexJSON = mpexJSONSearchResultSet.getResults(0, 1);
    var mpexResult = resultsMpexJSON[0];
    var mpex_record_id = mpexResult.getId();
    var mpexRecord = nlapiLoadRecord('customrecord_mpex_tr_customer_zee', mpex_record_id);

    // Load barcodes internal ids
    var json_record_as_string = mpexRecord.getFieldValue('custrecord_json2');
    var json_record = JSON.parse(json_record_as_string);
    var barcodes_records_id_list = json_record.barcodes_internal_id;

    // Load the result set of the active barcodes records that should be duplicated.
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');
    var barcodesFilter = ["internalid", "anyOf"];
    barcodesFilter.push(barcodes_records_id_list);
    var filterExpression = [barcodesFilter,
        'AND',
        ["isinactive", "is", 'F']];
    customerProductStockSearch.setFilterExpression(filterExpression);
    var resultCustomerProductSet = customerProductStockSearch.runSearch();

    resultCustomerProductSet.forEachResult(function (searchCustomerProductResult) {

        var usage_loopstart_cust = ctx.getRemainingUsage();
        if ((usage_loopstart_cust < 200) || (count == 3999)) {
            var params = {
                custscript_selector_id: selector_id,
                custscript_selector_type: selector_type,
                custscript_customer_id2: customer_id,
                custscript_zee_id2: zee_id,
                custscript_timestamp: timestamp
            }

            reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
            nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
            if (reschedule == false) {
                return false;
            }
        }

        if (selector_type == 'barcode_number') {
            var barcode_id = selector_id;
        } else {
            var barcode_id = searchCustomerProductResult.getValue('internalid');
        }

        // Inactivate Customer Product Stock record.
        var customerProductRecord = nlapiLoadRecord('customrecord_customer_product_stock', barcode_id);
        var barcode_name = customerProductRecord.getFieldValue('name');
        customerProductRecord.setFieldValue('isinactive', 'T');
        nlapiSubmitRecord(customerProductRecord);

        // Create new Customer Product Stock record and copy fields.
        var copyCustomerProductRecord = nlapiCopyRecord('customrecord_customer_product_stock', barcode_id, null);
        copyCustomerProductRecord.setFieldValue('name', barcode_name);
        copyCustomerProductRecord.setFieldValue('isinactive', 'F');
        copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
        copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
        var final_delivery = copyCustomerProductRecord.getFieldValue('custrecord_cust_prod_stock_final_del');
        copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_status', final_delivery);
        copyCustomerProductRecord.setFieldValue('custrecord_prod_stock_prod_order', '');
        copyCustomerProductRecord.setFieldValue('custrecord_prod_stock_invoice', '');
        var new_barcode_id = nlapiSubmitRecord(copyCustomerProductRecord);

        count++;

        return true;
    });
    return true;
}
