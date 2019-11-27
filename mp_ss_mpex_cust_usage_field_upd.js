/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-06-12 12:37:51   		ankith.ravindran
 *
 * Description: Update MPEX USAGE UPDATE field to No
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-27 11:35:48
 *
 */

var usage_threshold = 50; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {


	nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_cust_usag_upd_no'));
	if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_cust_usag_upd_no'))) {
		prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_cust_usag_upd_no');
	} else {
		prev_inv_deploy = ctx.getDeploymentId();
	}

	var prodStockSearch = nlapiLoadSearch('customer', 'customsearch_mpex_cust_usage_field_upd');
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


		var customer_id = searchResult.getValue("internalid");
		var customer_record = nlapiLoadRecord('customer', old_customer_id);
		customer_record.setFieldValue('custentity_mpex_usage_update', 2);

		nlapiSubmitRecord(customer_record);
		return true;
	});
}