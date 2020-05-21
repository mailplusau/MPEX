/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-14 15:28:00 Raphael
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-21 11:23:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

function pageInit() {
}

var resultSetLength = nlapiGetFieldValue('custpage_result_set_length');
if (!isNullorEmpty(resultSetLength)) {
    var progressBar = setInterval(updateProgressBar, 5000);
}

var recordDataSet = [];
$(document).ready(function () {
    $('#mpex-moved-records').DataTable({
        data: recordDataSet,
        columns: [
            { title: "Barcode Internal ID" },
            { title: "Barcode Name" },
            { title: "Status" },
            { title: "Customer Name" },
            { title: "Franchisee Name" },
            { title: "New contact email" },
            { title: "New operator NS ID" }
        ]
    });
});

function loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype, status_filter) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock_4');
    var customerFilterExpression = [["custrecord_cust_prod_stock_customer", "is", old_customer_id], 'AND'];
    var zeeFilterExpression = [["custrecord_cust_prod_stock_zee", "is", old_zee_id], 'AND'];
    if (isNullorEmpty(status_filter)) {
        var status_filter = loadSelectedStatusFilter();
    }
    customerFilterExpression.push(status_filter);
    zeeFilterExpression.push(status_filter);
    switch (transfertype) {
        case "customer":
            customerProductStockSearch.setFilterExpression(customerFilterExpression);
            break;
        case "zee":
            customerProductStockSearch.setFilterExpression(zeeFilterExpression);
            break;
    }
    var resultCustomerProductSet = customerProductStockSearch.runSearch();
    return resultCustomerProductSet;
}

function loadBarcodesMovedSearch(barcodes_list) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock_4');
    var barcodesFilterExpression = ['internalid', 'anyOf'];
    barcodesFilterExpression = barcodesFilterExpression.concat(barcodes_list);
    customerProductStockSearch.setFilterExpression(barcodesFilterExpression);
    var resultCustomerProductSet = customerProductStockSearch.runSearch();
    return resultCustomerProductSet;
}

function getResultSetLength(resultSet) {
    var currentIndex = 0;
    var totalResultsLength = 0;
    var resultsArray = resultSet.getResults(currentIndex, currentIndex + 1000);
    if (isNullorEmpty(resultsArray)) {
        return 0;
    }
    totalResultsLength += resultsArray.length;
    while (resultsArray.length == 1000) {
        currentIndex += 1000;
        resultsArray = resultSet.getResults(currentIndex, currentIndex + 1000);
        totalResultsLength += resultsArray.length;
    }
    console.log("totalResultsLength in getResultSetLength : ", totalResultsLength);
    return totalResultsLength;
}

function updateProgressBar() {
    var old_customer_id = nlapiGetFieldValue('custpage_old_customer_id');
    var new_customer_id = nlapiGetFieldValue('custpage_new_customer_id');
    var old_zee_id = nlapiGetFieldValue('custpage_old_zee_id');
    var new_zee_id = nlapiGetFieldValue('custpage_new_zee_id');
    var transfertype = nlapiGetFieldValue('custpage_transfertype');
    var status_filter = nlapiGetFieldValue('custpage_status_filter');
    var resultSetLength = nlapiGetFieldValue('custpage_result_set_length');
    var timestamp = nlapiGetFieldValue('custpage_timestamp');
    var contact_email = nlapiGetFieldValue('custpage_contact_email');
    var operator_ns_id = nlapiGetFieldValue('custpage_operator_ns_id');

    console.log("updateProgressBar is running");
    if (!isNullorEmpty(resultSetLength)) {
        status_filter = JSON.parse(status_filter);
        try {
            var resultCustomerProductSet = loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype, status_filter);
            var nb_records_left_to_move = getResultSetLength(resultCustomerProductSet);
            if (nb_records_left_to_move == 0) {
                clearInterval(progressBar);
                $('#progress-records').attr('class', 'progress-bar progress-bar-success');
                // displayMovedBarcodes(new_customer_id, new_zee_id, transfertype);
                displayMovedBarcodes();
            }

            var nb_records_moved = resultSetLength - nb_records_left_to_move;
            var width = parseInt((nb_records_moved / resultSetLength) * 100);

            $('#progress-records').attr('aria-valuenow', nb_records_moved);
            $('#progress-records').attr('style', 'width:' + width + '%');
            $('#progress-records').text('MPEX records moved : ' + nb_records_moved + ' / ' + resultSetLength);
        } catch (e) {
            if (e instanceof nlobjError) {
                if (e.getCode() == "SCRIPT_EXECUTION_USAGE_LIMIT_EXCEEDED") {
                    var params_progress = {
                        custparam_old_customer_id: old_customer_id,
                        custparam_new_customer_id: new_customer_id,
                        custparam_old_zee_id: old_zee_id,
                        custparam_new_zee_id: new_zee_id,
                        custparam_transfertype: transfertype,
                        custparam_status_filter: JSON.stringify(status_filter),
                        custparam_result_set_length: resultSetLength,
                        custparam_timestamp: timestamp,
                        custparam_contact_email: contact_email,
                        custparam_operator_ns_id: operator_ns_id
                    };
                    params_progress = JSON.stringify(params_progress);
                    var reload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_mpex_transferred_records', 'customdeploy_sl_mpex_transferred_records') + '&custparam_params=' + params_progress;
                    window.open(reload_url, "_self");
                }
            }
        }
    }
}

function displayMovedBarcodes() {
    var contact_email = nlapiGetFieldValue('custpage_contact_email');
    var operator_ns_id = nlapiGetFieldValue('custpage_operator_ns_id');

    // Load MPEX transfer record
    var record_name = nlapiGetFieldValue('custpage_record_name');
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
    var barcodes_list = json_record.barcodes_internal_id;
    console.log('barcodes_list : ', barcodes_list);

    // Display the table of barcodes
    var resultCustomerProductSet = loadBarcodesMovedSearch(barcodes_list);
    var recordDataSet = [];
    var slice_index = 0;
    do {
        var resultCustomerProductSlice = resultCustomerProductSet.getResults(slice_index * 1000, (slice_index + 1) * 1000);

        if (isNullorEmpty(resultCustomerProductSlice)) {
            console.log('Wallah y a pas de resultats.');
        }

        resultCustomerProductSlice.forEach(function (searchCustomerProductResult) {
            var barcode_id = searchCustomerProductResult.getValue('internalid');
            var barcode_name = searchCustomerProductResult.getValue('name');
            var status = searchCustomerProductResult.getText('custrecord_cust_prod_stock_status');
            var customer_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_customer');
            var zee_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_zee');

            recordDataSet.push([barcode_id, barcode_name, status, customer_name, zee_name, contact_email, operator_ns_id])

            return true;
        });

        slice_index += 1;
    } while (resultCustomerProductSlice.length == 1000)

    // Update datatable rows.
    var datatable = $('#mpex-moved-records').dataTable().api();
    datatable.clear();
    datatable.rows.add(recordDataSet);
    datatable.draw();
}