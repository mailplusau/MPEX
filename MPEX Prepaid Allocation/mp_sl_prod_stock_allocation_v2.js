function orders_page(request, response) {

	var ctx = nlapiGetContext();
	var zee = ctx.getUser();
	var role = ctx.getRole();

	if (role == 1000) {
		// Franchisee
		zee = ctx.getUser();
	} else {
		zee = 0;
	}

	var product_order_id = null;
	var customer_id = null;
	var customerRec;
	var trial_page = 'F';
	var sales_record_id;
	var reconcile_page = null;

	var date_of_entry;

	var d = new Date();
	d.setHours(d.getHours() + 17);
	var curr_date = d.getDate();
	var curr_month = d.getMonth();
	var curr_year = d.getFullYear();
	date_of_entry = nlapiDateToString(d);

	var assign_zee;

	if (request.getMethod() == "GET") {
		/**
		 * Initialise Customer List ???
		 */

		ap_stock_receipt_id = request.getParameter('ap_stock_receipt_id');
		uploaded_file_id_1 = request.getParameter('uploaded_file_id_1');
		uploaded_file_id_2 = request.getParameter('uploaded_file_id_2');
		trial_page = request.getParameter('trial_page');
		sales_record_id = request.getParameter('sales_record_id');
		assign_zee = request.getParameter('zee');
		product_order_id = request.getParameter('product_order_id');
		customer_id = request.getParameter('customer_id');
		var custscript_partner = request.getParameter('custscript_partner');

		if (!isNullorEmpty(custscript_partner)) {
			reconcile_page = 'T';
		}

		if (!isNullorEmpty(customer_id)) {
			customerRec = nlapiLoadRecord('customer', customer_id);
		}

		var inlinehtml2 = '<div style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:100%"><b><u>Important Instructions:</u></b><br></div><br/><br/>';

		// Create Form

		var form = nlapiCreateForm('MPEX Prepaid Order Creation');

		form.addField('custpage_html2', 'inlinehtml').setPadding(1)
				.setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

		form.addField('product_order_id', 'text', 'Product ID').setDisplayType(
				'hidden').setDefaultValue(product_order_id);
		form.addField('customer_id', 'text', 'customer ID').setDisplayType(
				'hidden').setDefaultValue(customer_id);
		form.addField('reconcile_page', 'text', 'Reconcile').setDisplayType(
				'hidden').setDefaultValue(reconcile_page);
		form.addField('custscript_partner', 'text', 'Reconcile')
				.setDisplayType('hidden').setDefaultValue(custscript_partner);
		form.addField('assign_zee', 'text', 'Reconcile').setDisplayType(
				'hidden').setDefaultValue(assign_zee);
		form.addField('deliver_later_text', 'text', 'Deliver Later')
				.setDisplayType('hidden').setDefaultValue('F');
		form.addField('item_list_count', 'text', 'Count').setDisplayType(
				'hidden');
		form.addField('delete_order_status', 'text', 'Delete').setDisplayType(
				'hidden');
		form.addField('last_item', 'text', 'Last Item')
				.setDisplayType('hidden');
		form.addField('sales_rep', 'text', 'Sales Rep')
				.setDisplayType('hidden');

		form.addField('trial_page', 'text', 'Trial Page').setDisplayType(
				'hidden').setDefaultValue(trial_page);
		form.addField('sales_record_id', 'text', 'Sales Record ID')
				.setDisplayType('hidden').setDefaultValue(sales_record_id);

		// visible fields
		form.addField('order_date', 'date', 'Order Date').setLayoutType(
				'startrow').setDisplaySize(50).setMandatory(true);

		if (role == 1000) { // franchisee
			form.addField('franchisee', 'select', 'Franchisee', 'partner')
					.setLayoutType('startrow');
		} else {
			form.addField('franchisee', 'select', 'Franchisee', 'partner')
					.setLayoutType('startrow').setMandatory(true);
			
		}

		if (assign_zee == 'F') {
//			var customer_order = form
//					.addField('customer', 'select', 'Customer').setLayoutType(
//							'startrow').setDisplaySize(300).setMandatory(true);
		} else {
			zee = assign_zee;
			var customer_order = form
					.addField('customer', 'select', 'Customer').setLayoutType(
							'startrow').setDisplaySize(300);
			var filterExpression = [];

			if (role == 1000) { // Franchisee

				zee = ctx.getUser();
				filterExpression = [
						[['status', 'anyof', 13], 'or', ['status', 'anyof', 32]],
						'and', ['partner', 'anyof', zee], 'and',
						['custentity_ap_lpo_customer', 'noneof', 1]];

			} else if (isNullorEmpty(customer_id)) {
				filterExpression = [
						[['status', 'anyof', 13], 'or', ['status', 'anyof', 32]],
						'and', ['partner', 'anyof', zee], 'and',
						['custentity_np_customer_type', 'anyof', '@NONE@'],
						'and', ['custentity_ap_lpo_customer', 'noneof', 1]];
			} else {

				filterExpression = [
						[['status', 'anyof', 13], 'or', ['status', 'anyof', 32]],
						'and',
						['partner', 'anyof',
								customerRec.getFieldValue('partner')], 'and',
						['custentity_np_customer_type', 'anyof', '@NONE@'],
						'and', ['custentity_ap_lpo_customer', 'noneof', 1]];

			}

			var col_cust = [];
			col_cust[col_cust.length] = new nlobjSearchColumn('internalid');
			col_cust[col_cust.length] = new nlobjSearchColumn('entityid');
			col_cust[col_cust.length] = new nlobjSearchColumn('companyname')
					.setSort();

			var custSearch = nlapiSearchRecord('customer', null,
					filterExpression, col_cust);

			customer_order.addSelectOption('', '');

			for (i = 0; i < custSearch.length; i++) {
				customer_order.addSelectOption(custSearch[i]
						.getValue('internalid'), custSearch[i]
						.getValue('companyname')
						+ ' | ' + custSearch[i].getValue('entityid'));
			}

		}

		form.addField('space_11', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_12', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_13', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_14', 'inlinehtml', '').setLayoutType('startrow');

		// editable fields
		form.addField('ordered_by', 'text', 'Ordered By').setDisplaySize(41, 5)
				.setMaxLength(255);
		form.addField('po', 'text', 'Customer PO#').setDisplaySize(41, 5)
				.setMaxLength(255);
		form.addField('source', 'select', 'Source',
				'customlist_satchel_order_source_2').setMandatory(true);

		form.addField('space_1', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_2', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_3', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_4', 'inlinehtml', '').setLayoutType('startrow');
		form.addField('space_15', 'inlinehtml', '').setLayoutType('startrow');

		form.addSubTab('custpage_orders', 'Orders', 'custom_orders');
		var sublistAdd = form.addSubList('item', 'inlineeditor', 'Orders',
				'custpage_orders');

		/**
		 * Search to get the List of Item Records
		 */
		var apItemSearch = nlapiLoadSearch('customrecord_ap_item',
				'customsearch_ap_item_10_packs');

		var resultSetApItemSearch = apItemSearch.runSearch();
		var item_list = sublistAdd.addField('item', 'select', 'Item')
		.setMandatory(true);
		
		item_list.addSelectOption('', '');
		
		resultSetApItemSearch.forEachResult(function(searchResult) {

			var ap_item_internal_id = searchResult.getValue('internalid');
			var ap_item_name = searchResult.getValue('name');

			item_list.addSelectOption(ap_item_internal_id, ap_item_name);
			return true;
		});



		sublistAdd.addField('quantity', 'integer', 'Quantity').setDisplayType(
				'hidden');
		var inv_details_length = sublistAdd.addField('barcode', 'text',
				'Barcode').setMaxLength(33).setDisplaySize(50).setMandatory(
				true);
		// inv_details_length.maxLength = 40;
		sublistAdd.addField('internalid', 'integer', 'InternalID')
				.setDisplayType('hidden');
		// sublistAdd.addField('deleteditem', 'text', 'Deleted
		// Item').setDisplayType('hidden');
		sublistAdd.addField('dontvalidate_add', 'checkbox', 'Dont Validate')
				.setDisplayType('hidden');

		form.setScript('customscript_cl_prod_stock_allocation');

		// form.addButton('deliver_later', 'Deliver Later',
		// 'onclick_deliverLater()');
		form.addSubmitButton("Allocate");

		response.writePage(form);

	} else {

		

		nlapiLogExecution('DEBUG', '4', '4')
		nlapiSetRedirectURL('SUITELET',
				'customscript_sl_prod_stock_allocated_lis',
				'customdeploy_sl_prod_stock_allocated_lis', null, null);

	}

}

function getDate() {
	var date = new Date();
	// if (date.getHours() > 6) {
	date = nlapiAddDays(date, 1);
	// }
	date = nlapiDateToString(date);

	return date;
}