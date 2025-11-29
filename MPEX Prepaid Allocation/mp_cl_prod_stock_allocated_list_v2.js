var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

var d = new Date();
// d.setHours(d.getHours() + 17);
var curr_date = d.getDate();
var curr_month = d.getMonth();
var curr_year = d.getFullYear();
var date_of_entry = nlapiDateToString(d);

var button_css_edit = "display: inline-block; margin-bottom: 0;font-weight: bold;text-align: center;vertical-align: middle;cursor: pointer;background-image: none;border: 1px solid transparent;white-space: nowrap;padding: 5px 12px;font-size: 14px;line-height: 1.428571429;border-radius: 30px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; background-color:rgb(63, 149, 252);color: white;margin-right: 10px;";

function clientPageInit(type) {

	$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
	$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
	$(".uir-outside-fields-table").css("width", "100%");
	$("#body").css("background-color", "#CFE0CE");

	// Search: MPEX Prepaid Orders
	var mpexPrepaidOrders = nlapiLoadSearch('customrecord_mp_ap_product_order',
			'customsearch_mpex_prepaid_orders');

	if (!isNullorEmpty(parseInt(nlapiGetFieldValue('zee')))
			&& parseInt(nlapiGetFieldValue('zee')) != 0) {
		$('.add_order_button').removeClass('hide');
		var addFilterExpression;
		addFilterExpression = new nlobjSearchFilter(
				'custrecord_mp_ap_order_franchisee', null, 'anyof',
				parseInt(nlapiGetFieldValue('zee')));
		mpexPrepaidOrders.addFilter(addFilterExpression);
	}
	// if (!isNullorEmpty(nlapiGetFieldValue('customer'))) {
	// addFilterExpression = new nlobjSearchFilter(
	// 'custrecord_ap_order_customer', 'internalid', 'anyof',
	// parseInt(nlapiGetFieldValue('customer')));
	// }
	//
	//	

	var resultMPEXPrepaidOrders = mpexPrepaidOrders.runSearch();

	var count = 0;
	var old_prod_order_id = 0;

	var dataSet = '{"data":[';

	resultMPEXPrepaidOrders.forEachResult(function(searchResult) {
		var prod_order_internal_id = searchResult.getValue("internalid");
		var prod_order_date_created = searchResult.getValue("created");
		var prod_order_date = searchResult
				.getValue("custrecord_mp_ap_order_date");
		var prod_order_status = searchResult
				.getValue("custrecord_mp_ap_order_order_status");
		var prod_order_customer = searchResult
				.getText("custrecord_ap_order_customer");
		var prod_order_zee = searchResult
				.getText("custrecord_mp_ap_order_franchisee");
		var prod_order_status = searchResult
				.getText("custrecord_mp_ap_order_order_status");
		var prod_order_line_item = searchResult.getValue(
				"custrecord_ap_stock_line_item", "CUSTRECORD_AP_PRODUCT_ORDER",
				null);
		var prod_order_zee_qty = searchResult.getValue(
				"custrecord_ap_stock_line_actual_qty",
				"CUSTRECORD_AP_PRODUCT_ORDER", null);
		var prod_order_inv_details = searchResult.getValue(
				"custrecord_ap_line_item_inv_details",
				"CUSTRECORD_AP_PRODUCT_ORDER", null);

		// if (count == 0) {
		dataSet += '{"prod_internal_id":"' + prod_order_internal_id
				+ '", "prod_order_date":"' + prod_order_date
				+ '", "prod_order_date_created":"' + prod_order_date_created
				+ '", "prod_order_status":"' + prod_order_status
				+ '", "prod_order_status":"' + prod_order_status
				+ '", "prod_order_customer":"' + prod_order_customer
				+ '","prod_order_zee": "' + prod_order_zee + '"},';
		// dataSet += '"ap_line_items":[';
		// dataSet += '{"prod_order_line_item":"' + prod_order_line_item
		// + '", "prod_order_zee_qty":"' + prod_order_zee_qty
		// + '", "prod_order_inv_details":"' + prod_order_inv_details
		// + '},';
		// } else if (old_prod_order_id != prod_order_internal_id) {
		// dataSet += ']},'
		// dataSet += '{"prod_internal_id":"' + prod_order_internal_id
		// + '", "prod_order_date":"' + prod_order_date
		// + '", "prod_order_status":"' + prod_order_status
		// + '", "prod_order_customer":"' + prod_order_customer
		// + '","prod_order_zee": "' + prod_order_zee + '",';
		// dataSet += '"ap_line_items":[';
		// dataSet += '{"prod_order_line_item":"' + prod_order_line_item
		// + '", "prod_order_zee_qty":"' + prod_order_zee_qty
		// + '", "prod_order_inv_details":"' + prod_order_inv_details
		// + '},';
		// }

		old_prod_order_id = prod_order_internal_id;
		count++;
		return true;
	});

	if (count > 0) {
		dataSet = dataSet.substring(0, dataSet.length - "1");
		console.log(dataSet);
		dataSet += ']}';
	} else {

		dataSet += ']}';
	}

	console.log(dataSet);
	var parsedData = JSON.parse(dataSet);
	console.log(parsedData.data);

	$(document)
			.ready(
					function() {
						table = $("#stockcount")
								.DataTable(
										{
											"data" : parsedData.data,
											"columns" : [
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b><a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id='
																	+ data.prod_internal_id
																	+ '"><input type="button" id="add_order" name="add_order" value="VIEW"  style="'
																	+ button_css_edit
																	+ '"></a></b><p>';
														}
													},
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b>'
																	+ data.prod_order_date_created
																	+ '</b></p>';
														}
													},
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b>'
																	+ data.prod_order_date
																	+ '</b></p>';
														}
													},
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b>'
																	+ data.prod_order_customer
																	+ '</b></p>';
														}
													},
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b>'
																	+ data.prod_order_zee
																	+ '</b></p>';
														}
													},
													{
														"data" : null,
														"render" : function(
																data, type, row) {
															return '<p><b>'
																	+ data.prod_order_status
																	+ '</b></p>';
														}
													}],
											// "order" : [[2, 'desc']],
											"pageLength" : 500,
											"scrollY" : "1000px",
											"fixedHeader" : {
												"header" : true
											},
											"createdRow" : function(row, data,
													index) {
												if (data.prod_order_status == 'Order invoiced') {
													$('td', row).eq(3).css(
															'background-color',
															'##cfe0ce');

												} else if (data.mpex_5kg == 2) {
													$('td', row).eq(3).css(
															'background-color',
															'#a7a6a1');

												}
											}
										});
					});

}

$(document).on('change', '#zee_dropdown', function(event) {
	var run = $(this).val();
	var zee_id = $('option:selected', '#zee_dropdown').val();
	var barcode = $('.barcode').val();

	$('.add_order_button').removeClass('hide');

	if (isNullorEmpty(barcode)) {
		barcode = null;
	}

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=862&deploy=1";

	url += "&zee=" + zee_id + "&barcode=" + barcode;

	window.location.href = url;
});

$(document).on('change', '.customer_dropdown', function(event) {
	var run = $(this).val();
	var customer_id = $('option:selected', '.customer_dropdown').val();
	var barcode = $('.barcode').val();

	if (isNullorEmpty(barcode)) {
		barcode = null;
	}

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=862&deploy=1";

	url += "&customer_id=" + customer_id + "&barcode=" + barcode;

	window.location.href = url;
});

$(document).on('focusout', '.barcode', function(event) {
	var run = $(this).val();
	var barcode = $('.barcode').val();
	var customer_id = $('option:selected', '.customer_dropdown').val();

	if (isNullorEmpty(customer_id)) {
		customer_id = null;
	}

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=862&deploy=1";

	url += "&barcode=" + barcode + "&customer_id=" + customer_id;

	window.location.href = url;
});

// function to create a new order and send to new suitlet
function onclick_AddOrder() {
	var zee_id = $('option:selected', '#zee_dropdown').val();
	if (zee_id != 0) {
		var upload_url = baseURL
				+ nlapiResolveURL('SUITELET',
						'customscript_sl_prod_stock_allocation',
						'customdeploy_sl_prod_stock_allocation')
				+ '&product_order_id=&customer_id=&zee=' + zee_id;
		window.open(upload_url, "_self",
				"height=750,width=650,modal=yes,alwaysRaised=yes");
	}

}

function onclick_AddOrdertoZee() {

	var upload_url = baseURL
			+ nlapiResolveURL('SUITELET',
					'customscript_sl_prod_stock_allocation',
					'customdeploy_sl_prod_stock_allocation')
			+ '&product_order_id=&customer_id=&zee=T';
	window.open(upload_url, "_self",
			"height=750,width=650,modal=yes,alwaysRaised=yes");
}

// function to change states of sales order to pending billing
function onclick_ConfirmOrder(internal_id) {

	var internal_id = internal_id;

	var custProdStock = nlapiLoadRecord('customrecord_customer_product_stock',
			internal_id);

	custProdStock.setFieldValue('custrecord_cust_prod_stock_status', 5);
	// alert(date_of_entry);
	custProdStock.setFieldValue('custrecord_cust_date_stock_used', getDate());

	nlapiSubmitRecord(custProdStock);

	var upload_url = baseURL
			+ nlapiResolveURL('SUITELET',
					'customscript_sl_prod_stock_allocated_lis',
					'customdeploy_sl_prod_stock_allocated_lis');
	window.open(upload_url, "_self",
			"height=750,width=650,modal=yes,alwaysRaised=yes");

}

function onclick_DeliverOrder(internal_id) {

	var internal_id = internal_id;

	var custProdStock = nlapiLoadRecord('customrecord_customer_product_stock',
			internal_id);

	custProdStock.setFieldValue('custrecord_cust_prod_stock_status', 4);
	// alert(date_of_entry);
	custProdStock.setFieldValue('custrecord_cust_date_stock_used', getDate());

	nlapiSubmitRecord(custProdStock);

	var upload_url = baseURL
			+ nlapiResolveURL('SUITELET',
					'customscript_sl_prod_stock_allocated_lis',
					'customdeploy_sl_prod_stock_allocated_lis');
	window.open(upload_url, "_self",
			"height=750,width=650,modal=yes,alwaysRaised=yes");

}

// function to cancel the sales order
function onclick_CancelOrder(internal_id) {

	alert('Order Cancellation is an irreversible change');

	var internal_id = internal_id;

	var custProdStock = nlapiLoadRecord('customrecord_customer_product_stock',
			internal_id);

	custProdStock.setFieldValue('isinactive', 'T');

	nlapiSubmitRecord(custProdStock);

	var upload_url = baseURL
			+ nlapiResolveURL('SUITELET',
					'customscript_sl_prod_stock_allocated_lis',
					'customdeploy_sl_prod_stock_allocated_lis');
	window.open(upload_url, "_self",
			"height=750,width=650,modal=yes,alwaysRaised=yes");
}

// function to edit order and send to new suitlet
function onclick_EditOrder(internal_id, customer_id) {

	var upload_url = baseURL
			+ nlapiResolveURL('SUITELET',
					'customscript_sl_prod_stock_allocation',
					'customdeploy_sl_prod_stock_allocation') + '&customer_id='
			+ customer_id + '&zee=F&product_order_id=' + internal_id;
	window.open(upload_url, "_self",
			"height=750,width=650,modal=yes,alwaysRaised=yes");

}

function getDate() {
	var date = new Date();
	// if (date.getHours() > 6) {
	// date = nlapiAddDays(date, 1);
	// }
	date = nlapiDateToString(date);
	return date;
}