/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-22 11:29:00 Raphael
 *
 * Description: Scheduled script used to reallocate invoiced barcodes who were allocated to the wrong customer. 
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-27 15:16:00
 *
 */
var adhoc_inv_deploy = 'customdeploy_ss_reallocate_barcodes';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function reallocateBarcodes() {

    var invoice_id = ctx.getSetting('SCRIPT', 'custscript_invoice_id');
    var customer_id = ctx.getSetting('SCRIPT', 'custscript_customer_id2');
    var zee_id = ctx.getSetting('SCRIPT', 'custscript_zee_id2');
    var timestamp = ctx.getSetting('SCRIPT', 'custscript_timestamp2');

    var count = 0;

    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');
    var filterExpression = [["custrecord_cust_prod_stock_status", "is", "6"], 'AND', ["custrecord_prod_stock_invoice", "is", invoice_id], 'AND', ["isinactive", "is", 'F']];
    customerProductStockSearch.setFilterExpression(filterExpression);
    var resultCustomerProductSet = customerProductStockSearch.runSearch();

    resultCustomerProductSet.forEachResult(function (searchCustomerProductResult) {

        var usage_loopstart_cust = ctx.getRemainingUsage();
        if ((usage_loopstart_cust < 200) || (count == 3999)) {
            var params = {
                custscript_invoice_id: invoice_id,
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

        var barcode_id = searchCustomerProductResult.getValue('internalid');

        // Inactivate Customer Product Stock record.
        var customerProductRecord = nlapiLoadRecord('customrecord_customer_product_stock', barcode_id);
        var barcode_name = customerProductRecord.getFieldValue('name');
        nlapiLogExecution('DEBUG', 'barcode_name initial record', barcode_name);
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

        // Update the JSON record
        var record_name = 'inv_id_' + invoice_id + '_ts_' + timestamp;

        // Create or load an MPEX transfer record to store the list of the barcodes ID.
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

        json_record = JSON.parse(json_record_as_string);
        json_record.barcodes_internal_id.push(new_barcode_id);
        json_record_as_string = JSON.stringify(json_record);
        mpexRecord.setFieldValue('custrecord_json2', json_record_as_string);
        nlapiSubmitRecord(mpexRecord);

        count++;
        nlapiLogExecution('DEBUG', 'nb_records_changed', count);
        nlapiLogExecution('DEBUG', 'Old CPS id', barcode_id);
        nlapiLogExecution('DEBUG', 'New CPS id', new_barcode_id);

        return true;
    });
    return true;
}
