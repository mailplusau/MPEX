/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2020-08-21 11:31:55   		Ankith
 *
 * Description:  Update the Weekly MPEX Usage on the Customer Record.       
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-08-24 11:05:57
 *
 */
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function mpexUsagePerWeek() {

    prev_inv_deploy = ctx.getDeploymentId();

    /**
     * MPEX Usage - Per Week
     */
    var mpexUsagePerWeek = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_mpex_usage_per_week_2');
    var resultMPEXUsagePerWeek = mpexUsagePerWeek.runSearch();

    var oldCustomerInternalID = null;
    var count = 0;
    var reschedule = false;
    var data = '{';

    resultMPEXUsagePerWeek.forEachResult(function(searchResult) {

        var customerInternalID = searchResult.getValue("internalid", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        var customerName = searchResult.getValue("companyname","CUSTRECORD_CUST_PROD_STOCK_CUSTOMER","GROUP");
        var customerID = searchResult.getValue("entityid","CUSTRECORD_CUST_PROD_STOCK_CUSTOMER","GROUP");
        var zeeName = searchResult.getText("custrecord_cust_prod_stock_zee",null,"GROUP");
        var dateStockUsedWeek = searchResult.getValue("custrecord_cust_date_stock_used", null, "GROUP");
        var usageCount = searchResult.getValue("name", null, "COUNT");

        if(count == 0){
        	data += '"Customer ID" : "' + customerID + '",';
        	data += '"Customer Name" : "' + customerName + '",';
            data += '"Franchisee" : "' + zeeName + '",';
            data += '"Usage": [';
        }

        if (oldCustomerInternalID != null && oldCustomerInternalID != customerInternalID) {
            data = data.substring(0, data.length - 1);
            data += ']}';
            nlapiLogExecution('AUDIT', 'data', data);

            var customerRecord = nlapiLoadRecord('customer', oldCustomerInternalID);
            customerRecord.setFieldValue('custentity_actual_mpex_weekly_usage', data);
            customerRecord.setFieldValue('custentity_mpex_weekly_usage_calculated', 1);
            nlapiSubmitRecord(customerRecord);

            reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
            nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
            if (reschedule == false) {
            	reschedule = true;
                return false;
            }
        } else {
            data += '{';
            data += '"Week Used" : "' + dateStockUsedWeek + '",';
            data += '"Count" : "' + usageCount + '"';
            data += '},';
        }


        oldCustomerInternalID = customerInternalID;
        count++;
        return true;
    });

    if (count > 0 && reschedule == false) {
        data = data.substring(0, data.length - 1);
        data += ']}';
        var customerRecord = nlapiLoadRecord('customer', oldCustomerInternalID);
        customerRecord.setFieldValue('custentity_actual_mpex_weekly_usage', data);
        customerRecord.setFieldValue('custentity_mpex_weekly_usage_calculated', 1);
        nlapiSubmitRecord(customerRecord);
    } else {
        data += ']}';
    }

}