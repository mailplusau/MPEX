/**
 * Module Description
 * 
 * NSVersion Date Author 1.00 2020-08-05 11:40:56 Ankith
 * 
 * Description: Update the new fields based on the product name
 * 
 * @Last Modified by: Ankith
 * @Last Modified time: 2020-08-05 11:41:56
 * 
 */

var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

	nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT',
			'custscript_prev_deploy_create_prod_order'));

	prev_inv_deploy = ctx.getDeploymentId();

	/**
	 * MPEX - Update Record Fields
	 */
	var createProdOrderSearch = nlapiLoadSearch(
			'customrecord_customer_product_stock',
			'customsearch_mpex_update_record_fields');
	var resultCreateProdOrder = createProdOrderSearch.runSearch();

	var old_customer_id = null;
	var product_order_id;
	var count = 0;

	/**
	 * Go through each line item from the search.
	 */
	resultCreateProdOrder
			.forEachResult(function(searchResult) {
				var internalid = searchResult.getValue("internalid");
				var prod_name = searchResult
						.getValue("custrecord_cust_stock_prod_name");

				var GOLD_TOLL = searchResult.getValue(
						"custrecord_ap_item_single_name_toll",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var GOLD_MP = searchResult.getValue(
						"custrecord_ap_item_single_name_mp",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var SP_MP = searchResult.getValue(
						"custrecord_ap_item_standard_mp_rate",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var SP_TOLL = searchResult.getValue(
						"custrecord_ap_item_standard_toll_rate",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PP_MP = searchResult.getValue(
						"custrecord_ap_item_single_name_3rd_mp",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PP_TOLL = searchResult.getValue(
						"custrecord_ap_item_single_name_3rd_toll",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var DIRECT_TOLL = searchResult.getValue(
						"custrecord_ap_item_direct_toll_rate",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var DIRECT_MP = searchResult.getValue(
						"custrecord_ap_item_direct_mp",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PRO_MP = searchResult.getValue(
						"custrecord_ap_item_pro_name_mp",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PRO_TOLL = searchResult.getValue(
						"custrecord_ap_item_pro_name_toll",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PRO_GOLD_MP = searchResult.getValue(
						"custrecord_ap_item_pro_gold_mp",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);
				var PRO_GOLD_TOLL = searchResult.getValue(
						"custrecord_ap_item_pro_gold_toll",
						"CUSTRECORD_CUST_STOCK_PROD_NAME", null);

				 nlapiLogExecution('DEBUG', 'internalid', internalid);
				// nlapiLogExecution('DEBUG', 'internalid', pro_MP);
				// nlapiLogExecution('DEBUG', 'internalid', pro_toll);

				var mpexRecord = nlapiLoadRecord(
						'customrecord_customer_product_stock', internalid);

				// UPDATE STANDARD PRICE POINTS IF EMPTY
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_mpex_standard_mp_rate'))) {
					mpexRecord.setFieldValue(
							'custrecord_mpex_standard_mp_rate', SP_MP);
				}
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_mpex_standard_toll_rate'))) {
					mpexRecord.setFieldValue(
							'custrecord_mpex_standard_toll_rate', SP_TOLL);
				}

				// UPDATE GOLD PRICE POINTS IF EMPTY
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_single_name'))) {
					mpexRecord
							.setFieldValue(
									'custrecord_cust_prod_stock_single_name',
									GOLD_TOLL);
				}
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_name_mp'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_name_mp', GOLD_MP);
				}

				// UPDATE PLATINUM PRICE POINTS IF EMPTY
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_3rd_party_tol'))) {
					mpexRecord
							.setFieldValue(
									'custrecord_cust_prod_stock_3rd_party_tol',
									PP_TOLL);
				}
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_3rd_party_mp'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_3rd_party_mp', PP_MP);
				}

				// UPDATE PRO PLATINUM PRICE POINTS IF EMPTY
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_pro_toll'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_pro_toll', PRO_TOLL);
				}
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_pro_mp'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_pro_mp', PRO_MP);
				}

				// UPDATE PRO GOLD PRICE POINTS IF EMPTY
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_pro_gold_toll'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_pro_gold_toll',
							PRO_GOLD_TOLL);
				}
				if (isNullorEmpty(mpexRecord
						.getFieldValue('custrecord_cust_prod_stock_pro_gold_mp'))) {
					mpexRecord.setFieldValue(
							'custrecord_cust_prod_stock_pro_gold_mp',
							PRO_GOLD_MP);
				}

				nlapiSubmitRecord(mpexRecord);

				reschedule = rescheduleScript(prev_inv_deploy,
						adhoc_inv_deploy, null);
				nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
				if (reschedule == false) {

					return false;
				}

				return true;

			});
}