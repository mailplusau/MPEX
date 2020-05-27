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

function reallocateBarcodes(request, response) {
    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Reallocate invoiced Barcodes');

        // Load jQuery scripts and bootstrap styles.
        var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';
        
        // Define alert window.
        inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

        // Define information window.
        inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

        inlineHtml += invoiceSection();
        inlineHtml += customerSection();
        inlineHtml += dataTablePreview();

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setLayoutType('midrow').setDefaultValue(inlineHtml);
        
        form.addField('custpage_invoice_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_zee_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_zee_name', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_table_csv', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_result_set_length', 'text', 'Customer ID').setDisplayType('hidden');

        form.addSubmitButton('Reallocate');
        form.addButton('update_table', 'Refresh Table', 'displayBarcodesTable()');
        form.addButton('download_csv', 'Export as CSV', 'downloadCsv()');
        form.setScript('customscript_cl_reallocate_barcodes');
        response.writePage(form);
    } else {
        var invoice_id = request.getParameter('custpage_invoice_id');
        var customer_id = request.getParameter('custpage_customer_id');
        var zee_id = request.getParameter('custpage_zee_id');
        var result_set_length = request.getParameter('custpage_result_set_length');
        var timestamp = Date.now().toString();
        nlapiLogExecution('DEBUG', 'invoice_id', invoice_id);
        nlapiLogExecution('DEBUG', 'customer_id', customer_id);
        nlapiLogExecution('DEBUG', 'zee_id', zee_id);
        nlapiLogExecution('DEBUG', 'timestamp', timestamp);

        var params = {
            custscript_invoice_id: invoice_id,
            custscript_customer_id2: customer_id,
            custscript_zee_id2: zee_id,
            custscript_timestamp2: timestamp
        };
        var reschedule_status = nlapiScheduleScript('customscript_ss_reallocate_barcodes', 'customdeploy_ss_reallocate_barcodes', params);
        nlapiLogExecution('DEBUG', 'reschedule_status', reschedule_status);

        var params_progress = {
            custparam_invoice_id: invoice_id,
            custparam_result_set_length: result_set_length,
            custparam_timestamp: timestamp
        };
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_reallocated_barcodes', 'customdeploy_sl_reallocated_barcodes', null, params_progress);
    }
}

/**
 * The Invoice Number input field. Its value should be used to detect if the invoice exists or not.
 * @return  {String}    inlineQty
 */
function invoiceSection() {
    var inlineQty = '<div class="form-group container invoice_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 invoice_number"><div class="input-group"><span class="input-group-addon" id="invoice_number_text">INVOICE NUMBER</span><input id="invoice_number" class="form-control invoice_number" placeholder="INV123456"></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

/**
 * The Customer ID and name fields. The customer name field should be automatically filled based on the customer ID value.
 * @return  {String}    inlineQty
 */
function customerSection() {
    var inlineQty = '<div class="form-group container customer_section">';
    inlineQty += '<div class="row">';
    // Customer ID field
    inlineQty += '<div class="col-xs-6 customer_id"><div class="input-group"><span class="input-group-addon" id="customer_id_text">CUSTOMER ID</span><input id="customer_id" class="form-control customer_id"></div></div>';
    // Customer name field
    inlineQty += '<div class="col-xs-6 customer_name"><div class="input-group"><span class="input-group-addon" id="customer_name_text">CUSTOMER NAME</span><input id="customer_name" class="form-control customer_name" readonly></div></div>';
    inlineQty += '</div>';
    inlineQty += '</div>';

    return inlineQty;
}

/**
 * The datatable displaying the invoiced barcodes. Its rows are filled using the jQuery plugin "DataTables" (datatables.net).
 * @return  {String}    inlineQty
 */
function dataTablePreview() {
    var inlineQty = '<style>table#barcodes-preview {font-size: 12px;text-align: center;border: none;}table {font-size: 14px;}table#barcodes-preview th{text-align: center;}</style>';
    inlineQty += '<table cellpadding="15" id="barcodes-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
    inlineQty += '<thead style="color: white;background-color: #607799;">';
    inlineQty += '<tr class="text-center">';
    inlineQty += '</tr>';
    inlineQty += '</thead>';

    inlineQty += '<tbody id="result_barcodes_slice"></tbody>';

    inlineQty += '</table>';
    return inlineQty;
}
