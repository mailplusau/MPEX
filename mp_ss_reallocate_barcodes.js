/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-22 11:29:00 Raphael
 *
 * Description: Scheduled script used to reallocate inactivate barcodes who were allocated to the wrong customer.
 *              The barcodes are then duplicated and allocated to another customer.
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2021-01-21 13:58:21
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
    nlapiLogExecution('DEBUG', 'record_name', record_name);

    // Load MPEX transfer record
    var mpexJSONSearch = nlapiLoadSearch('customrecord_mpex_tr_customer_zee', 'customsearch_mpex_tr_customer_zee');
    var nameFilterExpression = [['custrecord_name', 'is', record_name]];
    mpexJSONSearch.setFilterExpression(nameFilterExpression);
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

        nlapiLogExecution('DEBUG', 'barcode_id', barcode_id);

        /** -------------------------------------------------------------------------------------------------------------------------------
        *   Function to either remove line items or set product order void when barcodes have been selected
        *   Changes By: Anesu - 17/08/20
        *   -------------------------------------------------------------------------------------------------------------------------------
        */
        var customerProductStockRecord = nlapiLoadRecord('customrecord_customer_product_stock', barcode_id); // barcode_id
        var product_order_id = customerProductStockRecord.getFieldValue('custrecord_prod_stock_prod_order');
        var barcode_name = customerProductStockRecord.getFieldValue('name'); // Display Barcode Name

        var stockLineItemSearch = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_ap_line_item_product_order'); //customsearch3366 or customsearch_ap_line_item_product_order
        var filter_product_order = ['custrecord_ap_product_order', 'anyOf', product_order_id]; // Filter by Product Order
        var filterExp = [filter_product_order, 'AND', ['isinactive', 'is', 'F']]; // Filter Expression
        stockLineItemSearch.setFilterExpression(filterExp);
        var resultStockLineItemSearch = stockLineItemSearch.runSearch(); // Run Search
        var resultSetLineItem = resultStockLineItemSearch.getResults(0, 1000);

        if (resultSetLineItem.length > 0){
            resultSetLineItem.forEach(function (searchLineItem) { // For each line item in product order
                var searchResult_id = searchLineItem.getValue('internalid'); // Get ID of search items
                var line_item = nlapiLoadRecord('customrecord_ap_stock_line_item', searchResult_id); // Load Line Item record
                var line_item_name = line_item.getFieldValue('custrecord_ap_line_item_inv_details'); // Line Item which contains barcode name
                if (line_item_name.slice(16, 26) == barcode_name){
                    line_item.setFieldValue('isinactive', 'T'); // Set Value of inactive to True
                    nlapiSubmitRecord(line_item); // Record Submission.
                }
                return true;
            });
        }
        resultStockLineItemSearch = stockLineItemSearch.runSearch();
        resultSetLineItem = resultStockLineItemSearch.getResults(0, 1000);
        if (resultSetLineItem.length == 0){
            var customerProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', product_order_id); //product_order_id or 1688870
            customerProductOrder.setFieldValue('custrecord_mp_ap_order_order_status', '5'); // Set Status field to Void
            nlapiSubmitRecord(customerProductOrder); // Record Submission
        } 
        /** End Delete Function
         * ------------------------------------------------------------------------------------------------------------------------------- */

        // Inactivate Customer Product Stock record.
        var customerProductRecord = nlapiLoadRecord('customrecord_customer_product_stock', barcode_id);
        // var barcode_name = customerProductRecord.getFieldValue('name');
        customerProductRecord.setFieldValue('isinactive', 'T');
        nlapiSubmitRecord(customerProductRecord);

        // Create new Customer Product Stock record and copy fields.
        var copyCustomerProductRecord = nlapiCopyRecord('customrecord_customer_product_stock', barcode_id, null);
        copyCustomerProductRecord.setFieldValue('name', barcode_name);
        copyCustomerProductRecord.setFieldValue('isinactive', 'F');
        copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
        copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
        var final_delivery = copyCustomerProductRecord.getFieldValue('custrecord_cust_prod_stock_final_del');
        if(isNullorEmpty(final_delivery)){
            copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_status', 5);
        } else {
            copyCustomerProductRecord.setFieldValue('custrecord_cust_prod_stock_status', final_delivery);
        }
        
        copyCustomerProductRecord.setFieldValue('custrecord_prod_stock_prod_order', '');
        copyCustomerProductRecord.setFieldValue('custrecord_prod_stock_invoice', '');
        var new_barcode_id = nlapiSubmitRecord(copyCustomerProductRecord);

        count++;

        return true;
    });
    return true;
}