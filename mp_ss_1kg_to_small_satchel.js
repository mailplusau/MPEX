/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-04-11 12:25:19   		ankith.ravindran
 *
 * Description:         
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-05-07 09:44:41
 *
 */

var usage_threshold = 50; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {


	nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock_inv'));
	if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock_inv'))) {
		prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_update_stock_inv');
	} else {
		prev_inv_deploy = ctx.getDeploymentId();
	}

	var prodStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_mpex_upd_1kg_small_satchel');
	var resultProdStock = prodStockSearch.runSearch();

	var old_customer_id = null;
	var product_order_id;

	resultProdStock.forEachResult(function(searchResult) {

		var usage_loopstart_cust = ctx.getRemainingUsage();
		if (usage_loopstart_cust < usage_threshold) {

			var params = {
				custscript_prev_deploy_update_stock_inv: ctx.getDeploymentId(),
			}

			reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
			nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
			if (reschedule == false) {

				return false;
			}
		}
		
		var internal_id = searchResult.getValue("internalid");
		
		var prod_stock_record = nlapiLoadRecord('customrecord_customer_product_stock', internal_id);
		prod_stock_record.setFieldValue('custrecord_cust_stock_prod_name', 581);
		nlapiSubmitRecord(prod_stock_record);

		return true;
	});
}