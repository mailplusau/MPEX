/**
 * Module Description
 * 
 * NSVersion Date Author 1.00 2020-08-05 11:40:56 Ankith
 * 
 * Description: Update the new fields based on the product name
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2021-09-02 15:26:47
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
	 * New Search: MPEX - Update Record Fields (New Pricing)
	 * Update Search ID to: customsearch_mpex_update_record_fields_3
	 */
	var createProdOrderSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_mpex_update_record_fields_3');
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
			var prod_name = searchResult.getValue("custrecord_cust_stock_prod_name");

			//NEW PRICING

			var manual_platinum_mp = searchResult.getValue("custrecord_manual_platinum_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var manual_platinum_toll = searchResult.getValue("custrecord_manual_platinum_toll", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_gold_mp = searchResult.getValue("custrecord_pro_gold_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_gold_toll = searchResult.getValue("custrecord_pro_gold_toll", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_platinum_mp = searchResult.getValue("custrecord_pro_plat_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_platinum_toll = searchResult.getValue("custrecord_pro_plat_toll", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_plus_mp = searchResult.getValue("custrecord_pro_plus_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_plus_toll = searchResult.getValue("custrecord_pro_plus_toll", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_standard_mp = searchResult.getValue("custrecord_pro_standard_mp", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)
			var pro_standard_toll = searchResult.getValue("custrecord_pro_standard_toll", "CUSTRECORD_CUST_STOCK_PROD_NAME", null)

			nlapiLogExecution('DEBUG', 'internalid', internalid);
			// nlapiLogExecution('DEBUG', 'internalid', pro_MP);
			// nlapiLogExecution('DEBUG', 'internalid', pro_toll);

			var mpexRecord = nlapiLoadRecord('customrecord_customer_product_stock', internalid);

			// UPDATE PRO STANDARD PRICE POINTS IF EMPTY
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_standard_toll'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_standard_toll', pro_standard_toll);
			}
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_standard_mp'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_standard_mp', pro_standard_mp);
			}

			// UPDATE PRO GOLD PRICE POINTS IF EMPTY
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_gold_toll'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_gold_toll', pro_gold_toll);
			}
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_gold_mp'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_gold_mp', pro_gold_mp);
			}

			// UPDATE PRO PLATINUM PRICE POINTS IF EMPTY
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_platinum_toll'))) {
				mpexRecord.setFieldValue('custrecord_mpex_platinum_toll', pro_platinum_toll);
			}
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_platinum_mp'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_platinum_mp', pro_platinum_mp);
			}

			// UPDATE PRO PLUS PRICE POINTS IF EMPTY
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_plus_toll'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_plus_toll', pro_plus_toll);
			}
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_pro_plus_mp'))) {
				mpexRecord.setFieldValue('custrecord_mpex_pro_plus_mp', pro_plus_mp);
			}

			// UPDATE MANUAL PLATINUM PRICE POINTS IF EMPTY
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_manual_plat_toll'))) {
				mpexRecord.setFieldValue('custrecord_mpex_manual_plat_toll',
					manual_platinum_toll);
			}
			if (isNullorEmpty(mpexRecord.getFieldValue('custrecord_mpex_manual_plat_mp'))) {
				mpexRecord.setFieldValue('custrecord_mpex_manual_plat_mp',
					manual_platinum_mp);
			}

			nlapiSubmitRecord(mpexRecord);

			reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
			nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
			if (reschedule == false) {
				return false;
			}

			return true;

		});
}