/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-04-11 12:25:19   		ankith.ravindran
 *
 * Description:         
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-06-12 14:01:13
 *
 */

var usage_threshold = 50; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {


	nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock'));
	if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock'))) {
		prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock');
	} else {
		prev_inv_deploy = ctx.getDeploymentId();
	}

	var prodStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_prod_stock_per_customer_2_2');
	var resultProdStock = prodStockSearch.runSearch();

	var old_customer_id = null;
	var product_order_id;
	var stock_mped = false

	resultProdStock.forEachResult(function(searchResult) {

		var usage_loopstart_cust = ctx.getRemainingUsage();
		if (usage_loopstart_cust < usage_threshold) {

			var params = {
				custscript_prev_deploy_update_stock: ctx.getDeploymentId(),
			}

			reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
			nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
			if (reschedule == false) {

				return false;
			}
		}


		var customer_id = searchResult.getValue("custrecord_cust_prod_stock_customer", null, "GROUP");
		var barcode_beg = searchResult.getValue("custrecord_ap_item_sku", "CUSTRECORD_CUST_STOCK_PROD_NAME", "GROUP");
		var product_count = searchResult.getValue("name", null, "COUNT");

		var field = 'custentity_' + barcode_beg.toLowerCase();

		if (!isNullorEmpty(old_customer_id) && old_customer_id != customer_id) {
			var customer_record = nlapiLoadRecord('customer', old_customer_id);
			customer_record.setFieldValue('custentity_mpex_usage_update', 1);

			nlapiSubmitRecord(customer_record);
		}



		var customer_record = nlapiLoadRecord('customer', customer_id);
		customer_record.setFieldValue(field, product_count);

		nlapiSubmitRecord(customer_record);

		old_customer_id = customer_id;

		return true;
	});

	if (!isNullorEmpty(old_customer_id) && old_customer_id != customer_id) {
		var customer_record = nlapiLoadRecord('customer', old_customer_id);
		customer_record.setFieldValue('custentity_mpex_usage_update', 1);

		nlapiSubmitRecord(customer_record);
	}


}