/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-14 15:28:00 Raphael
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-05-14 15:28:00
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

function transferredMpexForm(request, response) {
    if (request.getMethod() == "GET") {
        var old_customer_id = '';
        var new_customer_id = '';
        var old_zee_id = '';
        var new_zee_id = '';
        var transfertype = '';
        var status_filter = null;
        var result_set_length = null;
        var timestamp = '';

        var params = request.getParameter('custparam_params');
        if (!isNullorEmpty(params)) {
            // Parameters when reloading from updateProgressBar()
            params = JSON.parse(params);
            if (!isNullorEmpty(params.custparam_old_customer_id)) {
                old_customer_id = params.custparam_old_customer_id;
            }
            if (!isNullorEmpty(params.custparam_new_customer_id)) {
                new_customer_id = params.custparam_new_customer_id;
            }
            old_zee_id = params.custparam_old_zee_id;
            new_zee_id = params.custparam_new_zee_id;
            transfertype = params.custparam_transfertype;
            status_filter = params.custparam_status_filter;
            result_set_length = params.custparam_result_set_length;
            timestamp = params.custparam_timestamp;
        } else if (!isNullorEmpty(request.getParameter('custparam_result_set_length'))) {
            // Parameters when saving record
            if (!isNullorEmpty(request.getParameter('custparam_old_customer_id'))) {
                old_customer_id = request.getParameter('custparam_old_customer_id');
            }
            if (!isNullorEmpty(request.getParameter('custparam_new_customer_id'))) {
                new_customer_id = request.getParameter('custparam_new_customer_id');
            }
            old_zee_id = request.getParameter('custparam_old_zee_id');
            new_zee_id = request.getParameter('custparam_new_zee_id');
            transfertype = request.getParameter('custparam_transfertype');
            status_filter = request.getParameter('custparam_status_filter');
            result_set_length = request.getParameter('custparam_result_set_length');
            timestamp = request.getParameter('custparam_timestamp');
        }

        var record_name = getBarcodeRecordName(old_customer_id, new_customer_id, old_zee_id, new_zee_id, transfertype, timestamp);

        var form = nlapiCreateForm('Transferred MPEX');

        // Load jQuery scripts and bootstrap styles.
        var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';

        inlineHtml += progressBar(result_set_length);
        inlineHtml += recordsDataTable();

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setLayoutType('midrow').setDefaultValue(inlineHtml);

        form.addField('custpage_old_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(old_customer_id);
        form.addField('custpage_new_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(new_customer_id);
        form.addField('custpage_old_zee_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(old_zee_id);
        form.addField('custpage_new_zee_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(new_zee_id);
        form.addField('custpage_transfertype', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(transfertype);
        form.addField('custpage_status_filter', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(status_filter);
        form.addField('custpage_result_set_length', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(result_set_length);
        form.addField('custpage_timestamp', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(timestamp);
        form.addField('custpage_record_name', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(record_name);

        form.setScript('customscript_cl_mpex_transferred_records');
        response.writePage(form);
    } else {
    }
}

function progressBar(nb_records_total) {
    var inlineQty = '<div class="progress">';
    inlineQty += '<div class="progress-bar progress-bar-warning" id="progress-records" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + nb_records_total + '" style="width:0%">MPEX records moved : 0 / ' + nb_records_total + '</div>';
    inlineQty += '</div>';
    return inlineQty;
}

function recordsDataTable() {
    var inlineQty = '<style>table#mpex-moved-records {font-size: 12px;text-align: center;border: none;}table {font-size: 14px;}table#mpex-moved-records th{text-align: center;}</style>';
    inlineQty += '<table cellpadding="15" id="mpex-moved-records" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
    inlineQty += '<thead style="color: white;background-color: #607799;">';
    inlineQty += '<tr class="text-center">';
    inlineQty += '</tr>';
    inlineQty += '</thead>';
    inlineQty += '<tbody></tbody>';
    inlineQty += '</table>';
    return inlineQty;
}

function getBarcodeRecordName(old_customer_id, new_customer_id, old_zee_id, new_zee_id, transfertype, timestamp) {
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
    return record_name;
}

function nameToCode(string) {
    return string.toLowerCase().trim().split(' - ').join('_').split(' ').join('_');
}