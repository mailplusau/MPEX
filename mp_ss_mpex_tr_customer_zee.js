/*
 * Module Description
 * NSVersion    Date                Author         
 * 1.00         2020-04-30 16:38:00 Raphael
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-13 16:24:00
 *
 * @Description: Scheduled script to transfer the Customer Product Stock records from a customer or a franchisee to another.
 *
 */
var adhoc_inv_deploy = 'customdeploy_ss_mpex_tr_customer_zee';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function transferCustomerProductRecords() {

    var old_customer_id = ctx.getSetting('SCRIPT', 'custscript_old_customer_id');
    var old_zee_id = ctx.getSetting('SCRIPT', 'custscript_old_zee_id');
    var new_customer_id = ctx.getSetting('SCRIPT', 'custscript_new_customer_id');
    var new_zee_id = ctx.getSetting('SCRIPT', 'custscript_new_zee_id2');
    var transfertype = ctx.getSetting('SCRIPT', 'custscript_transfertype');
    var status_filter = JSON.parse(ctx.getSetting('SCRIPT', 'custscript_status_filter'));
    var timestamp = ctx.getSetting('SCRIPT', 'custscript_timestamp');

    var count = 0;

    var resultCustomerProductSet = loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype, status_filter);
    resultCustomerProductSet.forEachResult(function (searchCustomerProductResult) {

        var usage_loopstart_cust = ctx.getRemainingUsage();
        if ((usage_loopstart_cust < 200) || (count == 3999)) {
            var params = {
                custscript_old_customer_id: old_customer_id,
                custscript_old_zee_id: old_zee_id,
                custscript_new_customer_id: new_customer_id,
                custscript_new_zee_id2: new_zee_id,
                custscript_transfertype: transfertype,
                custscript_status_filter: JSON.stringify(status_filter),
                custscript_timestamp: timestamp
            }

            reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
            nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
            if (reschedule == false) {
                return false;
            }
        }

        var barcode_id = searchCustomerProductResult.getValue('internalid');

        // Modify Customer Product Stock record.
        var customerProductRecord = nlapiLoadRecord('customrecord_customer_product_stock', barcode_id);
        var customer_product_status = customerProductRecord.getFieldValue('custrecord_cust_prod_stock_status');
        var customer_product_id = customerProductRecord.getFieldValue('custrecord_prod_stock_prod_order');
        if (transfertype === "customer") {
            customerProductRecord.setFieldValue('custrecord_cust_prod_stock_customer', new_customer_id);
        }
        customerProductRecord.setFieldValue('custrecord_cust_prod_stock_zee', new_zee_id);
        nlapiSubmitRecord(customerProductRecord);

        // Modify Product Order record if applicable.
        if (customer_product_status == "7") {
            var productOrderRecord = nlapiLoadRecord('customrecord_mp_ap_product_order', customer_product_id);
            if (transfertype === "customer") {
                productOrderRecord.setFieldValue('custrecord_ap_order_customer', new_customer_id);
            }
            productOrderRecord.setFieldValue('custrecord_mp_ap_order_franchisee', new_zee_id);
            nlapiSubmitRecord(productOrderRecord);
        }

        // Update the JSON record
        var record_name = '';
        switch (transfertype) {
            case "customer":
                var old_customer_name = nlapiLoadRecord('customer', old_customer_id).getFieldValue('altname');
                var new_customer_name = nlapiLoadRecord('customer', new_customer_id).getFieldValue('altname');
                old_customer_name = nameToCode(old_customer_name);
                new_customer_name = nameToCode(new_customer_name);
                record_name = old_customer_name + '_' + new_customer_name + '_' + timestamp;
                break;
            case "zee":
                var old_zee_name = nlapiLoadRecord('partner', old_zee_id).getFieldValue('companyname');
                var new_zee_name = nlapiLoadRecord('partner', new_zee_id).getFieldValue('companyname');
                old_zee_name = nameToCode(old_zee_name);
                new_zee_name = nameToCode(new_zee_name);
                record_name = old_zee_name + '_' + new_zee_name + '_' + timestamp;
                break;
        }

        // Create or load an MPEX transfer record
        var mpexJSONSearch = nlapiLoadSearch('customrecord_mpex_tr_customer_zee', 'customsearch_mpex_tr_customer_zee');
        var newFilterExpression = [["name", "startswith", record_name]];
        mpexJSONSearch.setFilterExpression(newFilterExpression);
        var mpexJSONSearchResultSet = mpexJSONSearch.runSearch();
        // One field can store an array of approximately 120 000 barcodes id, so we shouldn't need to load more records.
        var resultsMpexJSON = mpexJSONSearchResultSet.getResults(0, 1);
        nlapiLogExecution('DEBUG', 'resultsMpexJSON', resultsMpexJSON);
        var mpexResult = resultsMpexJSON[0];
        nlapiLogExecution('DEBUG', 'mpexResult', mpexResult);
        if (mpexResult === undefined) {
            nlapiLogExecution('DEBUG', 'Part of if entered', '1');
            var mpexRecord = nlapiCreateRecord('customrecord_mpex_tr_customer_zee');
            mpexRecord.setFieldValue('name', record_name);
            var json_record_as_string = JSON.stringify({ 'barcodes_internal_id': [] });
        } else {
            nlapiLogExecution('DEBUG', 'Part of if entered', '2');
            var mpex_record_id = mpexResult.getId();
            nlapiLogExecution('DEBUG', 'mpex_record_id', mpex_record_id);
            var mpexRecord = nlapiLoadRecord('customrecord_mpex_tr_customer_zee', mpex_record_id);
            json_record_as_string = mpexRecord.getFieldValue('custrecord_json2');
        }
        //

        json_record = JSON.parse(json_record_as_string);
        json_record.barcodes_internal_id.push(barcode_id);
        json_record_as_string = JSON.stringify(json_record);
        mpexRecord.setFieldValue('custrecord_json2', json_record_as_string);
        nlapiSubmitRecord(mpexRecord);
        //

        count++;
        nlapiLogExecution('DEBUG', 'nb_records_changed', count);
        nlapiLogExecution('DEBUG', 'CPS id', barcode_id);

        return true;
    });
    return true;
}

function loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype, status_filter) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock_4');
    var customerFilterExpression = [["custrecord_cust_prod_stock_customer", "is", old_customer_id], 'AND'];
    var zeeFilterExpression = [["custrecord_cust_prod_stock_zee", "is", old_zee_id], 'AND'];
    customerFilterExpression.push(status_filter);
    zeeFilterExpression.push(status_filter);
    switch (transfertype) {
        case "customer":
            nlapiLogExecution('DEBUG', 'load_CPS_search_customerFilterExpression', customerFilterExpression);
            customerProductStockSearch.setFilterExpression(customerFilterExpression);
            break;
        case "zee":
            nlapiLogExecution('DEBUG', 'load_CPS_search_zeeFilterExpression', zeeFilterExpression);
            customerProductStockSearch.setFilterExpression(zeeFilterExpression);
            break;
    }
    var resultCustomerProductSet = customerProductStockSearch.runSearch();
    return resultCustomerProductSet;
}

function nameToCode(string) {
    return string.toLowerCase().trim().split(' - ').join('_').split(' ').join('_');
}
