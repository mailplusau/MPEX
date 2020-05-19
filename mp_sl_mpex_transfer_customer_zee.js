/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-04-30 16:38:00 Raphael
 *
 * Description: Page used to transfer the customer product stock and Product Order (if necessary) in case of a change of Customer Name or Franchisee.
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-18 16:50:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

function transferMpexForm(request, response) {
    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Transfer MPEX');

        // Load jQuery scripts and bootstrap styles.
        var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';

        // Define alert window.
        inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

        // Define information window.
        inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

        inlineHtml += transferTypeSection();
        inlineHtml += customerIDSection();
        inlineHtml += customerNameSection();
        inlineHtml += zeeIDSection();
        inlineHtml += zeeNameSection();
        inlineHtml += statusDropdownSection();
        inlineHtml += dataTablePreview();

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setLayoutType('midrow').setDefaultValue(inlineHtml);

        form.addField('custpage_old_customer_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_old_zee_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_new_customer_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_new_zee_id2', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_transfertype', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_status_filter', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_result_set_length', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_table_csv', 'text', 'Customer ID').setDisplayType('hidden');

        form.addSubmitButton('Transfer MPEX');
        form.addButton('update_table', 'Refresh Table', 'tableTransfersPreview()');
        form.addButton('download_csv', 'Export as CSV', 'downloadCsv()');
        form.setScript('customscript_cl_mpex_tr_customer_zee');
        response.writePage(form);
    } else {
        var old_customer_id = request.getParameter('custpage_old_customer_id');
        var old_zee_id = request.getParameter('custpage_old_zee_id');
        var new_customer_id = request.getParameter('custpage_new_customer_id');
        var new_zee_id = request.getParameter('custpage_new_zee_id2');
        var transfertype = request.getParameter('custpage_transfertype');
        var status_filter = request.getParameter('custpage_status_filter');
        var result_set_length = request.getParameter('custpage_result_set_length');
        var timestamp = Date.now().toString();

        var params = {
            custscript_old_customer_id: old_customer_id,
            custscript_old_zee_id: old_zee_id,
            custscript_new_customer_id: new_customer_id,
            custscript_new_zee_id2: new_zee_id,
            custscript_transfertype: transfertype,
            custscript_status_filter: status_filter,
            custscript_timestamp: timestamp
        };
        var reschedule_status = nlapiScheduleScript('customscript_ss_mpex_tr_customer_zee', 'customdeploy_ss_mpex_tr_customer_zee', params);
        nlapiLogExecution('DEBUG', 'reschedule_status', reschedule_status);

        var params_progress = {
            custparam_old_customer_id: old_customer_id,
            custparam_new_customer_id: new_customer_id,
            custparam_old_zee_id: old_zee_id,
            custparam_new_zee_id: new_zee_id,
            custparam_transfertype: transfertype,
            custparam_status_filter: status_filter,
            custparam_result_set_length: result_set_length,
            custparam_timestamp: timestamp
        };
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_mpex_transferred_records', 'customdeploy_sl_mpex_transferred_records', null, params_progress);
    }
}

function transferTypeSection() {
    var inlineQty = '<div class="container transfertype_section radio-inline" id="transfer_role" style="margin-bottom: 20px;border: none;box-shadow: none;-webkit-box-shadow: none;-moz-box-shadow: none;display:block;font-size:14px;color:#555">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-6 customer_radio"><input type="radio" checked="checked" name="transfertype" value="customer"><label for="customer">Change Customer</label></div>';
    inlineQty += '<div class="col-xs-6 zee_radio"><input type="radio" name="transfertype" value="zee"><label for="zee">Change Franchisee</label></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function customerIDSection() {
    var inlineQty = '<div class="form-group container customer_id_section">';
    inlineQty += '<div class="row">';
    // Old Customer ID field
    inlineQty += '<div class="col-xs-6 old_customer_id"><div class="input-group"><span class="input-group-addon" id="old_customer_id_text">OLD CUSTOMER ID</span><input id="old_customer_id" class="form-control old_customer_id"></div></div>';
    // New Customer ID field
    inlineQty += '<div class="col-xs-6 new_customer_id"><div class="input-group"><span class="input-group-addon" id="new_customer_id_text">NEW CUSTOMER ID</span><input id="new_customer_id" class="form-control new_customer_id"></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function customerNameSection() {
    var inlineQty = '<div class="form-group container customer_name_section">';
    inlineQty += '<div class="row">';
    // Old Customer Name field
    inlineQty += '<div class="col-xs-6 old_customer_name"><div class="input-group"><span class="input-group-addon" id="old_customer_name_text">OLD CUSTOMER NAME</span><input id="old_customer_name" class="form-control old_customer_idname" readonly></div></div>';
    // New Customer NAme field
    inlineQty += '<div class="col-xs-6 new_customer_name"><div class="input-group"><span class="input-group-addon" id="new_customer_name_text">NEW CUSTOMER NAME</span><input id="new_customer_name" class="form-control new_customer_name" readonly></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function zeeIDSection() {
    var inlineQty = '<div class="form-group container zee_id_section">';
    inlineQty += '<div class="row">';
    // Old Zee ID field
    inlineQty += '<div class="col-xs-6 old_zee_id"><div class="input-group"><span class="input-group-addon" id="old_zee_id_text">OLD FRANCHISEE ID</span><input id="old_zee_id" class="form-control old_zee_id" readonly ></div></div>';
    // New Zee ID field
    inlineQty += '<div class="col-xs-6 new_zee_id"><div class="input-group"><span class="input-group-addon" id="new_zee_id_text">NEW FRANCHISEE ID</span><input id="new_zee_id" class="form-control new_zee_id" readonly ></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function zeeNameSection() {
    var inlineQty = '<div class="form-group container zee_name_section">';
    inlineQty += '<div class="row">';
    // Old Zee Name field
    inlineQty += '<div class="col-xs-6 old_zee_name"><div class="input-group"><span class="input-group-addon" id="old_zee_name_text">OLD FRANCHISEE NAME</span><input id="old_zee_name" class="form-control old_zee_name" readonly ></div></div>';
    // New Zee NAme field
    inlineQty += '<div class="col-xs-6 new_zee_name"><div class="input-group"><span class="input-group-addon" id="new_zee_name_text">NEW FRANCHISEE NAME</span><input id="new_zee_name" class="form-control new_zee_name" readonly ></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function statusDropdownSection() {
    var inlineQty = '<div class="form-group container status_dropdown_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 status"><div class="input-group"><span class="input-group-addon" id="status_text">STATUS REQUESTED</span>';
    inlineQty += '<select multiple id="status" class="form-control status">';

    inlineQty += '<option value="' + 1 + '">Allocated to Customer</option>';
    inlineQty += '<option value="' + 2 + '">Picked Up from Customer</option>';
    inlineQty += '<option value="' + 3 + '">Return</option>';
    inlineQty += '<option value="' + 4 + '">Delivered to Receiver</option>';
    inlineQty += '<option value="' + 5 + '">Lodged at TOLL</option>';
    // The option value 6 "Invoiced" should not appear in this list.
    inlineQty += '<option value="' + 7 + '">Product Order Created</option>';
    inlineQty += '<option value="' + 8 + '">Zee Stock</option>';
    inlineQty += '<option value="' + 9 + '">Discarded</option>';
    inlineQty += '<option value="' + 10 + '">Lost</option>';

    inlineQty += '</select></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

function dataTablePreview() {
    var inlineQty = '<style>table#mpex-transfers-preview {font-size: 12px;text-align: center;border: none;}table {font-size: 14px;}table#mpex-transfers-preview th{text-align: center;}</style>';
    inlineQty += '<table cellpadding="15" id="mpex-transfers-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
    inlineQty += '<thead style="color: white;background-color: #607799;">';
    inlineQty += '<tr class="text-center">';
    inlineQty += '</tr>';
    inlineQty += '</thead>';

    inlineQty += '<tbody id="result_customer_product_slice"></tbody>';

    inlineQty += '</table>';
    return inlineQty;
}