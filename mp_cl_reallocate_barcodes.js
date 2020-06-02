/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-21 11:54:00 Raphael
 *
 * Description: Page used to reallocate barcodes who were allocated to the wrong customer. 
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
    $('#customer_id').blur(function () { displayBarcodesTable() });

    $('.input-group-btn button').click(function (e) {
        $(e.currentTarget).next('ul').toggleClass('hide');
        $(e.currentTarget).next('ul').toggleClass('show');
    });

    $('.dropdown-menu li a').click(function (e) {
        e.preventDefault();
        setupSelectorInput($(this).text());
        $(this).closest("ul").toggleClass('hide');
        $(this).closest("ul").toggleClass('show');
    });

    var table = $('#barcodes-preview').DataTable();

    $('#select_all').click(function () {
        if ($(this).prop('checked')) {
            table.rows({ selected: false }).select();
        } else {
            table.rows({ selected: true }).deselect();
        }
    });

    table.on('deselect', function (e, dt, type, indexes) {
        if (type === 'row') {
            $('#select_all').prop('checked', false);
        }
    });
}

/**
 * Loads the Customer ID value from the form input field, 
 * and store it in the hidden field 'custpage_customer_id' 
 * to make it available as a parameter to the scheduled script 'customscript_ss_reallocate_barcodes'.
 * The Selector ID and Selector Type have already been stored as hidden values in the calculateSelectorID function.
 * The Franchisee ID has already been stored as a hidden value in the calculateCustomerName function.
 * We use the Selector ID and Selector Type to load the barcodes records linked to this selector 
 * (Invoice number, Barcode Number or Product Order ID).
 * Then we retrieve the number of records that will be reallocated.
 * @returns {Boolean} Whether the function has completed correctly.
 */
function saveRecord() {
    var customer_id = $('#customer_id').val();
    nlapiSetFieldValue('custpage_customer_id', customer_id);

    var selector_id = nlapiGetFieldValue('custpage_selector_id');
    var selector_type = nlapiGetFieldValue('custpage_selector_type');

    var resultSetLength = $('#barcodes-preview').DataTable().rows('.selected').data().length;
    if (resultSetLength == 0) {
        showAlert('Please select at least one record.');
        return false;
    }
    nlapiSetFieldValue('custpage_result_set_length', resultSetLength);

    // Save the Barcodes internal IDs in a "MPEX Transfer" record.
    var timestamp = Date.now().toString();
    nlapiSetFieldValue('custpage_timestamp', timestamp);
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
    var mpexRecord = nlapiCreateRecord('customrecord_mpex_tr_customer_zee');
    mpexRecord.setFieldValue('name', record_name);
    var selectedRows = $('#barcodes-preview').DataTable().rows({ selected: true });
    var barcodes_records_id_list = $('#barcodes-preview').DataTable().cells(selectedRows.nodes(), 1).data().toArray();
    var json_record_as_string = JSON.stringify({ 'barcodes_internal_id': barcodes_records_id_list });
    mpexRecord.setFieldValue('custrecord_json2', json_record_as_string);
    nlapiSubmitRecord(mpexRecord);
    return true;
}

// Should maybe be in the pageInit function?
var recordDataSet = [];
$(document).ready(function () {
    $('#barcodes-preview').DataTable({
        data: recordDataSet,
        columnDefs: [{
            orderable: false,
            className: 'select-checkbox',
            targets: 0
        },
        {
            visible: false,
            targets: 1,
        }
        ],
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        pageLength: 100
    });
});

/**
 * Calculates the selector internal ID corresponding to the selector value entered in the input field.
 * The internal ID is stored in a hidden field.
 * Called in the validate function.
 * @param   {String}    selector_value (Invoice number, Barcode number or Product order ID)
 * @param   {String}    selector_type
 * @return  {Boolean}   Whether a record has been found or not.
 */
function calculateSelectorID(selector_value, selector_type) {
    $('#selector_value').val(selector_value);
    console.log('selector_value : ', selector_value);

    switch (selector_type) {
        case 'invoice_number':
            var filterExpression = new nlobjSearchFilter('tranid', null, 'is', selector_value);
            var selectorSearchResults = nlapiSearchRecord('invoice', null, filterExpression, null);
            break;

        case 'barcode_number':
            var filterExpression = new nlobjSearchFilter('name', null, 'is', selector_value);
            var selectorSearchResults = nlapiSearchRecord('customrecord_customer_product_stock', null, filterExpression, null);
            break;

        case 'product_order_id':
            try {
                nlapiLoadRecord('customrecord_mp_ap_product_order', selector_value);
                console.log('selector_id : ', selector_value);
                nlapiSetFieldValue('custpage_selector_id', selector_value);
                nlapiSetFieldValue('custpage_selector_type', selector_type);
                return true;
            } catch (e) {
                if (e instanceof nlobjError) {
                    if (e.getCode() == "RCRD_DSNT_EXIST") {
                        return false;
                    }
                }
            }
    }

    if (isNullorEmpty(selectorSearchResults)) {
        return false;
    } else {
        var selectorResult = selectorSearchResults[0];
        var selector_id = selectorResult.getId();
        console.log('selector_id : ', selector_id);
        nlapiSetFieldValue('custpage_selector_id', selector_id);
        nlapiSetFieldValue('custpage_selector_type', selector_type);
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
    // selector_value is either the invoice number, the barcode number or the product order id.
    var selector_value = $('#selector_value').val().trim().toUpperCase();
    var selector_type = $('#selector_text').text().toLowerCase().split(' ').join('_');
    var customer_id = $('#customer_id').val().trim();
    var alertMessage = '';
    var return_value = true;

    if (isNullorEmpty(selector_value)) {
        switch (selector_type) {
            case 'invoice_number':
                alertMessage += 'Please enter the Invoice Number<br>';
                break;

            case 'barcode_number':
                alertMessage += 'Please enter the Barcode Number<br>';
                break;

            case 'product_order_id':
                alertMessage += 'Please enter the Product Order ID<br>';
                break;
        }
        return_value = false;
    }
    if (isNullorEmpty(customer_id)) {
        alertMessage += 'Please enter the customer ID<br>';
        return_value = false;
    }
    if (return_value == true) {
        if (!calculateSelectorID(selector_value, selector_type)) {
            switch (selector_type) {
                case 'invoice_number':
                    alertMessage += 'No invoice exists for the invoice number ' + selector_value + '<br>';
                    break;

                case 'barcode_number':
                    alertMessage += 'No barcode exists for the barcode number ' + selector_value + '<br>';
                    break;

                case 'product_order_id':
                    alertMessage += 'No Product Order exists for the ID ' + selector_value + '<br>';
                    break;
            }
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
        var selector_value = $('#selector_value').val().trim().toUpperCase();
        var selector_id = nlapiGetFieldValue('custpage_selector_id');
        var selector_type = nlapiGetFieldValue('custpage_selector_type');
        var new_customer_name = $('#customer_name').val();
        var new_zee_name = nlapiGetFieldValue('custpage_zee_name');

        var resultCustomerProductSet = loadCustomerProductStockSearch(selector_id, selector_type);

        $('#result_barcodes_slice').empty();
        var recordDataSet = [];
        var totalResultsLength = 0;
        var slice_index = 0;

        do {
            var resultCustomerProductSlice = resultCustomerProductSet.getResults(slice_index * 1000, (slice_index + 1) * 1000);
            if (isNullorEmpty(resultCustomerProductSlice)) {
                switch (selector_type) {
                    case 'invoice_number':
                        var alertMessage = 'No active Barcodes records exists for the invoice number ' + selector_value + '<br>';
                        break;

                    case 'barcode_number':
                        var alertMessage = 'No active Barcodes records exists for the barcode number ' + selector_value + '<br>';
                        break;

                    case 'product_order_id':
                        var alertMessage = 'No active Barcodes records exists for the product order ID ' + selector_value + '<br>';
                        return true;
                }
                showAlert(alertMessage);
                return false;
            }

            resultCustomerProductSlice.forEach(function (searchCustomerProductResult, index) {
                var barcode_record_id = searchCustomerProductResult.getId();
                var barcode_name = searchCustomerProductResult.getValue('name');
                var invoice_number = searchCustomerProductResult.getText('custrecord_prod_stock_invoice');
                var single_product_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_single_name');
                var product_order_id = searchCustomerProductResult.getText('custrecord_prod_stock_prod_order');
                var old_customer_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_customer');
                var old_zee_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_zee');

                recordDataSet.push(['', barcode_record_id, barcode_name, invoice_number, single_product_name, product_order_id, old_customer_name, old_zee_name, new_customer_name, new_zee_name]);

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

        return true;
    }
}

/**
 * Load the result set of the Customer Product Stock records satisfying the required conditions.
 * @param   {String}                selector_id
 * @param   {String}                selector_type
 * @return  {nlobjSearchResultSet}  The result set of the Customer Product Stock records.
 */
function loadCustomerProductStockSearch(selector_id, selector_type) {
    var customerProductStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');
    switch (selector_type) {
        case 'invoice_number':
            var filterExpression = [["custrecord_cust_prod_stock_status", "is", "6"],
                'AND',
            ["custrecord_prod_stock_invoice", "is", selector_id],
                'AND',
            ["isinactive", "is", 'F']];
            break;

        case 'barcode_number':
            var filterExpression = [["custrecord_cust_prod_stock_status", "anyOf", "6", "7"],
                'AND',
            ["internalid", "is", selector_id],
                'AND',
            ["isinactive", "is", 'F']];
            break;

        case 'product_order_id':
            var filterExpression = [["custrecord_cust_prod_stock_status", "is", "7"],
                'AND',
            ["custrecord_prod_stock_prod_order", "is", selector_id],
                'AND',
            ["isinactive", "is", 'F']];
            break;
    }
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
* Load the array of the selected rows.
* Converts it to a CSV file.
* Creates a hidden link to download the file and triggers the click of the link.
*/
function downloadCsv() {
    // Load the array of the selected rows and creates a CSV out of it.
    var selectedRowsArray = $('#barcodes-preview').DataTable().rows('.selected').data().toArray();
    var csv = "Barcode Name, Invoice Number, Single Product Name, Product Order Id, Old Customer Name, Old Franchisee Name, New Customer Name, New Franchisee Name\n";
    selectedRowsArray.forEach(function (row) {
        csv += row.slice(2).join(',');
        csv += "\n";
    });

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var content_type = 'text/csv';
    var csvFile = new Blob([csv], { type: content_type });
    var url = window.URL.createObjectURL(csvFile);

    // Set the CSV filename
    var selector_value = $('#selector_value').val().trim().toUpperCase();
    var selector_type = $('#selector_text').text().toLowerCase().split(' ').join('_');
    if (selector_type == 'product_order_id') {
        selector_value = "PO_ID" + selector_value;
    }
    var new_customer_name = $('#customer_name').val();
    var filename = 'reallocate_barcodes_' + selector_value + '_' + nameToCode(new_customer_name) + '.csv';

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

/**
 * Converts the selector field into either "Invoice number", "Barcode number" or "Product Order ID"
 * @param   {String} selector_name Customer name
 */
function setupSelectorInput(selector_name) {
    $('#selector_text').text(selector_name);
    switch (selector_name) {
        case 'INVOICE NUMBER':
            $('#selector_value').attr('placeholder', 'INV123456');
            break;

        case 'BARCODE NUMBER':
            $('#selector_value').attr('placeholder', 'MPEN123456');
            break;

        case 'PRODUCT ORDER ID':
            $('#selector_value').attr('placeholder', '1234567');
            break;
    }
}