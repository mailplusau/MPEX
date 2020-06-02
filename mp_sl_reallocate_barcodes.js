/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2020-05-21 11:54:00 Raphael
 *
 * Description: Page used to inactivate and reallocate barcodes who were allocated to the wrong customer. 
 * 
 * @Last Modified by:   raphaelchalicarnemailplus
 * @Last Modified time: 2020-06-02 14:09:00
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

function reallocateBarcodes(request, response) {
    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Duplicate invoiced Barcodes');

        // Load jQuery
        var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
        
        // Load Bootstrap
        inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
        inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

        // Load DataTables
        inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
        inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
        
        // Load Select Datatables extension
        inlineHtml += '<link type="text/css" href="//cdn.datatables.net/select/1.3.1/css/select.dataTables.min.css" rel="stylesheet" />';
        inlineHtml += '<script type="text/javascript" src="//cdn.datatables.net/select/1.3.1/js/dataTables.select.min.js"></script>';
    
        // Load Netsuite stylesheet and script
        inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
        inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
        inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
        inlineHtml += '<style>.mandatory{color:red;}</style>';

        // Define alert window.
        inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

        // Define information window.
        inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

        inlineHtml += selectorSection();
        inlineHtml += customerSection();
        inlineHtml += dataTablePreview();

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setLayoutType('midrow').setDefaultValue(inlineHtml);

        // form.addField('custpage_invoice_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_selector_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_selector_type', 'text', 'Customer ID').setDisplayType('hidden');

        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_zee_id', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_zee_name', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_result_set_length', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_timestamp', 'text', 'Customer ID').setDisplayType('hidden');

        form.addSubmitButton('Duplicate');
        form.addButton('update_table', 'Refresh Table', 'displayBarcodesTable()');
        form.addButton('download_csv', 'Export as CSV', 'downloadCsv()');
        form.setScript('customscript_cl_reallocate_barcodes');
        response.writePage(form);
    } else {
        var selector_id = request.getParameter('custpage_selector_id');
        var selector_type = request.getParameter('custpage_selector_type');
        var customer_id = request.getParameter('custpage_customer_id');
        var zee_id = request.getParameter('custpage_zee_id');
        var result_set_length = request.getParameter('custpage_result_set_length');
        var timestamp = request.getParameter('custpage_timestamp');

        var params = {
            custscript_selector_id: selector_id,
            custscript_selector_type: selector_type,
            custscript_customer_id2: customer_id,
            custscript_zee_id2: zee_id,
            custscript_timestamp2: timestamp
        };
        var reschedule_status = nlapiScheduleScript('customscript_ss_reallocate_barcodes', 'customdeploy_ss_reallocate_barcodes', params);
        nlapiLogExecution('DEBUG', 'reschedule_status', reschedule_status);

        var params_progress = {
            custparam_selector_id: selector_id,
            custparam_selector_type: selector_type,
            custparam_result_set_length: result_set_length,
            custparam_timestamp: timestamp
        };
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_reallocated_barcodes', 'customdeploy_sl_reallocated_barcodes', null, params_progress);
    }
}

/**
 * The "selector" input field. 
 * The user can choose to select the barcodes corresponding to the "Invoice number", 
 * the "Barcode number" or the "Product Order ID".
 * @return  {String}    inlineQty
 */
function selectorSection() {
    var inlineQty = '<div class="form-group container selector_section">';
    inlineQty += '<div class="row">';
    inlineQty += '<div class="col-xs-12 selector_number">';
    inlineQty += '<div class="input-group">';

    inlineQty += '<span class="input-group-addon" id="selector_text">INVOICE NUMBER</span>';
    inlineQty += '<div class="input-group-btn">';
    inlineQty += '<button tabindex="-1" data-toggle="dropdown" class="btn btn-default dropdown-toggle" type="button">';
    inlineQty += '<span class="caret"></span>';
    inlineQty += '<span class="sr-only">Toggle Dropdown</span>';
    inlineQty += '</button>';
    inlineQty += '<ul class="dropdown-menu hide" style="list-style:none;margin: 2px 0 0;">';
    inlineQty += '<li><a href="#">INVOICE NUMBER</a></li>';
    inlineQty += '<li><a href="#">BARCODE NUMBER</a></li>';
    inlineQty += '<li><a href="#">PRODUCT ORDER ID</a></li>';
    inlineQty += '</ul>';
    inlineQty += '</div>';
    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="INV123456">';

    inlineQty += '</div></div></div></div>';

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
    inlineQty += '<div class="col-xs-6 customer_id"><div class="input-group"><span class="input-group-addon" id="customer_id_text">NEW CUSTOMER ID</span><input id="customer_id" class="form-control customer_id"></div></div>';
    // Customer name field
    inlineQty += '<div class="col-xs-6 customer_name"><div class="input-group"><span class="input-group-addon" id="customer_name_text">NEW CUSTOMER NAME</span><input id="customer_name" class="form-control customer_name" readonly></div></div>';
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
    inlineQty += '<th><input type="checkbox" id="select_all"></th>';
    inlineQty += '<th>Record ID</th>';
    inlineQty += '<th>Barcode Name</th>';
    inlineQty += '<th>Invoice Number</th>';
    inlineQty += '<th>Single Product Name</th>';
    inlineQty += '<th>Product Order ID</th>';
    inlineQty += '<th>Old Customer Name</th>';
    inlineQty += '<th>Old Franchisee Name</th>';
    inlineQty += '<th>New Customer Name</th>';
    inlineQty += '<th>New Franchisee Name</th>';
    inlineQty += '</tr>';
    inlineQty += '</thead>';

    inlineQty += '<tbody id="result_barcodes_slice"></tbody>';

    inlineQty += '</table>';
    return inlineQty;
}
