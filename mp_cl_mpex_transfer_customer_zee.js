/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-04-30 16:38:00 Raphael
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-13 16:24:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var adhoc_inv_deploy = 'customscript_ss_mpex_tr_customer_zee';
var prev_inv_deploy = null;

function pageInit() {

}

function saveRecord() {
    var old_customer_id = $('#old_customer_id').val();
    var old_zee_id = $('#old_zee_id').val();
    var new_customer_id = $('#new_customer_id').val();
    var new_zee_id = $('#new_zee_id').val();
    var transfertype = $("input[type=radio][name=transfertype]:checked").val();
    var status_filter = loadSelectedStatusFilter();

    nlapiSetFieldValue('custpage_old_customer_id', old_customer_id);
    nlapiSetFieldValue('custpage_old_zee_id', old_zee_id);
    nlapiSetFieldValue('custpage_new_customer_id', new_customer_id);
    nlapiSetFieldValue('custpage_new_zee_id2', new_zee_id);
    nlapiSetFieldValue('custpage_transfertype', transfertype);
    nlapiSetFieldValue('custpage_status_filter', JSON.stringify(status_filter));
    var resultCustomerProductSet = loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype);
    var resultSetLength = getResultSetLength(resultCustomerProductSet);
    nlapiSetFieldValue('custpage_result_set_length', resultSetLength);
    return true;
}

$("input[type=radio][name=transfertype]").on("change", function () {
    $('#alert').parent().hide();

    switch ($(this).val()) {
        case "customer":
            $(".customer_id_section").show();
            $(".customer_name_section").show();
            $("#old_zee_id").attr("readonly", true);
            $("#new_zee_id").attr("readonly", true);
            $('#old_customer_id').trigger('blur');
            $('#new_customer_id').trigger('blur');

            break;
        case "zee":
            $(".customer_id_section").hide();
            $(".customer_name_section").hide();
            $("#old_zee_id").attr("readonly", false);
            $("#new_zee_id").attr("readonly", false);
            break;
    }
}
);

$('#old_customer_id').blur({ input_customer_id: '#old_customer_id', input_customer_name: '#old_customer_name', input_zee_id: '#old_zee_id', input_zee_name: '#old_zee_name' }, calculateZeeId);
$('#new_customer_id').blur({ input_customer_id: '#new_customer_id', input_customer_name: '#new_customer_name', input_zee_id: '#new_zee_id', input_zee_name: '#new_zee_name' }, calculateZeeId);
$('#old_zee_id').blur({ input_zee_id: '#old_zee_id', input_zee_name: '#old_zee_name' }, calculateZeeName);
$('#new_zee_id').blur({ input_zee_id: '#new_zee_id', input_zee_name: '#new_zee_name' }, calculateZeeName);
$('#status').blur(function () { tableTransfersPreview(); });

var resultSetLength = nlapiGetFieldValue('custpage_result_set_length');
if (!isNullorEmpty(resultSetLength)) {
    var progressBar = setInterval(updateProgressBar, 5000);
}

var recordDataSet = [];
$(document).ready(function () {
    $('#mpex-transfers-preview').DataTable({
        data: recordDataSet,
        columns: [
            { title: "Barcode Internal ID" },
            { title: "Barcode Name" },
            { title: "Status" },
            { title: "Old Customer NS ID" },
            { title: "Old Customer Name" },
            { title: "New Customer NS ID" },
            { title: "New Customer Name" },
            { title: "Old Franchisee NS ID" },
            { title: "Old Franchisee Name" },
            { title: "New Franchisee NS ID" },
            { title: "New Franchisee Name" }
        ]
    });
});

function calculateZeeId(event) {
    if (!isNullorEmpty($(event.data.input_customer_id).val())) {
        var customer_id = $(event.data.input_customer_id).val();
        customer_id = removeSpaces(customer_id);
        $(event.data.input_customer_id).val(customer_id);
        try {
            var customerRecord = nlapiLoadRecord('customer', customer_id);
            var customer_name = customerRecord.getFieldValue('altname');
            var zee_id = customerRecord.getFieldValue('partner');
            var zeeRecord = nlapiLoadRecord('partner', zee_id);
            var zee_name = zeeRecord.getFieldValue('companyname');
            $(event.data.input_customer_name).val(customer_name);
            $(event.data.input_zee_id).val(zee_id);
            $(event.data.input_zee_name).val(zee_name);
        }
        catch (e) {
            if (e instanceof nlobjError) {
                if (e.getCode() == "RCRD_DSNT_EXIST") {
                    var alertMessage = 'No record exists for the customer id ' + customer_id + '<br>';
                    showAlert(alertMessage);
                }
            }
        }
    }
}

function calculateZeeName(event) {
    if (!isNullorEmpty($(event.data.input_zee_id).val())) {
        var zee_id = $(event.data.input_zee_id).val();
        zee_id = removeSpaces(zee_id);
        $(event.data.input_zee_id).val(zee_id);
        try {
            var zeeRecord = nlapiLoadRecord('partner', zee_id);
            var zee_name = zeeRecord.getFieldValue('companyname');
            $(event.data.input_zee_name).val(zee_name);
        } catch (e) {
            if (e instanceof nlobjError) {
                if (e.getCode() == "RCRD_DSNT_EXIST") {
                    var alertMessage = 'No record exists for the franchisee id ' + zee_id + '<br>';
                    showAlert(alertMessage);
                }
            }
        }
    }
}

function removeSpaces(string) {
    var string_without_spaces = string.split(' ').join('');
    return string_without_spaces;
}

function tableTransfersPreview() {
    var old_customer_id = $('#old_customer_id').val();
    var old_zee_id = $('#old_zee_id').val();
    var new_customer_id = $('#new_customer_id').val();
    var new_zee_id = $('#new_zee_id').val();
    var new_zee_name = $('#new_zee_name').val();
    var transfertype = $("input[type=radio][name=transfertype]:checked").val();

    var allFieldIdsNotEmpty = validate();

    if (allFieldIdsNotEmpty) {
        // The new zee id has already been evaluated in the calculateZeeId function.
        var new_zee_ns_id = new_zee_id;

        var resultCustomerProductSet = loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype);

        $('#result_customer_product_slice').empty();
        var recordDataSet = [];
        var totalResultsLength = 0;
        var slice_index = 0;
        do {
            var resultCustomerProductSlice = resultCustomerProductSet.getResults(slice_index * 1000, (slice_index + 1) * 1000);
            if (isNullorEmpty(resultCustomerProductSlice)) {
                switch (transfertype) {
                    case "customer":
                        var alertMessage = 'No MPEX records exists for the customer id ' + old_customer_id + ' with the selected status.<br>';
                        break;
                    case "zee":
                        var alertMessage = 'No MPEX records exists for the franchisee id ' + old_zee_id + ' with the selected status.<br>';
                        break;
                }
                showAlert(alertMessage);
                return false;
            }

            resultCustomerProductSlice.forEach(function (searchCustomerProductResult, index) {
                var barcode_id = searchCustomerProductResult.getValue('internalid');
                var barcode_name = searchCustomerProductResult.getValue('name');
                var old_customer_ns_id = searchCustomerProductResult.getValue('custrecord_cust_prod_stock_customer');
                var old_customer_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_customer');
                var old_zee_ns_id = searchCustomerProductResult.getValue('custrecord_cust_prod_stock_zee');
                var old_zee_name = searchCustomerProductResult.getText('custrecord_cust_prod_stock_zee');
                var status = searchCustomerProductResult.getText('custrecord_cust_prod_stock_status');

                switch (transfertype) {
                    case "customer":
                        var new_customer_ns_id = new_customer_id;
                        var new_customer_name = $('#new_customer_name').val();
                        break;
                    case "zee":
                        // In the case of a change of franchisee, the customer information doesn't change.
                        var new_customer_ns_id = old_customer_ns_id;
                        var new_customer_name = old_customer_name;
                        break;
                }

                recordDataSet.push([barcode_id, barcode_name, status, old_customer_ns_id, old_customer_name, new_customer_ns_id, new_customer_name, old_zee_ns_id, old_zee_name, new_zee_ns_id, new_zee_name]);

                return true;
            });

            totalResultsLength += resultCustomerProductSlice.length;
            slice_index += 1;
        } while (resultCustomerProductSlice.length == 1000)
        $('#info').text(totalResultsLength + ' records have been found.');
        $('#info').parent().show();

        // Update datatable rows.
        var datatable = $('#mpex-transfers-preview').dataTable().api();
        datatable.clear();
        datatable.rows.add(recordDataSet);
        datatable.draw();

        return true;
    }
}

function validate() {
    var old_customer_id = $('#old_customer_id').val();
    var old_zee_id = $('#old_zee_id').val();
    var new_customer_id = $('#new_customer_id').val();
    var new_zee_id = $('#new_zee_id').val();
    var transfertype = $("input[type=radio][name=transfertype]:checked").val();
    var alertMessage = '';
    var return_value = true;
    switch (transfertype) {
        case "customer":
            if (isNullorEmpty(old_customer_id)) {
                alertMessage += 'Please enter the old customer ID<br>';
                return_value = false;
            }
            if (isNullorEmpty(old_zee_id)) {
                return_value = false;
            }
            if (isNullorEmpty(new_customer_id)) {
                alertMessage += 'Please enter the new customer ID<br>';
                return_value = false;
            }
            if (isNullorEmpty(new_zee_id)) {
                return_value = false;
            }
            break;
        case "zee":
            if (isNullorEmpty(old_zee_id)) {
                alertMessage += 'Please enter the old franchisee ID<br>';
                return_value = false;
            }
            if (isNullorEmpty(new_zee_id)) {
                alertMessage += 'Please enter the new franchisee ID<br>';
                return_value = false;
            }
            break;
    }
    var numberStatusSelected = $(".status option:selected").length;
    if (numberStatusSelected == 0) {
        alertMessage += 'Please select at least one status<br>';
        return_value = false;
    }

    if (return_value == false) {
        showAlert(alertMessage);
    } else {
        $('#alert').parent().hide();
    }

    return return_value;
}

function showAlert(message) {
    $('#alert').html('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message);
    $('#alert').parent().show();
}

function loadSelectedStatusFilter() {
    // Returns the filter to be concatenated to the filter expressions in tableTransfersPreview.
    var filter = ["custrecord_cust_prod_stock_status", "anyOf"];
    $.each($(".status option:selected"), function () {
        filter.push($(this).val());
    });
    return filter;
}

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
    var old_zee_id = nlapiGetFieldValue('custpage_old_zee_id');
    var transfertype = nlapiGetFieldValue('custpage_transfertype');
    var status_filter = nlapiGetFieldValue('custpage_status_filter');
    var resultSetLength = nlapiGetFieldValue('custpage_result_set_length');

    console.log("updateProgressBar is running");
    if (!isNullorEmpty(resultSetLength)) {
        status_filter = JSON.parse(status_filter);
        try {
            var resultCustomerProductSet = loadCustomerProductStockSearch(old_customer_id, old_zee_id, transfertype, status_filter);
            var nb_records_left_to_move = getResultSetLength(resultCustomerProductSet);
            if (nb_records_left_to_move == 0) {
                clearInterval(progressBar);
                $('#progress-records').attr('class', 'progress-bar progress-bar-success');
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
                        custparam_old_zee_id: old_zee_id,
                        custparam_transfertype: transfertype,
                        custparam_status_filter: JSON.stringify(status_filter),
                        custparam_result_set_length: resultSetLength
                    };
                    params_progress = JSON.stringify(params_progress);
                    var reload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_mpex_tr_customer_zee', 'customdeploy_sl_mpex_tr_customer_zee') + '&custparam_params=' + params_progress;
                    window.open(reload_url, "_self");
                }
            }
        }

    }
}