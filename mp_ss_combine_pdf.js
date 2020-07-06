/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-10-15 13:18:23         Ankith
 *
 * Description: Create MPEX Usage Report        
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-07-06 11:53:39
 *
 */

var prod_usage_report = [196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 243, 244, 245];

var month = moment().utc().format('MMMM')

var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();
var usageThreshold = 50;

function main() {

    var customerID = ctx.getSetting('SCRIPT', 'custscript_customerid');

    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_rp_prev_deployment'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_rp_prev_deployment');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }

    //SEARCH: MPEX Monthly Product Order Usage Report (List) - Customer List
    var customerList = nlapiLoadSearch('customrecord_mp_ap_product_order', 'customsearch_mpex_product_invoice_list_4');
    if (!isNullorEmpty(customerID)) {
        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_order_customer', null, 'anyof', customerID);
        createProdOrderSearch.addFilters(newFilters);
    }
    var resultCustomerList = customerList.runSearch();

    resultCustomerList.forEachResult(function(searchResultCustomer) {
        var cust_prod_customer = searchResultCustomer.getValue("custrecord_ap_order_customer", null, "GROUP");

        //SEARCH: MPEX Monthly Product Order Usage Report (List) - DO NOT DELETE
        var createProdOrderSearch = nlapiLoadSearch('customrecord_mp_ap_product_order', 'customsearch_mpex_product_invoice_list_3');
        // if (!isNullorEmpty(customerID)) {
        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_order_customer', null, 'anyof', cust_prod_customer);
        createProdOrderSearch.addFilters(newFilters);
        // }
        var resultCreateProdOrder = createProdOrderSearch.runSearch();

        var old_prod_id = null;
        var old_pord_array = [];
        var old_inv_id = null;
        var old_inv_number = null;
        var old_customer_id = null;
        var product_order_id;
        var usage_report_prod = [];
        var usage_report_barcode = [];
        var usage_report_date = [];

        var all_pages = [];

        nlapiLogExecution('AUDIT', 'month', month);
        nlapiLogExecution('AUDIT', 'START --->', ctx.getRemainingUsage());

        resultCreateProdOrder.forEachResult(function(searchResult) {
            var cust_prod_stock_id = searchResult.getValue("internalid", null, "GROUP");
            var cust_prod_item = searchResult.getText("custrecord_ap_stock_line_item", "CUSTRECORD_AP_PRODUCT_ORDER", "GROUP");
            var cust_prod_order_inv = searchResult.getValue("tranid", "CUSTRECORD_MP_AP_ORDER_INVOICENUM", "GROUP");
            var inv_id = searchResult.getValue("internalid", "CUSTRECORD_MP_AP_ORDER_INVOICENUM", "GROUP");
            var cust_prod_customer = searchResult.getValue("custrecord_ap_order_customer", null, "GROUP");

            var line_item_details = searchResult.getValue("custrecord_ap_line_item_inv_details", "CUSTRECORD_AP_PRODUCT_ORDER", "GROUP");
            line_item_details = line_item_details.replace(/\s/g, '')
            var details = line_item_details.split('-');

            var barcode = details[1];

            var date_used = details[0].split(':');

            // var ap_item_record = nlapiLoadRecord('customrecord_ap_item', cust_prod_item);
            // var single_ap_item = ap_item_record.getFieldValue('custrecord_ap_item_single_name');

            if (cust_prod_customer != old_customer_id && !isNullorEmpty(old_customer_id)) {

                if (!isNullorEmpty(old_customer_id)) {
                    var recCustomer = nlapiLoadRecord('customer', old_customer_id);
                    var billaddressfull = '';
                    var customerName = recCustomer.getFieldValue('companyname');
                    for (p = 1; p <= recCustomer.getLineItemCount('addressbook'); p++) {
                        if (recCustomer.getLineItemValue('addressbook', 'defaultbilling', p) == "T") {
                            if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
                                billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr1', p) + ',';
                            }
                            if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
                                billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';
                            }
                            if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
                                billaddressfull += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';
                            }
                            if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
                                billaddressfull += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
                            }
                            if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
                                billaddressfull += recCustomer.getLineItemValue('addressbook', 'zip', p);
                            }
                        }
                    }

                    var items = usage_report_prod.length;

                    var pages = Math.ceil(items / 50);

                    for (x = 0; x < pages; x++) {
                        var merge = new Array();
                        merge['NLDATE'] = getDate();
                        merge['NLCOMPANYNAME'] = customerName;
                        merge['NLSCBILLADDRESS'] = billaddressfull;
                        merge['NLINVOICE'] = old_inv_number;
                        merge['NLPAGE' + (x + 1)] = ' ' + (x + 1) + '/' + pages;
                        var i = 1;
                        for (y = (x * 50); y < 50 * (x + 1); y++) {
                            merge['NLITEM' + (y + 1)] = usage_report_prod[y];
                            merge['NLBARCODE' + (y + 1)] = usage_report_barcode[y];
                            merge['NLDATEUSED' + (y + 1)] = usage_report_date[y];
                            i++;
                        }

                        var fileSCFORM = nlapiMergeRecord(prod_usage_report[x], 'customer', old_customer_id, null, null, merge);
                        fileSCFORM.setName('MPEX_ProductUsageReport_' + getDate() + '_' + old_customer_id + '_' + (x + 1) + '.pdf');
                        fileSCFORM.setIsOnline(true);
                        fileSCFORM.setFolder(2177205);

                        var id = nlapiSubmitFile(fileSCFORM);

                        all_pages[all_pages.length] = id;
                    }

                    var all_pages_id;
                    if (!isNullorEmpty(all_pages)) {

                        var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                        xml += "<pdfset>\n";
                        xml += "<pdf>\n<body font-size=\"12\">\n<h3>Genereated MPEX Usage Report</h3>\n";
                        xml += "<p></p>";
                        xml += "MPEX Usage Report - " + month;
                        xml += "</body>\n</pdf>";
                        nlapiLogExecution('DEBUG', 'All Pages Length', all_pages.length);
                        for (var z = 0; z < all_pages.length; z++) {
                            nlapiLogExecution('DEBUG', 'IDS', all_pages[z]);
                            var fileRecord = nlapiLoadFile(all_pages[z]);
                            var url = fileRecord.getURL();
                            url = url.replace(/&/g, '&amp;');
                            nlapiLogExecution('DEBUG', 'XML URL', url);
                            xml += "<pdf src='https://1048144.app.netsuite.com" + url + "' />";
                        }

                        xml += "</pdfset>";
                        nlapiLogExecution('DEBUG', 'XML', xml);
                        var file = nlapiXMLToPDF(xml);
                        nlapiLogExecution('DEBUG', 'After nlapiXMLToPDF', '');
                        file.setName('MPEX_ProductUsageReport_all_' + getDate() + '_' + old_customer_id + '.pdf');
                        file.setFolder(2176958);
                        all_pages_id = nlapiSubmitFile(file);
                    }


                    var inv_record = nlapiLoadRecord('invoice', old_inv_id);
                    inv_record.setFieldValue('custbody_mpex_usage_report', all_pages_id);
                    nlapiSubmitRecord(inv_record);
                    nlapiLogExecution('AUDIT', 'old_pord_array', old_pord_array);
                    if (old_pord_array.length > 0) {
                        for (var i = 0; i < old_pord_array.length; i++) {
                            var product_order_rec = nlapiLoadRecord('customrecord_mp_ap_product_order', old_pord_array[i]);
                            product_order_rec.setFieldValue('custrecord_prod_usage_report', all_pages_id);
                            product_order_rec.setFieldValue('custrecord_usage_report', 1);
                            product_order_id = nlapiSubmitRecord(product_order_rec);
                        }
                    } else {
                        var product_order_rec = nlapiLoadRecord('customrecord_mp_ap_product_order', old_prod_id);
                        product_order_rec.setFieldValue('custrecord_prod_usage_report', all_pages_id);
                        product_order_rec.setFieldValue('custrecord_usage_report', 1);
                        product_order_id = nlapiSubmitRecord(product_order_rec);
                    }

                }

                reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
                nlapiLogExecution('EMERGENCY', 'Reschedule Return', reschedule);
                if (reschedule == false) {

                    return false;
                }

            } else {
                var usageStart = ctx.getRemainingUsage();

                if (usageStart <= usageThreshold) {
                    nlapiLogExecution('DEBUG', 'SWITCHing -->', ctx.getRemainingUsage());

                    var params = {
                        custscript_combine_customer_id: old_customer_id,
                    }
                    nlapiLogExecution('EMERGENCY', 'Parameters Passed | ', 'Customer ID: ' + old_customer_id);

                    var reschedule = rescheduleScript(prevInvDeploy, adhocInvDeploy, params);
                    if (reschedule == false) {
                        return false;
                    }
                }

                usage_report_barcode[usage_report_barcode.length] = barcode;
                usage_report_date[usage_report_date.length] = date_used[1];
                usage_report_prod[usage_report_prod.length] = cust_prod_item;

            }

            if (old_prod_id != cust_prod_stock_id && !isNullorEmpty(old_prod_id)) {
                old_pord_array[old_pord_array.length] = old_prod_id;
            }
            old_prod_id = cust_prod_stock_id;
            old_inv_id = inv_id;
            old_inv_number = cust_prod_order_inv;
            old_customer_id = cust_prod_customer;
            return true;
        });

        nlapiLogExecution('AUDIT', 'old_customer_id --->', old_customer_id);
        if (!isNullorEmpty(old_customer_id)) {
            old_pord_array[old_pord_array.length] = old_prod_id;
            var recCustomer = nlapiLoadRecord('customer', old_customer_id);
            var billaddressfull = '';
            var customerName = recCustomer.getFieldValue('companyname');
            for (p = 1; p <= recCustomer.getLineItemCount('addressbook'); p++) {
                if (recCustomer.getLineItemValue('addressbook', 'defaultbilling', p) == "T") {
                    if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
                        billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr1', p) + ',';
                    }
                    if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
                        billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';
                    }
                    if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
                        billaddressfull += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';
                    }
                    if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
                        billaddressfull += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
                    }
                    if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
                        billaddressfull += recCustomer.getLineItemValue('addressbook', 'zip', p);
                    }
                }
            }

            var items = usage_report_prod.length;

            var pages = Math.ceil(items / 50);

            for (x = 0; x < pages; x++) {
                var merge = new Array();
                merge['NLDATE'] = getDate();
                merge['NLCOMPANYNAME'] = customerName;
                merge['NLSCBILLADDRESS'] = billaddressfull;
                merge['NLINVOICE'] = old_inv_number;
                merge['NLPAGE' + (x + 1)] = ' ' + (x + 1) + '/' + pages;
                var i = 1;
                for (y = (x * 50); y < 50 * (x + 1); y++) {
                    merge['NLITEM' + (y + 1)] = usage_report_prod[y];
                    merge['NLBARCODE' + (y + 1)] = usage_report_barcode[y];
                    merge['NLDATEUSED' + (y + 1)] = usage_report_date[y];
                    i++;
                }

                var fileSCFORM = nlapiMergeRecord(prod_usage_report[x], 'customer', old_customer_id, null, null, merge);
                fileSCFORM.setName('MPEX_ProductUsageReport_' + getDate() + '_' + old_customer_id + '_' + (x + 1) + '.pdf');
                fileSCFORM.setIsOnline(true);
                fileSCFORM.setFolder(2177205);

                var id = nlapiSubmitFile(fileSCFORM);

                all_pages[all_pages.length] = id;
            }

            var all_pages_id;
            if (!isNullorEmpty(all_pages)) {

                var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                xml += "<pdfset>\n";
                xml += "<pdf>\n<body font-size=\"12\">\n<h3>Genereated MPEX Usage Report</h3>\n";
                xml += "<p></p>";
                xml += "MPEX Usage Report - " + month;
                xml += "</body>\n</pdf>";
                nlapiLogExecution('DEBUG', 'All Pages Length', all_pages.length);
                for (var z = 0; z < all_pages.length; z++) {
                    nlapiLogExecution('DEBUG', 'IDS', all_pages[z]);
                    var fileRecord = nlapiLoadFile(all_pages[z]);
                    var url = fileRecord.getURL();
                    url = url.replace(/&/g, '&amp;');
                    nlapiLogExecution('DEBUG', 'XML URL', url);
                    xml += "<pdf src='https://1048144.app.netsuite.com" + url + "' />";
                }

                xml += "</pdfset>";
                nlapiLogExecution('DEBUG', 'XML', xml);
                var file = nlapiXMLToPDF(xml);
                nlapiLogExecution('DEBUG', 'After nlapiXMLToPDF', '');
                file.setName('MPEX_ProductUsageReport_all_' + getDate() + '_' + old_customer_id + '.pdf');
                file.setFolder(2176958);
                all_pages_id = nlapiSubmitFile(file);
            }


            var inv_record = nlapiLoadRecord('invoice', old_inv_id);
            inv_record.setFieldValue('custbody_mpex_usage_report', all_pages_id);
            nlapiSubmitRecord(inv_record);
            nlapiLogExecution('AUDIT', 'old_pord_array', old_pord_array);
            if (old_pord_array.length > 0) {
                for (var i = 0; i < old_pord_array.length; i++) {
                    var product_order_rec = nlapiLoadRecord('customrecord_mp_ap_product_order', old_pord_array[i]);
                    product_order_rec.setFieldValue('custrecord_prod_usage_report', all_pages_id);
                    product_order_rec.setFieldValue('custrecord_usage_report', 1);
                    product_order_id = nlapiSubmitRecord(product_order_rec);
                }
            } else {
                var product_order_rec = nlapiLoadRecord('customrecord_mp_ap_product_order', old_prod_id);
                product_order_rec.setFieldValue('custrecord_prod_usage_report', all_pages_id);
                product_order_rec.setFieldValue('custrecord_usage_report', 1);
                product_order_id = nlapiSubmitRecord(product_order_rec);
            }

        }

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
        nlapiLogExecution('EMERGENCY', 'Reschedule Return', reschedule);
        if (reschedule == false) {

            return false;
        }
        return true;
    });

}

function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}