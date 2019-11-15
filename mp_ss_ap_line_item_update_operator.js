var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();


function updateApLineItemOperator(){

	prev_inv_deploy = ctx.getDeploymentId();
	
	var apLineItemSearch = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_mpex_ap_line_item_upd_oper');

	var resultApLineItemSearch = apLineItemSearch.runSearch();


	resultApLineItemSearch.forEachResult(function(searchResult) {

		var usage_loopstart_cust = ctx.getRemainingUsage();
		if (usage_loopstart_cust < 100) {

				reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
				nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
				if (reschedule == false) {

					return false;
				}
			}


		var internal_id = searchResult.getValue('internalid');
		var barcode = searchResult.getValue('custrecord_ap_line_item_inv_details');

		var barcode_only = barcode.split(' - ');

		var ap_line_item_record = nlapiLoadRecord('customrecord_ap_stock_line_item', internal_id);

		nlapiLogExecution('DEBUG', 'Barcode', barcode);

		var productStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');

		var temp_expression = 'AND';
		var newFilterExpression = [
			["name", "is", barcode_only[1]], 'AND', ["isinactive", "is", "F"], 'AND', ["custrecord_cust_prod_stock_operator", "noneof", "@NONE@"]
		];

		productStockSearch.setFilterExpression(newFilterExpression);

		var resultSetProductStock = productStockSearch.runSearch();
		resultSetProductStock.forEachResult(function(searchResult) {

			var customer_prod_stock_id = searchResult.getValue('internalid');

			var customer_prod_stock = nlapiLoadRecord('customrecord_customer_product_stock', customer_prod_stock_id);

			var operator_id = customer_prod_stock.getFieldValue('custrecord_cust_prod_stock_operator');

			
			if(!isNullorEmpty(operator_id)){
				ap_line_item_record.setFieldValue('custrecord_ap_line_item_operator', operator_id);

				
			}
			

			return true;
		});

		ap_line_item_record.setFieldValue('custrecord_ap_line_item_operator_check', 1);
			nlapiSubmitRecord(ap_line_item_record);

		return true;
	});
}