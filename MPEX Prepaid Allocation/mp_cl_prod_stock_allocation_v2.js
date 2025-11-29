var product_order_id;
var customer_id;
var productOrder;
var saved_item = null;
var date_of_entry;

var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth();
var curr_year = d.getFullYear();
date_of_entry = nlapiDateToString(d);

var ctx = nlapiGetContext();
var zee = ctx.getUser();

var start = 0;

var item_listed_id = [];

if (ctx.getRole() == 1000) { // Franchisee

	zee = ctx.getUser();

} else {

	zee = 0; // Test

}

var done_loading = false;

var baseURL = 'https://system.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

function clientPageInit(type) {

	// $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
	// $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
	// $("#body").css("background-color", "#CFE0CE");

	product_order_id = nlapiGetFieldValue('product_order_id');
	customer_id = nlapiGetFieldValue('customer_id');
	zee = nlapiGetFieldValue('assign_zee');
	var custscript_partner = nlapiGetFieldValue('custscript_partner');

	// document.getElementById('delete_order').style.display = 'none';
	// document.getElementById('secondarydelete_order').style.display = 'none';

	// if new product order
	if (isNullorEmpty(product_order_id)) {

		// created from the AusPost Product Allocation 2.0 page
		if (isNullorEmpty(customer_id)) {
			if (!isNullorEmpty(custscript_partner)) {
				nlapiSetFieldValue('franchisee', custscript_partner);
			} else {
				if (zee != 0) {
					nlapiSetFieldValue('franchisee', zee);
				}
			}
			// nlapiDisableField('franchisee', true);

			nlapiSetFieldValue('source', 4);
			nlapiDisableField('source', true);
		}
		// Created from the customer page
		else {

			nlapiSetFieldValue('customer', customer_id);

			var customerRec = nlapiLoadRecord('customer', customer_id);

			nlapiSetFieldValue('franchisee', customerRec
					.getFieldValue('partner'));

			nlapiDisableField('franchisee', true);
			nlapiDisableField('customer', true);

			nlapiSetFieldValue('sales_rep', ctx.getUser());
		}

	}
	// editing the Product order
	else {

		productOrder = nlapiLoadRecord('customrecord_customer_product_stock',
				product_order_id);

		nlapiSetFieldValue('customer', productOrder
				.getFieldValue('custrecord_cust_prod_stock_customer'));
		nlapiDisableField('franchisee', true);

		nlapiSetFieldValue('franchisee', productOrder
				.getFieldValue('custrecord_cust_prod_stock_zee'));

		nlapiSetFieldValue('order_date', productOrder
				.getFieldValue('custrecord_cust_date_stock_given'));

		nlapiSetFieldValue('source', productOrder
				.getFieldValue('custrecord_cust_prod_stock_source'));
		nlapiDisableField('source', true);

		nlapiSelectNewLineItem('item');

		// set the item and location values on the currently selected line
		nlapiSetCurrentLineItemValue('item', 'item', productOrder
				.getFieldValue('custrecord_cust_prod_stock_single_name'), true,
				true);

		nlapiSetCurrentLineItemValue('item', 'quantity', 1, true, true);
		nlapiSetCurrentLineItemValue('item', 'barcode', productOrder
				.getFieldValue('name'), true, true);

		// commit the line to the database
		nlapiCommitLineItem('item');
		nlapiDisableLineItemField('item', 'item', 1)
		nlapiDisableLineItemField('item', 'barcode', 1)

	}

	done_loading = true;

}

// Status of the order is new
function onclick_deliverLater() {

	product_order_id = nlapiGetFieldValue('product_order_id');

	var order_date = nlapiGetFieldValue('order_date');
	var customer = nlapiGetFieldValue('customer');

	if (isNullorEmpty(order_date)) {
		alert('Please enter the Order Date');
		return false;
	}

	if (isNullorEmpty(customer)) {
		alert('Please select a customer');
		return false;
	}

	nlapiSetFieldValue('deliver_later_text', 'T');

	document.getElementById("secondarysubmitter").click();
}

function clientFieldChanged(type, name, linenum) {

	console.log('type: ' + type);
	console.log('name: ' + name);
	console.log('name: ' + nlapiGetFieldValue(name));

	// if (name == 'franchisee') {
	// var url = baseURL
	// + "/app/site/hosting/scriptlet.nl?script=840&deploy=1&compid=1048144";
	//
	// url += "&zee=" + nlapiGetFieldValue(name);
	// window.location.href = url;
	// }

	if (type == 'item') {
		if (name == 'barcode') {
			var item_id = nlapiGetCurrentLineItemValue('item', 'item');
			var barcode = nlapiGetCurrentLineItemValue('item', 'barcode')
					.toUpperCase();
			console.log('item_id: ' + item_id);
			console.log('barcode' + barcode);
			if (!isNullorEmpty(item_id)) {
				var ap_item_record = nlapiLoadRecord('customrecord_ap_item',
						item_id);
				var barcode_seq = ap_item_record
						.getFieldValue('custrecord_ap_item_sku');

				var barcode_beg = barcode.slice(0, 4);

				if (barcode_beg != barcode_seq) {
					alert('Wrong Barcode Entered');
					nlapiSetCurrentLineItemValue('item', 'item', null)
					nlapiSetCurrentLineItemValue('item', 'barcode', null)
					return false
				}

			}

		}
		if (name == 'quantity') {
			var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
			if (qty > 1) {
				alert('Quantity neesds to be 1 10-pack');
				nlapiSetCurrentLineItemValue('item', 'quantity', null)
				return false
			}
		}
	}

}

// status of the order changed to fulfilled
function saveRecord() {

	product_order_id = nlapiGetFieldValue('product_order_id');

	var count = nlapiGetLineItemCount('item');
	var status = true;

	var to_check_dup = [];
	var qty_to_stored = [];

	var product_order = nlapiCreateRecord('customrecord_mp_ap_product_order');

	product_order.setFieldValue('custrecord_mp_ap_order_sales_rep',
			nlapiGetContext().getUser());
	product_order.setFieldValue('custrecord_mp_ap_order_source', 5);
	product_order.setFieldValue('custrecord_mp_ap_order_order_status', 4);
	product_order.setFieldValue('custrecord_mp_ap_order_franchisee',
			nlapiGetFieldValue('franchisee'));
	product_order.setFieldValue('custrecord_mp_ap_order_date',
			nlapiGetFieldValue('order_date'));
	product_order.setFieldValue('custrecord_ap_order_fulfillment_date',
			nlapiGetFieldValue('order_date'));
	product_order.setFieldValue('custrecord_ap_order_customer',
			nlapiGetFieldValue('customer'));
	product_order.setFieldValue('custrecord_mp_ap_order_ordered_by',
			nlapiGetFieldValue('ordered_by'));
	product_order.setFieldValue('custrecord_mp_ap_order_po',
			nlapiGetFieldValue('po'));

	var product_order_id = nlapiSubmitRecord(product_order);

	for (var x = 1; x <= count; x++) {
//
		var ap_stock_line_item = nlapiCreateRecord('customrecord_ap_stock_line_item');

		ap_stock_line_item.setFieldValue('custrecord_ap_product_order',
				product_order_id);

		ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item',
				nlapiGetLineItemValue('item', 'item', x));
		ap_stock_line_item.setFieldValue('custrecord_ap_line_item_inv_details',
				nlapiGetLineItemValue('item', 'barcode', x));
		ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_actual_qty',
				1);

		nlapiSubmitRecord(ap_stock_line_item);

		var barcode = nlapiGetLineItemValue('item', 'barcode', x)
				.toUpperCase();
	    var barcode_beg = barcode.slice(0, 4);
	    var barcode_end = barcode.slice(4);
	    var barcode_end_length = barcode_end.length;
	    var barcode_end = Number(barcode.slice(4));
	    var barcode_seq;
	    
	    console.log('barcode_beg: ' + barcode_beg)
	    console.log('barcode_end: ' + barcode_end)

		if (barcode_beg == 'MPEN' || barcode_beg == 'MPET'
				|| barcode_beg == 'MPEF' || barcode_beg == 'MPEB'
				|| barcode_beg == 'MPEC' || barcode_beg == 'MPED' || barcode_beg == 'MPEG') {

			if (barcode_beg == 'MPEN') {
				prod_id = 552;
				barcode_seq = 1
			} else if (barcode_beg == 'MPET') {
				prod_id = 553;
				barcode_seq = 1
			} else if (barcode_beg == 'MPEF') {
				prod_id = 554;
				barcode_seq = 1
			} else if (barcode_beg == 'MPEB') {
				prod_id = 550;
				barcode_seq = -1
			} else if (barcode_beg == 'MPEC') {
				prod_id = 551;
				barcode_seq = -1
			} else if (barcode_beg == 'MPED') {
				prod_id = 549;
				barcode_seq = -1
			} else if (barcode_beg == 'MPEG') {
				prod_id = 638;
				barcode_seq = 1
			}

			console.log('prod_id: ' + prod_id)
			console.log('barcode_seq: ' + barcode_seq);

			var total_length = 6;
			var remaining = total_length - barcode_end.toString().length;
			
			 console.log('remaining: ' + remaining)

			for (var i = 0; i < remaining; i++) {
				barcode_beg += '0';
			}
			 
			 console.log('barcode_beg: ' + barcode_beg)

			for (var y = 0; y < 10; y++) {

				var customer_prod_stock = nlapiCreateRecord('customrecord_customer_product_stock');
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_customer', nlapiGetFieldValue('customer'));
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_invoiceable', 2);
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_prepaid', 1);
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_zee', nlapiGetFieldValue('franchisee'));
				customer_prod_stock.setFieldValue(
						'custrecord_cust_date_stock_given', nlapiGetFieldValue('order_date'));
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_status', 1);
				customer_prod_stock.setFieldValue(
						'custrecord_cust_prod_stock_source', 6);
				customer_prod_stock.setFieldValue(
						'custrecord_cust_stock_prod_name', prod_id);
				customer_prod_stock.setFieldValue(
						'custrecord_prod_stock_prod_order', product_order_id);
				if (y == 0) {
					customer_prod_stock.setFieldValue('name', barcode);
					var barcode_name = barcode;
				} else {
					barcode_end = barcode_end + barcode_seq;
					var barcode_name = barcode_beg + barcode_end;
					customer_prod_stock.setFieldValue('name', barcode_name);
				}

				customer_prod_stock_id = nlapiSubmitRecord(customer_prod_stock);
				
				console.log('customer_prod_stock_id: ' + customer_prod_stock_id)

			}
		}
	}
	
	nlapiLogExecution('DEBUG', 'product_order_id', product_order_id);

	// var dup_result = toCheckIfUniqueArray(to_check_dup, qty_to_stored);

	// if(dup_result == false){
	// alert('Duplicated Line Items');
	// return false;
	// }

//	nlapiSetFieldValue('item_list_count', count);
	if (status == true) {
		return true;
	}
}

function validateDelete(type) {

}

function toCheckIfUniqueArray(arr, arr1) {

	for (var i = 0; i < arr.length; i++) {
		for (var x = (i + 1); x < arr.length; x++) {
			if (arr[i] == arr[x]) {
				if (arr1[i] > 0 && arr1[x] > 0) {
					return false;
				}

			}
		}
	}
	return true;
}

function onclick_deleteOrder() {

	var count = nlapiGetLineItemCount('item');

	if (count > 1) {
		alert('Order cannot be Deleted');
		return false;
	}

	nlapiSetFieldValue('delete_order_status', 'T');

	document.getElementById("secondarysubmitter").click();

}