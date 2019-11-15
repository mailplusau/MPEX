/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-04-11 12:25:19         ankith.ravindran
 *
 * Description: Create Product Orders for MPEX       
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-15 10:19:19
 *
 */

var usage_threshold = 200; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {


    nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_create_prod_order'));
    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_create_prod_order'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_create_prod_order');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }

    var createProdOrderSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_prod_stock_create_prod_orde');
    var resultCreateProdOrder = createProdOrderSearch.runSearch();

    var old_customer_id = null;
    var product_order_id;
    var count = 0;

    resultCreateProdOrder.forEachResult(function(searchResult) {

        var cust_prod_stock_id = searchResult.getValue("internalid");
        var cust_prod_item = searchResult.getValue("custrecord_cust_stock_prod_name");
        var cust_prod_date_stock_used = searchResult.getValue("custrecord_cust_date_stock_used");
        var cust_prod_customer = searchResult.getValue("custrecord_cust_prod_stock_customer");
        var cust_prod_zee = searchResult.getValue("partner", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
        var single_ap_item_toll = searchResult.getValue("custrecord_cust_prod_stock_single_name");
        var single_ap_item_mp = searchResult.getValue("custrecord_cust_prod_stock_name_mp");
        var single_3rd_party_mp = searchResult.getValue("custrecord_cust_prod_stock_3rd_party_mp");
        var single_3rd_party_toll = searchResult.getValue("custrecord_cust_prod_stock_3rd_party_tol");
        var cust_prod_stock_status = searchResult.getValue("custrecord_cust_prod_stock_status");
        var special_customer_type = searchResult.getValue("custentity_special_customer_type", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
        var barcode = searchResult.getValue("name");

        // var ap_item_record = nlapiLoadRecord('customrecord_ap_item', cust_prod_item);
        // var single_ap_item = ap_item_record.getFieldValue('custrecord_ap_item_single_name');

        nlapiLogExecution('DEBUG', 'Prod Order ID', product_order_id);

        if (cust_prod_customer != old_customer_id) {


            if (count != 0) {
                var params = {
                    custscript_prev_deploy_create_prod_order: ctx.getDeploymentId(),
                }

                reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
                if (reschedule == false) {

                    return false;
                }
            }



            var product_order_rec = nlapiCreateRecord('customrecord_mp_ap_product_order');
            product_order_rec.setFieldValue('custrecord_ap_order_customer', cust_prod_customer);
            product_order_rec.setFieldValue('custrecord_mp_ap_order_franchisee', cust_prod_zee);

            product_order_rec.setFieldValue('custrecord_mp_ap_order_order_status', 4);


            product_order_rec.setFieldValue('custrecord_mp_ap_order_date', getDate());

            product_order_rec.setFieldValue('custrecord_ap_order_fulfillment_date', getDate());
            product_order_rec.setFieldValue('custrecord_mp_ap_order_source', 6);


            product_order_id = nlapiSubmitRecord(product_order_rec);

            nlapiLogExecution('DEBUG', 'New Prod Order');

            var ap_stock_line_item = nlapiCreateRecord('customrecord_ap_stock_line_item');

            ap_stock_line_item.setFieldValue('custrecord_ap_product_order', product_order_id);
            if (isNullorEmpty(special_customer_type) || special_customer_type != 4) {
                if (cust_prod_stock_status == 4) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_ap_item_mp);
                } else if (cust_prod_stock_status == 5) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_ap_item_toll);
                }
            } else if(special_customer_type == 4){
                if (cust_prod_stock_status == 4) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_3rd_party_mp);
                } else if (cust_prod_stock_status == 5) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_3rd_party_toll);
                }
            }

            nlapiLogExecution('DEBUG', 'Details', 'Date Used:' + cust_prod_date_stock_used + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_line_item_inv_details', 'Used:' + cust_prod_date_stock_used + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_actual_qty', 1);


            nlapiSubmitRecord(ap_stock_line_item);

            var cust_prod_stock_record = nlapiLoadRecord('customrecord_customer_product_stock', cust_prod_stock_id);
            cust_prod_stock_record.setFieldValue('custrecord_prod_stock_prod_order', product_order_id)
            cust_prod_stock_record.setFieldValue('custrecord_cust_prod_stock_status', 7)
            nlapiSubmitRecord(cust_prod_stock_record);


        } else {
            var ap_stock_line_item = nlapiCreateRecord('customrecord_ap_stock_line_item');

            ap_stock_line_item.setFieldValue('custrecord_ap_product_order', product_order_id);
            if (isNullorEmpty(special_customer_type) || special_customer_type != 4) {
                if (cust_prod_stock_status == 4) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_ap_item_mp);
                } else if (cust_prod_stock_status == 5) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_ap_item_toll);
                }
            } else if(special_customer_type == 4){
                if (cust_prod_stock_status == 4) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_3rd_party_mp);
                } else if (cust_prod_stock_status == 5) {
                    ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_3rd_party_toll);
                }
            }
            ap_stock_line_item.setFieldValue('custrecord_ap_line_item_inv_details', 'Used:' + cust_prod_date_stock_used + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_actual_qty', 1);


            nlapiSubmitRecord(ap_stock_line_item);

            var cust_prod_stock_record = nlapiLoadRecord('customrecord_customer_product_stock', cust_prod_stock_id);
            cust_prod_stock_record.setFieldValue('custrecord_prod_stock_prod_order', product_order_id)
            cust_prod_stock_record.setFieldValue('custrecord_cust_prod_stock_status', 7)
            nlapiSubmitRecord(cust_prod_stock_record);
        }

        old_customer_id = cust_prod_customer;
        count++;
        // old_customer_id = cust_prod_customer;
        return true;
    });


}


function getDate() {
    var date = new Date();
    // if (date.getHours() > 6) {
    // date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);

    return date;
}