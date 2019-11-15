/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-04-11 12:25:19   		ankith.ravindran
 *
 * Description:         
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-07-16 14:24:50
 *
 */

var usage_threshold = 50; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

	var prodStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_prod_stock_refill_customer');
	var resultProdStock = prodStockSearch.runSearch();

	var old_zee_id = null;
	var count = 0;

	resultProdStock.forEachResult(function(searchResult) {


		var zee_id = searchResult.getValue("partner","CUSTRECORD_CUST_PROD_STOCK_CUSTOMER","GROUP");

		if (count != 0 && old_zee_id != zee_id) {
			var zee_record = nlapiLoadRecord('partner', old_zee_id);
			var zee_email = zee_record.getFieldValue('email');
			var body = 'Dear Franchisee,\n\n Please click on the link below to view customers who are below their minimum float level for MailPlus Express and need to be restocked with a 10-pack or more.\n\n LINK: https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=3020&whence= \n\n Things to do:\n\n 1)Log into NetSuite\n2)Click on the Link\n3)Review each customers with low stock – note this page displays the individual units remaining by product type (not 10-packs).\n4)Allocate new stock to each customer by scanning a 10-pack or more select ALLOCATE as scan type and the appropriate customer.\n\nThank you for your prompt action.';

			nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au', 'nina.waterworth@mailplus.com.au', zee_email], 'ACTION IMMEDIATELY - STOCK REFILL', body, null);
		}

		old_zee_id = zee_id
		count++;
		return true;
	});

	if (count > 0) {
		var zee_record = nlapiLoadRecord('partner', old_zee_id);
		var zee_email = zee_record.getFieldValue('email');
		var body = 'Dear Franchisee,\n\nPlease click on the link below to view customers who are below their minimum float level for MailPlus Express and need to be restocked with a 10-pack or more.\n\n LINK: https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=3020&whence= \n\n Things to do:\n\n 1)Log into NetSuite\n2)Click on the Link\n3)Review each customers with low stock – note this page displays the individual units remaining by product type (not 10-packs).\n4)Allocate new stock to each customer by scanning a 10-pack or more select ALLOCATE as scan type and the appropriate customer.\n\nThank you for your prompt action.';

		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au', 'nina.waterworth@mailplus.com.au', zee_email], 'ACTION IMMEDIATELY - STOCK REFILL', body, null);
	}
}