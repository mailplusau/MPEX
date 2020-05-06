function rescheduleScript(script_deployment_1, script_deployment_2, params) {

    var ctx = nlapiGetContext();
    var current_script_deployment = ctx.getDeploymentId();

    var next_script_deployment = null;

    if (current_script_deployment == script_deployment_1) {
        next_script_deployment = script_deployment_2;
    } else if (current_script_deployment == script_deployment_2) {
        next_script_deployment = script_deployment_1;
    } else {
        throw nlapiCreateError('NO MATCHING DEPLOYMENTS', current_script_deployment + 'not defined in rescheduleScript', false);
        return false;
    }

    var status = nlapiScheduleScript(ctx.getScriptId(), next_script_deployment, params);

    if (status == 'QUEUED') {
        nlapiLogExecution('AUDIT', 'SWITCH from ' + current_script_deployment + ' --> ' + next_script_deployment + ': Usage', 10000 - ctx.getRemainingUsage());
        return false;
    }
}

function main(type) {

    var ctx = nlapiGetContext();
    var recInvoice;
    var internal_id;
    var new_invoice = true;
    var invCount = 0;

    var invoiceId = null;

    var item_rates = ['a', 'b', 'c', 'd', 'e', 'f', 'g']; // make sure to check the search
    var text = 'custrecord_ap_qty_';

    var todayDate = null;
    var tranDate = null;

    var usage_threshold = 500;
    var adhoc_inv_deploy = 'customdeploy_mpex_order_auto_inv_adhoc';
    var prev_inv_deploy = null;

    var usage_per_loop = 0;
    var usage_per_inv = 0;

    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_mpex_prev_inv_deploy'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_mpex_prev_inv_deploy');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }

    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_mpex_invoicedate_list'))) {
        //get date from custom parameter
        todayDate = ctx.getSetting('SCRIPT', 'custscript_mpex_invoicedate_list');
        tranDate = todayDate;
    } else {
        todayDate = new Date();
        todayDate.setHours(todayDate.getHours() + 17);

        if (todayDate.getDay() == 1) {

            var lastSat = nlapiAddDays(todayDate, -2);

            if ((lastSat.getMonth() - todayDate.getMonth()) == 0) {
                //if last Sat is same month to today, use today's date
                tranDate = nlapiDateToString(todayDate);
            } else {
                //if last Sat is in the previous month, use last Friday's date
                tranDate = nlapiDateToString(nlapiAddDays(todayDate, -3));
            }
        } else {
            throw nlapiCreateError('MONDAY ONLY SCRIPT', 'script can only be run on Monday\'s if custscript_mpex_invoicedate_list is not defined', false);
            return false;
        }
    }

    var searchResults = nlapiSearchRecord('customrecord_mp_ap_product_order', 'customsearch_mpex_prepaid_order_inv_list');

    if (!isNullorEmpty(searchResults)) {

        nlapiLogExecution('AUDIT', 'START --->', ctx.getRemainingUsage());

        for (var n = 0; n < searchResults.length; n++) {

            usage_per_loop = ctx.getRemainingUsage();

            if (ctx.getRemainingUsage() <= usage_threshold && (n + 1) < searchResults.length) {

                var params = {
                    custscript_mpex_invoicedate_list: tranDate,
                    custscript_mpex_prev_inv_deploy: ctx.getDeploymentId()
                }

                var reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                if (reschedule == false) {
                    nlapiLogExecution('AUDIT', 'params: custscript_mpex_invoicedate_list', params.custscript_mpex_invoicedate_list);
                    nlapiLogExecution('AUDIT', 'params: custscript_mpex_invoicedate_list', params.custscript_mpex_prev_inv_deploy);
                    return false;
                }
            }

            var customer_po = searchResults[n].getValue('custentity11', 'CUSTRECORD_AP_PRODUCT_ORDER');
            var product_po = searchResults[n].getValue('custrecord_mp_ap_order_po');
            var ordered_by = searchResults[n].getValue('custrecord_mp_ap_order_ordered_by');

            try {

                if (searchResults[n].getValue('custrecord_mp_ap_order_from_swap') != "T") {

                    if (internal_id == searchResults[n].getValue('internalid')) {
                        new_invoice = false;
                    } else {
                        new_invoice = true;
                        invCount++;
                    }


                    //--------------- Submit/Init Invoice ---------------//
                    if (n == 0) {

                        //--------------- Init New Invoice ---------------//
                        usage_per_inv = ctx.getRemainingUsage();

                        // internal_id = searchResults[n].getValue('internalid');
                        // recInvoice = nlapiCreateRecord('invoice', {
                        //     recordmode: 'dynamic'
                        // });

                        internal_id = searchResults[n].getValue('internalid');
                        recInvoice = nlapiCreateRecord('invoice', {
                            recordmode: 'dynamic'
                        });
                        recInvoice.setFieldValue('customform', 116);
                        recInvoice.setFieldValue('entity', searchResults[n].getValue('custrecord_ap_order_customer'));
                        recInvoice.setFieldValue('department', nlapiLoadRecord('partner', 435).getFieldValue('department'));
                        recInvoice.setFieldValue('location', nlapiLoadRecord('partner', 435).getFieldValue('location'));
                        recInvoice.setFieldValue('trandate', tranDate);
                        recInvoice.setFieldValue('custbody_inv_date_range_from', searchResults[n].getValue('custrecord_ap_order_fulfillment_date'));
                        recInvoice.setFieldValue('custbody_inv_date_range_to', searchResults[n].getValue('custrecord_ap_order_fulfillment_date'));
                        recInvoice.setFieldValue('custbody_ap_product_order',internal_id);
                        if (isNullorEmpty(product_po) && isNullorEmpty(customer_po)) {
                            // if (!isNullorEmpty(ordered_by)) {
                            //     var final_po_text = 'Order By - ' + ordered_by;
                            //     recInvoice.setFieldValue('custbody6', final_po_text);
                            // }
                        } else if (!isNullorEmpty(product_po)) {
                            // var final_po_text = product_po + ' Order By - ' + ordered_by;
                            var final_po_text = product_po;
                            recInvoice.setFieldValue('custbody6', final_po_text);
                        } else {
                            // var final_po_text = customer_po + ' Order By - ' + ordered_by;
                            var final_po_text = customer_po;
                            recInvoice.setFieldValue('custbody6', final_po_text);
                        }
                        recInvoice.setFieldValue('custbody_dont_update_trandate', "T");
                        //recInvoice.setFieldValue('custbody_satchel_inv', "T");
                        recInvoice.setFieldValue('custbody_inv_type', 8);
                        recInvoice.setFieldValue('partner', 435);

                        recInvoice.setFieldValue('terms', 1);
                    }

                    if (new_invoice == true && n > 0) {

                        //--------------- Submit Current Invoice ---------------//
                        invoiceId = nlapiSubmitRecord(recInvoice);
                        nlapiLogExecution('AUDIT', 'InvID: ' + invoiceId + ' | Usage: ', usage_per_inv - ctx.getRemainingUsage());

                        if (!isNullorEmpty(invoiceId)) {
                            var recOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', searchResults[n - 1].getId());
                            recOrder.setFieldValue('custrecord_mp_ap_order_order_status', 6);
                            recOrder.setFieldValue('custrecord_mp_ap_order_invoicenum', invoiceId);
                            var submitted = nlapiSubmitRecord(recOrder);
                        }

                        //--------------- Init New Invoice ---------------//
                        usage_per_inv = ctx.getRemainingUsage();

                        internal_id = searchResults[n].getValue('internalid');
                        recInvoice = nlapiCreateRecord('invoice', {
                            recordmode: 'dynamic'
                        });
                        recInvoice.setFieldValue('customform', 116);
                        recInvoice.setFieldValue('entity', searchResults[n].getValue('custrecord_ap_order_customer'));
                        recInvoice.setFieldValue('department', nlapiLoadRecord('partner', 435).getFieldValue('department'));
                        recInvoice.setFieldValue('location', nlapiLoadRecord('partner', 435).getFieldValue('location'));
                        recInvoice.setFieldValue('trandate', tranDate);
                        recInvoice.setFieldValue('custbody_inv_date_range_from', searchResults[n].getValue('custrecord_ap_order_fulfillment_date'));
                        recInvoice.setFieldValue('custbody_inv_date_range_to', searchResults[n].getValue('custrecord_ap_order_fulfillment_date'));
                        recInvoice.setFieldValue('custbody_ap_product_order',internal_id);
                        if (isNullorEmpty(product_po) && isNullorEmpty(customer_po)) {
                            // if (!isNullorEmpty(ordered_by)) {
                            //     var final_po_text = 'Order By - ' + ordered_by;
                            //     recInvoice.setFieldValue('custbody6', final_po_text);
                            // }

                        } else if (!isNullorEmpty(product_po)) {
                            // var final_po_text = product_po + ' Order By - ' + ordered_by;
                            var final_po_text = product_po;
                            recInvoice.setFieldValue('custbody6', final_po_text);
                        } else {
                            // var final_po_text = customer_po + ' Order By - ' + ordered_by;
                            var final_po_text = customer_po;
                            recInvoice.setFieldValue('custbody6', final_po_text);
                        }
                        recInvoice.setFieldValue('custbody_dont_update_trandate', "T");
                        //recInvoice.setFieldValue('custbody_satchel_inv', "T");
                        recInvoice.setFieldValue('custbody_inv_type', 8);
                        recInvoice.setFieldValue('partner', 435);

                        recInvoice.setFieldValue('terms', 1);
                    }



                    var line_item = searchResults[n].getValue('custrecord_ap_stock_line_item', 'CUSTRECORD_AP_PRODUCT_ORDER');
                    var line_qty = searchResults[n].getValue('custrecord_ap_stock_line_actual_qty', 'CUSTRECORD_AP_PRODUCT_ORDER');

                    var inv_details = searchResults[n].getValue('custrecord_ap_line_item_inv_details', 'CUSTRECORD_AP_PRODUCT_ORDER');

                    var count = 0;

                    //--------------- Search AP Item Pricing Algorithm ---------------//
                    var fil_po = [];
                    fil_po[fil_po.length] = new nlobjSearchFilter('internalid', null, 'anyof', line_item);

                    var col_po = [];
                    col_po[col_po.length] = new nlobjSearchColumn('internalid');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_pricing_algorithm');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_qty_per_carton');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_a');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_b');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_c');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_d');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_e');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_f');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_a');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_b');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_c');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_d');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_e');
                    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_f');

                    var poSearch = nlapiSearchRecord('customrecord_ap_item', null, fil_po, col_po);

                    //--------------- Apply AP Item Pricing Algorithm ---------------//
                    if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 1) { //IF PRICING ALGORITHM: PRICE LISTS

                        for (var x = 0; x < item_rates.length; x++) {
                            // uses dynmic column values from search (ie. custrecord_ap_qty_a)
                            var temp = text + item_rates[x];
                            var y = poSearch[0].getValue(temp);
                            if (y != '') {
                                if (parseInt(line_qty) < y) {

                                    var item_selected = 'custrecord_ap_item_' + item_rates[x];

                                    //Create Cusotm record - Custom Item Description List to store Invoice Details from the Product Order
                                    if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                        var inv_details_rec = nlapiCreateRecord('customrecord62');
                                        if (!isNullorEmpty(ordered_by)) {
                                            var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                                        } else {
                                            var new_inv_details = inv_details;
                                        }
                                        inv_details_rec.setFieldValue('name', new_inv_details);
                                        inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                        inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                        var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                    }

                                    recInvoice.selectNewLineItem('item');
                                    recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                    recInvoice.setCurrentLineItemValue('item', 'quantity', line_qty);

                                    if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                        item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                        recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                        recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                    }

                                    recInvoice.commitLineItem('item');
                                    break;
                                }
                                // else if(x >= 1 && parseInt(line_qty) >= y){ 
                                //     var item_selected = 'custrecord_ap_item_' + item_rates[x];

                                //    if(!isNullorEmpty(inv_details)){
                                //         var inv_details_rec = nlapiCreateRecord('customrecord62');
                                //         inv_details_rec.setFieldValue('name', inv_details);
                                //         inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                //         inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                //         var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                //     }
                                //     recInvoice.selectNewLineItem('item');
                                //     recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                //     recInvoice.setCurrentLineItemValue('item', 'quantity', line_qty);

                                //      if(!isNullorEmpty(inv_details)){
                                //         item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                //         recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                //         recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                //     }

                                //     recInvoice.commitLineItem('item');
                                //     break;
                                // }
                            } else {

                                var item_selected = 'custrecord_ap_item_' + item_rates[(x - 1)];

                                if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                    var inv_details_rec = nlapiCreateRecord('customrecord62');
                                    if (!isNullorEmpty(ordered_by)) {
                                        var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                                    } else {
                                        var new_inv_details = inv_details;
                                    }
                                    inv_details_rec.setFieldValue('name', new_inv_details);
                                    inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                    inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                    var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                }
                                recInvoice.selectNewLineItem('item');
                                recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                recInvoice.setCurrentLineItemValue('item', 'quantity', line_qty);

                                if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                    item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                    recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                    recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                }

                                recInvoice.commitLineItem('item');
                                break;
                            }
                        }
                    } else if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 2) { //IF PRICING ALGORITHM: REMAINDER
                        for (var x = 0; x < item_rates.length; x++) {
                            var temp = text + item_rates[x];
                            var y = poSearch[0].getValue(temp);
                            if (y != '') {
                                if (parseInt(line_qty) < y && x == 0) {

                                    var SODrem = parseInt(line_qty) % y;

                                    if (SODrem != 0) {

                                        var item_selected = 'custrecord_ap_item_' + item_rates[0];

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            var inv_details_rec = nlapiCreateRecord('customrecord62');
                                            if (!isNullorEmpty(ordered_by)) {
                                                var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                                            } else {
                                                var new_inv_details = inv_details;
                                            }
                                            inv_details_rec.setFieldValue('name', new_inv_details);
                                            inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                            inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                            var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                        }
                                        recInvoice.selectNewLineItem('item');
                                        recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                        recInvoice.setCurrentLineItemValue('item', 'quantity', SODrem);

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                        }

                                        recInvoice.commitLineItem('item');

                                    }
                                    break;
                                } else if (x == 1) {
                                    var SODrem = parseInt(line_qty) % (y - 1);
                                    var SOD_50pack = Math.floor(parseInt(line_qty) / (y - 1));

                                    if (SOD_50pack != 0) {

                                        var item_selected = 'custrecord_ap_item_' + item_rates[1];

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            var inv_details_rec = nlapiCreateRecord('customrecord62');
                                            if (!isNullorEmpty(ordered_by)) {
                                                var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                                            } else {
                                                var new_inv_details = inv_details;
                                            }
                                            inv_details_rec.setFieldValue('name', new_inv_details);
                                            inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                            inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                            var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                        }

                                        recInvoice.selectNewLineItem('item');
                                        recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                        recInvoice.setCurrentLineItemValue('item', 'quantity', SOD_50pack);

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                        }

                                        recInvoice.commitLineItem('item');
                                    }
                                    if (SODrem != 0) {

                                        var item_selected = 'custrecord_ap_item_' + item_rates[0];

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            var inv_details_rec = nlapiCreateRecord('customrecord62');
                                            if (!isNullorEmpty(ordered_by)) {
                                                var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                                            } else {
                                                var new_inv_details = inv_details;
                                            }
                                            inv_details_rec.setFieldValue('name', new_inv_details);
                                            inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                                            inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                                            var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                                        }

                                        recInvoice.selectNewLineItem('item');
                                        recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                        recInvoice.setCurrentLineItemValue('item', 'quantity', SODrem);

                                        if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                                            item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                                            recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                                        }

                                        recInvoice.commitLineItem('item');
                                    }
                                    break;

                                }

                            }
                        }
                    } else if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 3) { //FOR OLD LIST REMIANDER 
                        for (var x = 0; x < item_rates.length; x++) {

                            var temp = text + item_rates[x];
                            var y = poSearch[0].getValue(temp);

                            var qty_per_carton = poSearch[0].getValue('custrecord_ap_item_qty_per_carton');

                            var total_packets_in_carton = y * qty_per_carton;

                            var gst_applicable = poSearch[0].getValue('custrecord_ap_item_pricing_algorithm');

                            if (line_qty < total_packets_in_carton) {

                                var packages_piece = line_qty % qty_per_carton;
                                var packages_carton = Math.floor(line_qty / qty_per_carton);

                                if (packages_carton != 0) {

                                    var item_selected = 'custrecord_ap_item_' + item_rates[x];

                                    recInvoice.selectNewLineItem('item');
                                    recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                    recInvoice.setCurrentLineItemValue('item', 'quantity', packages_carton);
                                    recInvoice.commitLineItem('item');


                                }
                                if (packages_piece != 0) {

                                    var item_selected = 'custrecord_ap_item_' + item_rates[0];

                                    recInvoice.selectNewLineItem('item');
                                    recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                    recInvoice.setCurrentLineItemValue('item', 'quantity', packages_piece);
                                    recInvoice.commitLineItem('item');

                                }



                                break;
                            }
                            if (x == (item_rates.length - 1)) {

                                var packages_piece = line_qty % qty_per_carton;
                                var packages_carton = Math.floor(line_qty / qty_per_carton);

                                if (packages_carton != 0) {
                                    var item_selected = 'custrecord_ap_item_' + item_rates[x];

                                    recInvoice.selectNewLineItem('item');
                                    recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                    recInvoice.setCurrentLineItemValue('item', 'quantity', packages_carton);
                                    recInvoice.commitLineItem('item');


                                }
                                if (packages_piece != 0) {

                                    var item_selected = 'custrecord_ap_item_' + item_rates[0];

                                    recInvoice.selectNewLineItem('item');
                                    recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                                    recInvoice.setCurrentLineItemValue('item', 'quantity', packages_piece);
                                    recInvoice.commitLineItem('item');

                                }

                                break;
                            }

                        }
                    } else {
                        /**
                         * SHOULD BE AN ERROR ???
                         */

                        var message = '';
                        message += 'AP Item: '+ searchResults[n].getText('custrecord_ap_stock_line_item','CUSTRECORD_AP_PRODUCT_ORDER',null);
                        message += ' | LineID: '+ searchResults[n].getValue('internalid', 'CUSTRECORD_AP_PRODUCT_ORDER');
                        message += ' | OrderID:'+ searchResults[n].getValue('internalid');
                        

                        nlapiCreateError('Pricing Algorithm Undefined', message);

                        return false;

                        // for (var x = 0; x < item_rates.length; x++) {

                        //     var temp = text + item_rates[x];
                        //     var y = poSearch[0].getValue(temp);

                        //     var qty_per_carton = poSearch[0].getValue('custrecord_ap_item_qty_per_carton');

                        //     var total_packets_in_carton = y * qty_per_carton;


                        //     if (line_qty < total_packets_in_carton) {

                        //         if (x == 0) {

                        //             var qty = 0;

                        //             qty = line_qty;

                        //         } else {

                        //             var qty = 0;

                        //             qty = line_qty / qty_per_carton;
                        //         }


                        //         var item_selected = 'custrecord_ap_item_' + item_rates[x];

                        //         if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                        //             var inv_details_rec = nlapiCreateRecord('customrecord62');
                        //             if (!isNullorEmpty(ordered_by)) {
                        //                 var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                        //             } else {
                        //                 var new_inv_details = inv_details;
                        //             }
                        //             inv_details_rec.setFieldValue('name', new_inv_details);
                        //             inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                        //             inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                        //             var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                        //         }

                        //         recInvoice.selectNewLineItem('item');
                        //         recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                        //         recInvoice.setCurrentLineItemValue('item', 'quantity', qty);

                        //         if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                        //             item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                        //             recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                        //             recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                        //         }

                        //         recInvoice.commitLineItem('item');
                        //         break;
                        //     }
                        //     if (x == (item_rates.length - 1)) {
                        //         var qty = 0;

                        //         qty = line_qty / qty_per_carton;

                        //         var item_selected = 'custrecord_ap_item_' + item_rates[x];

                        //         if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                        //             var inv_details_rec = nlapiCreateRecord('customrecord62');
                        //             if (!isNullorEmpty(ordered_by)) {
                        //                 var new_inv_details = 'Order By - ' + ordered_by + '. ' + inv_details;
                        //             } else {
                        //                 var new_inv_details = inv_details;
                        //             }
                        //             inv_details_rec.setFieldValue('name', new_inv_details);
                        //             inv_details_rec.setFieldValue('custrecord57_2', searchResults[n].getValue('custrecord_ap_order_customer'));
                        //             inv_details_rec.setFieldValue('custrecord56_2', poSearch[0].getValue(item_selected));
                        //             var inv_details_rec_id = nlapiSubmitRecord(inv_details_rec);
                        //         }

                        //         recInvoice.selectNewLineItem('item');
                        //         recInvoice.setCurrentLineItemValue('item', 'item', poSearch[0].getValue(item_selected));
                        //         recInvoice.setCurrentLineItemValue('item', 'quantity', qty);

                        //         if (!isNullorEmpty(inv_details) || !isNullorEmpty(ordered_by)) {
                        //             item_desc = nlapiLoadRecord('customrecord62', inv_details_rec_id);
                        //             recInvoice.setCurrentLineItemValue('item', 'custcol1', inv_details_rec_id);
                        //             recInvoice.setCurrentLineItemValue('item', 'custcol1_display', item_desc.getFieldValue('name'));
                        //         }

                        //         recInvoice.commitLineItem('item');
                        //         break;
                        //     }
                        // }
                    }
                }
            } catch (err) {
                nlapiCreateError(err);
                nlapiLogExecution('ERROR', 'Error', err);
                nlapiLogExecution('ERROR', 'LineID :', searchResults[n].getValue('internalid', 'CUSTRECORD_AP_PRODUCT_ORDER'));
                nlapiLogExecution('ERROR', 'OrderID :', searchResults[n].getValue('internalid'));
                return false;
            }
            nlapiLogExecution('AUDIT', 'Loop: ' + invCount + '.' + n + ' | LineID: ' + searchResults[n].getValue('internalid', 'CUSTRECORD_AP_PRODUCT_ORDER'), usage_per_loop - ctx.getRemainingUsage());
        }

        //--------------- Submit Current Invoice ---------------//
        invoiceId = nlapiSubmitRecord(recInvoice);
        nlapiLogExecution('AUDIT', 'InvID: ' + invoiceId + ' | Usage: ', usage_per_inv - ctx.getRemainingUsage());

        if (!isNullorEmpty(invoiceId)) {
            var recOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', searchResults[n - 1].getId());
            recOrder.setFieldValue('custrecord_mp_ap_order_order_status', 6);
            recOrder.setFieldValue('custrecord_mp_ap_order_invoicenum', invoiceId);
            var submitted = nlapiSubmitRecord(recOrder);
        }

        nlapiLogExecution('AUDIT', '---> END', ctx.getRemainingUsage());
    }
}