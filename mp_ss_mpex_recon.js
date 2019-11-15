/*
 * Module Description
 * NSVersion    Date            		Author         
 * 1.00         2019-06-19 11:06:18 		ankith.ravindran  
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-07-16 14:24:29
 *
 * @Description:
 *
 */
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function mpexRecon() {

    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_scan_json'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_scan_json');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }


    var mpexReconMatchUp = nlapiLoadSearch('customrecord_mpex_recon', 'customsearch_mpex_recon_match_up');

    var resultMpexReconMatchUp = mpexReconMatchUp.runSearch();

    var scan_json_record_id;

    resultMpexReconMatchUp.forEachResult(function(searchResultMpexReconMatchUp) {
        var mpex_recon_record_id = searchResultMpexReconMatchUp.getValue('internalid');
        var mpex_recon_record_name = searchResultMpexReconMatchUp.getValue('custrecord_connote');
        var mpex_recon_record_date = searchResultMpexReconMatchUp.getValue('custrecord_toll_scan_date');


        var mpex_recon_record = nlapiLoadRecord('customrecord_mpex_recon', mpex_recon_record_id);

        var productStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');

        var temp_expression = 'AND';
        var newFilterExpression = [
            ["name", "is", mpex_recon_record_name], 'AND', ["isinactive", "is", "F"]
        ];

        productStockSearch.setFilterExpression(newFilterExpression);

        var resultSetProductStock = productStockSearch.runSearch();

        var count = 0;
        var prod_id;

        resultSetProductStock.forEachResult(function(searchResult) {

            var customer_prod_stock_id = searchResult.getValue('internalid');

            var customer_prod_stock = nlapiLoadRecord('customrecord_customer_product_stock', customer_prod_stock_id);

            var stock_status = customer_prod_stock.getFieldValue('custrecord_cust_prod_stock_status');
            var stock_invoiceable = customer_prod_stock.getFieldValue('custrecord_cust_prod_stock_invoiceable');

            mpex_recon_record.setFieldValue('custrecord_mpex_barcode', customer_prod_stock_id);

            //Stock Status is Invoiced
            if(stock_status == 6){
                mpex_recon_record.setFieldValue('custrecord_recon_status', 2);
            } else if(stock_status == 5){ //Stock Status is Lodged at TOLL 
                if(stock_invoiceable == 1 || isNullorEmpty(stock_invoiceable)){
                    mpex_recon_record.setFieldValue('custrecord_recon_status', 5);
                } else {
                    mpex_recon_record.setFieldValue('custrecord_recon_status', 7);
                }
                
            } else if(stock_status == 1 || stock_status == 2){ //Stock status is Allocated to Customer or Picked Up from Customer
                mpex_recon_record.setFieldValue('custrecord_recon_status', 5);
                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 5)
                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_final_del', 5)
                customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', mpex_recon_record_date)
            } else if(stock_status == 8){ //Stock Status is Zee Stock
                mpex_recon_record.setFieldValue('custrecord_recon_status', 3);
            } else if(stock_status == 4){ // Stock Status is Delivered to Reciever
                mpex_recon_record.setFieldValue('custrecord_recon_status', 6);
            }

            nlapiSubmitRecord(customer_prod_stock);
            count++;
            return true;
        });

        if (count == 0) {

             mpex_recon_record.setFieldValue('custrecord_recon_status', 4); 

        }


         nlapiSubmitRecord(mpex_recon_record);
        return true;
    });


    // //Get todays scans based on updated_at date

}

