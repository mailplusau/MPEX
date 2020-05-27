/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-21 11:54:00 Raphael
 *
 * Description: Page used to reallocate invoiced barcodes who were allocated to the wrong customer. 
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-27 15:16:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

function pageInit() {
    $('#customer_id').blur(function () { displayBarcodesTable() });
}

/**
 * Loads the Customer ID value from the form input field, 
 * and store it in the hidden field 'custpage_customer_id' 
 * to make it available as a parameter to the scheduled script 'customscript_ss_reallocate_barcodes'.
 * The Invoice ID has already been stored as a hidden value in the calculateInvoiceID function.
 * The Franchisee ID has already been stored as a hidden value in the calculateCustomerName function.
 * We use the invoice ID to load the barcodes records linked to this invoice.
 * Then we retrieve the number of records that will be reallocated.
 * @returns {Boolean} Whether the function has completed correctly.
 */
function saveRecord() {
    var customer_id = $('#customer_id').val();
    nlapiSetFieldValue('custpage_customer_id', customer_id);

    var invoice_id = nlapiGetFieldValue('custpage_invoice_id');
    var resultCustomerProductSet = loadCustomerProductStockSearch(invoice_id);
    var resultSetLength = getResultSetLength(resultCustomerProductSet);
    nlapiSetFieldValue('custpage_result_set_length', resultSetLength);
    return true;
}

// Should maybe be in the pageInit function?
var recordDataSet = [];
$(document).ready(function () {
    $('#barcodes-preview').DataTable({
        data: recordDataSet,
        columns: [
            { title: "Barcode Name" },
            { title: "Invoice Number" },
            { title: "Single Product Name" },
            { title: "Old Customer Name" },
            { title: "Old Franchisee Name" },
            { title: "New Customer Name" },
            { title: "New Franchisee Name" }
        ]
    });
});

/**
 * Calculates the record internal ID corresponding to the invoice number entered in the input field.
 * The internal ID is stored in a hidden field.
 * Called in the validate function.
 * @return  {Boolean}   Whether or not an invoice has been found.
 */
function calculateInvoiceID(invoice_number) {
    $('#invoice_number').val(invoice_number);
    var filterExpression = ["tranid", "is", invoice_number];
    var invoiceSearchResults = nlapiSearchRecord('invoice', null, filterExpression, null);
    // if (invoiceSearchResults.length == 0) {
    if (isNullorEmpty(invoiceSearchResults)) {
        return false;
    } else {
        var invoiceResult = invoiceSearchResults[0];
        var invoice_id = invoiceResult.getId();
        nlapiSetFieldValue('custpage_invoice_id', invoice_id);
        return true;
    }
}

/**
 * Loads the Customer Name, Franchisee ID and Franchisee Name corresponding to a Customer ID.
 * Those values are stored in hidden fields.
 * Called in the validate function.
 * @return  {Boolean}   Whether or not a customer has been found.
 */
function calculateCustomerName(customer_id) {
    $('#customer_id').val(customer_id);
    var customerRecord = nlapiLoadRecord('customer', customer_id);
    var customer_name = customerRecord.getFieldValue('altname');
    var zee_id = customerRecord.getFieldValue('partner');
    var zeeRecord = nlapiLoadRecord('partner', zee_id);
    var zee_name = zeeRecord.getFieldValue('companyname');
    $('#customer_name').val(customer_name);
    nlapiSetFieldValue('custpage_zee_id', zee_id);
    nlapiSetFieldValue('custpage_zee_name', zee_name);
    return true;
}

/**
 * Check that all the inputs have been filled, and that the invoice number or the customer record exists.
 * If not, calls the showAlert function.
 * @return  {Boolean}    Whether or not all the inputs have been filled.
 */
function validate() {
    var invoice_number = $('#invoice_number').val().trim().toUpperCase();
    var customer_id = $('#customer_id').val().trim();
    var alertMessage = '';
    var return_value = true;

    if (isNullorEmpty(invoice_number)) {
        alertMessage += 'Please enter the Invoice Number<br>';
        return_value = false;
    }
    if (isNullorEmpty(customer_id)) {
        alertMessage += 'Please enter the customer ID<br>';
        return_value = false;
    }
    if (return_value == true) {
        if (!calculateInvoiceID(invoice_number)) {
            alertMessage += 'No invoice exists for the invoice number ' + invoice_number + '<br>';
            return_value = false;
        }
        try {
            calculateCustomerName(customer_id);
        } catch (e) {
            if (e instanceof nlobjError) {
                if (e.getCode() == "RCRD_DSNT_EXIST") {
                    alertMessage += 'No record exists for the customer id ' + customer_id + '<br>';
                }
            }
            return_value = false;
        }
    }

    if (return_value == false) {
        showAlert(alertMessage);
        $('#result_barcodes_slice').empty();
    } else {
        $('#alert').parent().hide();
    }

    return return_value;
}

/**
 * Displays error messages in the alert box on top of the page.
 * @param   {String}    message The message to be displayed.
 */
function showAlert(message) {
    $('#alert').html('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message);
    $('#alert').parent().show();
}

/**
 * Displays the invoiced barcodes linked to the invoiced number.
 * @returns {Boolean}   Whether the function worked well or not.
 */
function displayBarcodesTable() {
    if (validate()) {
        var invoice_number = $('#invoice_number').val().trim();
        var invoice_id = nlapiGetFieldValue('custpage_invoice_id');
        var new_customer_name = $('#customer_name').val();
        var new_zee_name = nlapiGetFieldValue('custpage_zee_name');

        var resultCustomerProductSet = loadCustomerProductStockSearch(invoice_id);

        $('#result_barcodes_slice').empty();
        var recordDataSet = [];
        var totalResultsLength = 0;
        var slice_index = 0;

        do {
            var resultCustomerProductSlice = resultCustomerProductSet.getResults(slice_index * 1000, (slice_index + 1) * 1000);
            if (isNullorEmpty(resultCustomerProductSlice)) {
                var alertMessage = 'No active Barcodes records exists for invoice number ' + invoice_number + '<br>';
                showAlert(alertMessage);
                return false;
            }

            resultCustomerProductSlice.forEach(function (searchCustomerProductResult) {
                // var barcode_id = searchCustomerProductResult.getValue('internalid');
                var barcode_name = searchCustomerProductResult.getValue('name');
                var single_product_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_single_name');
                var old_customer_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_customer');
                var old_zee_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_zee');

                recordDataSet.push([barcode_name, invoice_number, single_product_name, old_customer_name, old_zee_name, new_customer_name, new_zee_name]);

                return true;
            });

            totalResultsLength += resultCustomerProductSlice.length;
            slice_index += 1;
        } while (resultCustomerProductSlice.length == 1000)

        $('#info').text(totalResultsLength + ' records have been found.');
        $('#info').parent().show();

        // Update datatable rows.
        var datatable = $('#barcodes-preview').dataTable().api();
        datatable.clear();
        datatable.rows.add(recordDataSet);
        datatable.draw();

        saveCsv(recordDataSet)

        return true;
    }
}

/**
 * Load the result set of the Customer Product Stock records satisfying the required conditions.
 * @param   {String}                invoice_id
 * @return  {nlobjSearchResultSet}  The result set of the Customer Product Stock records.
 */
function loadCustomerProductStockSearch(invoice_id) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');
    var filterExpression = [["custrecord_cust_prod_stock_status", "is", "6"],
        'AND',
    ["custrecord_prod_stock_invoice", "is", invoice_id],
        'AND',
    ["isinactive", "is", 'F']
    ];
    customerProductStockSearch.setFilterExpression(filterExpression);
    var resultCustomerProductSet = customerProductStockSearch.runSearch();
    return resultCustomerProductSet;
}

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
 * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
 * @param   {Array}     tableArray The recordDataSet created in tableTransfersPreview().
 * @returns {Boolean}   Whether the function worked without any error.
 */
function saveCsv(tableArray) {
    var csv = "Barcode Name, Invoice Number, Single Product Name, Old Customer Name, Old Franchisee Name, New Customer Name, New Franchisee Name\n";
    tableArray.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    nlapiSetFieldValue('custpage_table_csv', csv);
    return true;
}

/**
* Load the string stored in the hidden field 'custpage_table_csv'.
* Converts it to a CSV file.
* Creates a hidden link to download the file and triggers the click of the link.
*/
function downloadCsv() {
    var csv = nlapiGetFieldValue('custpage_table_csv');
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var content_type = 'text/csv';
    var csvFile = new Blob([csv], { type: content_type });
    var url = window.URL.createObjectURL(csvFile);

    // Set the CSV filename
    var invoice_number = $('#invoice_number').val().trim();
    var new_customer_name = $('#customer_name').val();
    var filename = 'reallocate_barcodes_' + invoice_number + '_' + nameToCode(new_customer_name) + '.csv';

    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Converts the customer  names into an appropriate format for the CSV filename.
 * @param   {String} string Customer name
 * @return  {String}        The same string with the spaces or " - " converted in "_".
 */
function nameToCode(string) {
    return string.toLowerCase().trim().split(' - ').join('_').split(' ').join('_');
}