var item_rates = ['a', 'b', 'c', 'd'];

function orders_main_page(request, response) {

	var ctx = nlapiGetContext();
	var zee = ctx.getUser();
	var role = ctx.getRole();

	// CSS for the Delivered button
	var button_css_delivered = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:rgb(2, 193, 52); color: white;margin-right: 10px;";

	var button_css_disabled = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:#9E9E9E; color: white;margin-right: 10px;";
	// CSS for the Edit button
	var button_css_edit = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:rgb(63, 149, 252);color: white;margin-right: 10px;";

	var button_css = "display: inline-block; margin-bottom: 0;font-weight: normal;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 8px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 30px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-color: #103D39; color: white;";
	// CSS for the Cancel button
	var button_css_cancel = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:#dc1928; color: white;";

	var button_css_resolved = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:#187bf2; color: white;";

	var button_css_animated = ".button {display: inline-block; border-radius: 4px; background-color: #f4511e; border: none; color: #FFFFFF; text-align: center; font-size: 28px; padding: 20px; width: 200px; transition: all 0.5s; cursor: pointer; margin: 5px; } .button span {cursor: pointer; display: inline-block; position: relative; transition: 0.5s; } .button span:after {content: '»'; position: absolute; opacity: 0; top: 0; right: -20px; transition: 0.5s; } .button:hover span {padding-right: 25px; } .button:hover span:after {opacity: 1; right: 0; }"

	var focus_fields = "text-transform: uppercase; font-weight: bold;";

	if (ctx.getRole() == 1000) { // Franchisee

		zee = ctx.getUser();

	} else {

		zee = 0; // Test

	}

	var salesorder_id = null;
	var transform_code = null;

	var customer_id = null;
	var barcode = null;

	if (request.getMethod() == "GET") {

		var inlinehtml2 = '<div style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:100%"><b><u>Important Information: </u></b></br>Please Select Franchisee and then click on <b>Allocate Product - Customer</b><br></div><br/><br/>';

		inlinehtml2 += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392606&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><script src="https://cdn.datatables.net/fixedheader/3.1.2/js/dataTables.fixedHeader.min.js" type="text/javascript"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.2/css/fixedHeader.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

		customer_id = request.getParameter('customer_id');
		barcode = request.getParameter('barcode');
		zee = request.getParameter('zee');

		nlapiLogExecution('DEBUG', 'Zee Request', zee);
		if (isNullorEmpty(zee)) {
			zee = 0;
		}

		// Create Form

		var form = nlapiCreateForm('MPEX Prepaid Orders');

		form.addField('custpage_html2', 'inlinehtml').setPadding(1)
				.setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

		form
				.addField('add_order', 'inlinehtml', '')
				.setLayoutType('startrow')
				.setDefaultValue(
						'<input type="button" id="add_order" name="add_order" value="Allocate Product - Customer" onclick="onclick_AddOrder()" class="hide add_order_button" style="'
								+ button_css + '">  ');

		var inlineHtml = '<br><br>';

		if (role != 1000) {
			
			var searched_zee = nlapiLoadSearch('partner',
					'customsearch_job_inv_process_zee');

			var resultSet_zee = searched_zee.runSearch();

			inlineHtml += franchiseeDropdownSection(resultSet_zee,
					request);
			
		} else {
			inlineHtml += '<div class="container" style="padding-top: 12%;"></div>';
		}

		inlineHtml += '<table border="0" cellpadding="15" id="stockcount" class="display tablesorter table table-striped table table-striped table-bordered table-hover dataTable no-footer" cellspacing="0" style="width: 100% !important;"><thead style="color: white;background-color: #607799;"><tr><th>LINK</th><th><b>DATE CREATED</b></th><th><b>ORDER DATE</b></th><th><b>CUSTOMER NAME</b></th><th><b>FRANCHISEE</b></th><th><b>STATUS</b></th></tr></thead><tbody>';

		form.addField('customer', 'text', 'zee').setDisplayType('hidden')
				.setDefaultValue(customer_id);
		form.addField('barcode', 'text', 'zee').setDisplayType('hidden')
				.setDefaultValue(barcode);
		form.addField('zee', 'text', 'zee').setDisplayType('hidden')
				.setDefaultValue(parseInt(zee));

		inlineHtml += '</tbody>';
		inlineHtml += '</table><br/>';

		var inlinehtml1 = '';

		form.addField('preview_table', 'inlinehtml', '').setLayoutType(
				'outsidebelow').setDefaultValue(inlineHtml + inlinehtml1);

		form.setScript('customscript_cl_prod_stock_allocation_li');
		// form.addSubmitButton("Submit");

		response.writePage(form);

	} else {

	}

}

/**
 * The franchisee dropdown field.
 * 
 * @param {String}
 *            date_from
 * @param {String}
 *            date_to
 * @return {String} `inlineHtml`
 */
function franchiseeDropdownSection(resultSet_zee, request) {
	var inlineHtml = '<div class="form-group container date_filter_section">';
	inlineHtml += '<div class="row">';
	inlineHtml += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #103D39;">FRANCHISEE</span></h4></div>';
	inlineHtml += '</div>';
	inlineHtml += '</div>';

	inlineHtml += '<div class="form-group container zee_dropdown_section">';
	inlineHtml += '<div class="row">';
	// Period dropdown field
	inlineHtml += '<div class="col-xs-12 zee_dropdown_div">';
	inlineHtml += '<div class="input-group">';
	inlineHtml += '<span class="input-group-addon" id="zee_dropdown_text">Franchisee</span>';
	inlineHtml += '<select id="zee_dropdown" class="form-control">';
	inlineHtml += '<option value=""></option>'
	resultSet_zee.forEachResult(function(searchResult_zee) {

		zeeid = searchResult_zee.getValue('internalid');
		zee_name = searchResult_zee.getValue('entityid');

		if (request.getParameter('zee') == zeeid) {
			inlineHtml += '<option value="' + zeeid + '" selected="selected">'
					+ zee_name + '</option>';
			zee = zeeid;
		} else {
			inlineHtml += '<option value="' + zeeid + '">' + zee_name
					+ '</option>';
		}

		return true;
	});
	inlineHtml += '</select>';
	inlineHtml += '</div></div></div></div>';

	return inlineHtml;

}

// ROUND TO TWO DECIMAL PLACES
function roundTwoDec(num) {
	return Math.round(num * 100) / 100;
}