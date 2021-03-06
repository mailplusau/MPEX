/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-25 10:11:00 Raphael
 *
 * Description: Display the progress bar and a table of the duplicated barcodes.
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-06-02 14:09:00
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
    $('#reallocated-barcodes-records').DataTable({
        data: recordDataSet,
        columns: [
            { title: "Barcode Name" },
            { title: "Invoice Number" },
            { title: "Single Product Name" },
            { title: "Product Order ID" },
            { title: "Date Stock Used" },
            { title: "New Customer Name" },
            { title: "New Franchisee Name" }
        ],
        pageLength: 100
    });
});

/**
 * Calculates the number of results in the result set.
 * @param   {nlobjSearchResultSet}  resultSet
 * @returns {Number}                totalResultsLength
 */
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

/** 
 * Function called every 5 seconds until the bar is complete.
 * It performs a search to get the number of remaining results in the search.
*/
function updateProgressBar() {
    var selector_id = nlapiGetFieldValue('custpage_selector_id');
    var selector_type = nlapiGetFieldValue('custpage_selector_type');
    var resultSetLength = nlapiGetFieldValue('custpage_result_set_length');
    var timestamp = nlapiGetFieldValue('custpage_timestamp');

    console.log("updateProgressBar is running");
    if (!isNullorEmpty(resultSetLength)) {
        try {
            var barcodes_list = getBarcodesIDsList();
            var resultCustomerProductSet = loadCustomerProductStockSearch(barcodes_list, true);

            var nb_records_left_to_move = getResultSetLength(resultCustomerProductSet);
            console.log("Nb records left to move : ", nb_records_left_to_move);
            if (nb_records_left_to_move == 0) {
                clearInterval(progressBar);
                $('#progress-records').attr('class', 'progress-bar progress-bar-success');
                displayMovedBarcodes();
            }

            var nb_records_moved = resultSetLength - nb_records_left_to_move;
            var width = parseInt((nb_records_moved / resultSetLength) * 100);

            $('#progress-records').attr('aria-valuenow', nb_records_moved);
            $('#progress-records').attr('style', 'width:' + width + '%');
            $('#progress-records').text('Barcodes records reallocated : ' + nb_records_moved + ' / ' + resultSetLength);
            console.log("nb_records_moved : ", nb_records_moved);
            console.log("width : ", width);
        } catch (e) {
            if (e instanceof nlobjError) {
                if (e.getCode() == "SCRIPT_EXECUTION_USAGE_LIMIT_EXCEEDED") {
                    var params_progress = {
                        custparam_selector_id: selector_id,
                        custparam_selector_type: selector_type,
                        custparam_result_set_length: resultSetLength,
                        custparam_timestamp: timestamp
                    };
                    params_progress = JSON.stringify(params_progress);
                    var reload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_reallocated_barcodes', 'customdeploy_sl_reallocated_barcodes') + '&custparam_params=' + params_progress;
                    window.open(reload_url, "_self");
                }
            }
        }
    }
}

/**
 * Called by the updateProgressBar function when there are no more records to be reallocated.
 * Loads "MPEX Transfer" records which contains all the new barcodes ids.
 * Informations about each barcode are then displayed in the DataTable.
 */
function displayMovedBarcodes() {
    console.log("displayMovedBarcodes()");
    var barcodes_list = getBarcodesIDsList();
    console.log('barcodes_list : ', barcodes_list);

    // Display the table of barcodes
    var resultCustomerProductSet = loadCustomerProductStockSearch(barcodes_list, false);
    var recordDataSet = [];
    var slice_index = 0;

    do {
        var resultCustomerProductSlice = resultCustomerProductSet.getResults(slice_index * 1000, (slice_index + 1) * 1000);
        console.log("resultCustomerProductSlice.length in displayMovedBarcodes() : ", resultCustomerProductSlice.length);
        resultCustomerProductSlice.forEach(function (searchCustomerProductResult) {
            var barcode_name = searchCustomerProductResult.getValue('name');
            var invoice_number = searchCustomerProductResult.getText('custrecord_prod_stock_invoice');
            var product_order_id = searchCustomerProductResult.getText('custrecord_prod_stock_prod_order');
            var single_product_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_single_name');
            var date_stock_used = searchCustomerProductResult.getValue('custrecord_cust_date_stock_used');

            // Load the record of the new (activated) barcode to retrieve the new customer and franchisee names.
            var activeBarcodeFilterExpression = [["name", "is", barcode_name], 'AND', ["isinactive", "is", 'F']];
            var activeBarcodeColumns = new Array();
            activeBarcodeColumns[0] = new nlobjSearchColumn('custrecord_cust_prod_stock_customer', null, null);
            activeBarcodeColumns[1] = new nlobjSearchColumn('custrecord_cust_prod_stock_zee', null, null);
            var activeBarcodeResults = nlapiSearchRecord('customrecord_customer_product_stock', null, activeBarcodeFilterExpression, activeBarcodeColumns);
            var activeBarcodeResult = activeBarcodeResults[0];
            var new_customer_name = activeBarcodeResult.getText('custrecord_cust_prod_stock_customer');
            var new_zee_name = activeBarcodeResult.getText('custrecord_cust_prod_stock_zee');

            recordDataSet.push([barcode_name, invoice_number, single_product_name, product_order_id, date_stock_used, new_customer_name, new_zee_name]);

            return true;
        });

        slice_index += 1;
    } while (resultCustomerProductSlice.length == 1000)

    // Update datatable rows.
    var datatable = $('#reallocated-barcodes-records').dataTable().api();
    datatable.clear();
    datatable.rows.add(recordDataSet);
    datatable.draw();
}

/** 
 * Retrieve the "MPEX Transfer" record that contains the list of
 * the barcodes internal IDs to be reallocated.
 * @returns barcodes_list
*/
function getBarcodesIDsList() {
    // Load MPEX transfer record
    var record_name = nlapiGetFieldValue('custpage_record_name');
    var mpexJSONSearch = nlapiLoadSearch('customrecord_mpex_tr_customer_zee', 'customsearch_mpex_tr_customer_zee');
    var newFilterExpression = [["custrecord_name", "is", record_name]];
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

    return barcodes_list
}

/**
 * Load the result set of the Customer Product Stock records that should be duplicated.
 * If getActiveBarcodes is true, it will return only the barcodes that have not been yet inactivated.
 * @param   {Array}                 barcodes_list
 * @param   {Boolean}               getActiveBarcodes
 * @return  {nlobjSearchResultSet}  The result set of the Customer Product Stock records.
 */
function loadCustomerProductStockSearch(barcodes_list, getActiveBarcodes) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');
    var barcodesFilterExpression = ['internalid', 'anyOf'];
    barcodesFilterExpression = barcodesFilterExpression.concat(barcodes_list);
    if (getActiveBarcodes) {
        barcodesFilterExpression = [barcodesFilterExpression,
            'AND',
            ["isinactive", "is", 'F']];
    }
    customerProductStockSearch.setFilterExpression(barcodesFilterExpression);
    var resultCustomerProductSet = customerProductStockSearch.runSearch();

    return resultCustomerProductSet;
}