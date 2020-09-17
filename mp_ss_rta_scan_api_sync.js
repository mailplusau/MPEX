/*
 * Module Description
 * NSVersion    Date            		Author         
 * 1.00         2019-06-19 11:06:18 		ankith.ravindran  
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-09-16 11:31:03
 *
 * @Description:
 *
 */
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function getLatestFiles() {

    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deploy_scan_json'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deploy_scan_json');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }


    //To get todays date
    var today = nlapiDateToString(new Date(), 'dd-mm-yyyy');
    // var today = '1/7/2020';

    var scanJSONSearch = nlapiLoadSearch('customrecord_scan_json', 'customsearch_scan_json');
    var newFilterExpression = [
        ["name", "startswith", today], 'AND', ["isinactive", "is", "F"], 'AND', ["custrecord_scan_josn_sync", 'is', 2]
    ];

    scanJSONSearch.setFilterExpression(newFilterExpression);
    var resultScanJSONSearch = scanJSONSearch.runSearch();

    var scan_json_record_id;

    resultScanJSONSearch.forEachResult(function(searchResultScanJSON) {
        scan_json_record_id = searchResultScanJSON.getValue('internalid');
        scan_json_record_name = searchResultScanJSON.getValue('name');
        nlapiLogExecution('DEBUG', 'scan_json_record_id', scan_json_record_id);
        nlapiLogExecution('DEBUG', 'scan_json_record_name', scan_json_record_name);

        var scan_json_record = nlapiLoadRecord('customrecord_scan_json', scan_json_record_id);

        var body = scan_json_record.getFieldValue('custrecord_json');
        var body_2 = scan_json_record.getFieldValue('custrecord_scan_json_2');

        if (isNullorEmpty(body_2)) {
            var todays_scans = JSON.parse(body);
            var scans = todays_scans.scans;
        } else {
            var todays_scans = JSON.parse(body_2);
            var scans = todays_scans.scans;
        }
        nlapiLogExecution('DEBUG', 'beginning scans length', scans.length);

        // //Loop through each of the barcodes
        do {
            var x = (scans.length - 1);
            var usage_loopstart_cust = ctx.getRemainingUsage();

            if (usage_loopstart_cust < 500) {
                var scan_json_2 = '{ "scans": ' + JSON.stringify(scans) + '}';
                var scan_json_record = nlapiLoadRecord('customrecord_scan_json', scan_json_record_id);
                scan_json_record.setFieldValue('custrecord_scan_json_2', scan_json_2);
                nlapiSubmitRecord(scan_json_record);

                reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
                nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
                if (reschedule == 'false') {

                    return false;
                }
            }


            nlapiLogExecution('DEBUG', 'remaining usage', usage_loopstart_cust);


            var barcode = scans[x].barcode.toUpperCase();

            var customer_id = scans[x].customer_ns_id;
            // var zee_id = scans[x].zee_ns_id;
            var rta_id = scans[x].id;
            var invoiceable = scans[x].invoiceable;
            var scan_type = scans[x].scan_type.toLowerCase();
            var operator_id = scans[x].operator_ns_id;
            var operator_record = nlapiLoadRecord('customrecord_operator', operator_id);
            var zee_id = operator_record.getFieldValue('custrecord_operator_franchisee');
            var updated_at = scans[x].updated_at;
            var deleted = scans[x].deleted;
            updated_at = updated_at.split("T");
            var time_updated_at = updated_at[1];
            time_updated_at = time_updated_at.split(".");
            time_updated_at = onTimeChange(time_updated_at[0]);
            var updated_at = updated_at[0];
            var save_barcode = true;

            nlapiLogExecution('AUDIT', 'barcode usage', barcode);
            if (invoiceable === 'false') {
                nlapiLogExecution('EMERGENCY', 'invoiceable', invoiceable);
            }


            var barcode_beg = barcode.slice(0, 4);

            updated_at = updated_at.split("-");

            updated_at = nlapiStringToDate(updated_at[2] + '/' + updated_at[1] + '/' + updated_at[0]);



            var productStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_rta_product_stock');

            var temp_expression = 'AND';
            var newFilterExpression = [
                ["name", "is", barcode], 'AND', ["isinactive", "is", "F"]
            ];

            productStockSearch.setFilterExpression(newFilterExpression);

            var resultSetProductStock = productStockSearch.runSearch();

            var count = 0;
            var prod_id;

            resultSetProductStock.forEachResult(function(searchResult) {

                var customer_prod_stock_id = searchResult.getValue('internalid');

                var customer_prod_stock = nlapiLoadRecord('customrecord_customer_product_stock', customer_prod_stock_id);

                var stock_status = customer_prod_stock.getFieldValue('custrecord_cust_prod_stock_status');
                // customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);

                if (stock_status != 6 && stock_status != 7) {
                    if (!isNullorEmpty(deleted)) {
                        var status_text = searchResult.getText('custrecord_cust_prod_stock_status');
                        var status = searchResult.getValue('custrecord_cust_prod_stock_status');

                        nlapiLogExecution('DEBUG', 'status', status);

                        if (status == 1) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', null);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', null);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', null);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 8);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
                        } else if (status == 8) {
                            customer_prod_stock.setFieldValue('isinactive', 'T');
                            customer_prod_stock.setFieldValue('custrecord_cust_time_deleted', time_updated_at);
                        } else if (status == 4 || status == 5) {
                            // customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', null);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 1);
                            // customer_prod_stock.setFieldValue('custrecord_cust_date_stock_given', null);
                            // customer_prod_stock.setFieldValue('custrecord_cust_time_stock_given', null);
                            // customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
                        }

                    } else if (scan_type == 'stockzee') {
                        if (!isNullorEmpty(zee_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 8);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_given', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_given', time_updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', null);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Zee ID', null);
                            save_barcode = false;
                        }

                    } else if (scan_type == 'allocate') {
                        if (!isNullorEmpty(customer_id)) {
                            if (invoiceable === 'false') {
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 1);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_given', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_given', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }

                    } else if (scan_type == 'pickup') {
                        if (!isNullorEmpty(customer_id)) {
                            if (invoiceable === 'false') {
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 2);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    } else if (scan_type == "delivery") {
                        if (!isNullorEmpty(customer_id)) {
                            if (invoiceable === 'false') {
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 4);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_final_del', 4);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    } else if (scan_type == "lodgement") {
                        if (!isNullorEmpty(customer_id)) {
                            if (invoiceable === 'false') {
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                                customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 5);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_final_del', 5);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    }

                    if (save_barcode == true) {
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_source', 6);
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_operator', operator_id);
                        if (invoiceable === 'false') {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                        }

                        if (barcode_beg == 'MPEN' ||
                            barcode_beg == 'MPET' ||
                            barcode_beg == 'MPEF' ||
                            barcode_beg == 'MPEB' ||
                            barcode_beg == 'MPEC' ||
                            barcode_beg == 'MPED' ||
                            barcode_beg == 'MPEG') {
                            if (barcode_beg == 'MPEN') {
                                prod_id = 552;
                            } else if (barcode_beg == 'MPET') {
                                prod_id = 553;
                            } else if (barcode_beg == 'MPEF') {
                                prod_id = 554;
                            } else if (barcode_beg == 'MPEB') {
                                prod_id = 550;
                            } else if (barcode_beg == 'MPEC') {
                                prod_id = 551;
                            } else if (barcode_beg == 'MPED') {
                                prod_id = 549;
                            } else if (barcode_beg == 'MPEG') {
                                prod_id = 638;
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', prod_id);
                        }

                        customer_prod_stock_id = nlapiSubmitRecord(customer_prod_stock);
                    }


                }
                count++;
                return true;
            });

            if (count == 0) {

                var save_barcode = true;
                if (isNullorEmpty(deleted)) {

                    var customer_prod_stock = nlapiCreateRecord('customrecord_customer_product_stock');

                    customer_prod_stock.setFieldValue('custrecord_cust_date_stock_given', updated_at);
                    customer_prod_stock.setFieldValue('custrecord_cust_time_stock_given', time_updated_at);
                    if (invoiceable === 'false') {
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                    }

                    customer_prod_stock.setFieldValue('name', barcode);
                    if (scan_type == 'stockzee') {
                        if (!isNullorEmpty(zee_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 8);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_given', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_given', time_updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_zee', zee_id);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Zee ID', null);
                            save_barcode = false;
                        }

                    } else if (scan_type == 'allocate') {
                        if (!isNullorEmpty(customer_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 1);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }

                    } else if (scan_type == 'pickup') {
                        if (!isNullorEmpty(customer_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 2);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    } else if (scan_type == "delivery") {
                        if (!isNullorEmpty(customer_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 4);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_final_del', 4);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    } else if (scan_type == "lodgement") {
                        if (!isNullorEmpty(customer_id)) {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_status', 5);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_customer', customer_id);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_final_del', 5);
                            customer_prod_stock.setFieldValue('custrecord_cust_date_stock_used', updated_at);
                            customer_prod_stock.setFieldValue('custrecord_cust_time_stock_used', time_updated_at);
                        } else {
                            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'MPEX Scan Sync', 'Barcode: ' + barcode + ' has empty Customer ID', null);
                            save_barcode = false;
                        }
                    }

                    if (save_barcode == true) {
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_source', 6);
                        customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_operator', operator_id);
                        if (invoiceable === 'false') {
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_invoiceable', 2);
                            customer_prod_stock.setFieldValue('custrecord_cust_prod_stock_prepaid', 1);
                        }
                        if (barcode_beg == 'MPEN' ||
                            barcode_beg == 'MPET' ||
                            barcode_beg == 'MPEF' ||
                            barcode_beg == 'MPEB' ||
                            barcode_beg == 'MPEC' ||
                            barcode_beg == 'MPED' ||
                            barcode_beg == 'MPEG') {
                            if (barcode_beg == 'MPEN') {
                                prod_id = 552;
                            } else if (barcode_beg == 'MPET') {
                                prod_id = 553;
                            } else if (barcode_beg == 'MPEF') {
                                prod_id = 554;
                            } else if (barcode_beg == 'MPEB') {
                                prod_id = 550;
                            } else if (barcode_beg == 'MPEC') {
                                prod_id = 551;
                            } else if (barcode_beg == 'MPED') {
                                prod_id = 549;
                            } else if (barcode_beg == 'MPEG') {
                                prod_id = 638;
                            }
                            customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', prod_id);
                        }

                        customer_prod_stock_id = nlapiSubmitRecord(customer_prod_stock);
                    }
                }
            }

            nlapiLogExecution('DEBUG', 'Scan Count', x);
            scans.splice(x, 1);
            nlapiLogExecution('DEBUG', 'scans length', scans.length);
        } while (scans.length > 0);

        if (scans.length == 0) {
            scan_json_record.setFieldValue('custrecord_scan_josn_sync', 1);
            nlapiSubmitRecord(scan_json_record);
        }


        return true;
    });


    // //Get todays scans based on updated_at date

}

function onTimeChange(value) {

    if (!isNullorEmpty(value)) {
        var timeSplit = value.split(':'),
            hours,
            minutes,
            meridian;
        hours = timeSplit[0];
        minutes = timeSplit[1];
        if (hours > 12) {
            meridian = 'PM';
            hours -= 12;
        } else if (hours < 12) {
            meridian = 'AM';
            if (hours == 0) {
                hours = 12;
            }
        } else {
            meridian = 'PM';
        }
        return (hours + ':' + minutes + ' ' + meridian);
    }
}

function convertTo24Hour(time) {
    var hours_string = (time.substr(0, 2));
    var hours = parseInt(time.substr(0, 2));
    if (time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    // if (time.indexOf('AM') != -1 && hours < 10) {
    // 	time = time.replace(hours, ('0' + hours));
    // }
    if (time.indexOf('PM') != -1 && hours < 12) {
        console.log(hours + 12)
        time = time.replace(hours_string, (hours + 12));
    }
    return time.replace(/( AM| PM)/, '');
}