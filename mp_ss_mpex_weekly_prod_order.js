/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-06-17 10:00:05         Ankith
 *
 * Description: Create Product Orders for MPEX Weekly Invoicing     
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-10-04 07:41:02
 *
 */

var usage_threshold = 200; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

    nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_prev_deploy_create_prod_order'));

    prev_inv_deploy = ctx.getDeploymentId();


    /**
     * MPEX - To Create Product Order (For Weekly Invoicing)
     */
    var createProdOrderSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_mpex_weekly_prod_order');
    var resultCreateProdOrder = createProdOrderSearch.runSearch();

    var old_customer_id = null;
    var product_order_id;
    var count = 0;

    /**
     * Go through each line item from the search. 
     */
    resultCreateProdOrder.forEachResult(function(searchResult) {

        var cust_prod_stock_id = searchResult.getValue("internalid");
        var cust_prod_item = searchResult.getValue("custrecord_cust_stock_prod_name");
        var cust_prod_date_stock_used = searchResult.getValue("custrecord_cust_date_stock_used");
        var cust_prod_customer = searchResult.getValue("custrecord_cust_prod_stock_customer");
        var cust_prod_zee = searchResult.getValue("partner", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
        var single_gold_toll = searchResult.getValue("custrecord_cust_prod_stock_single_name");
        var single_gold_mp = searchResult.getValue("custrecord_cust_prod_stock_name_mp");
        var single_platinum_mp = searchResult.getValue("custrecord_cust_prod_stock_3rd_party_mp");
        var single_platinum_toll = searchResult.getValue("custrecord_cust_prod_stock_3rd_party_tol");
        var single_standard_mp = searchResult.getValue("custrecord_mpex_standard_mp_rate");
        var single_standard_toll = searchResult.getValue("custrecord_mpex_standard_toll_rate");
        var single_direct_toll = searchResult.getValue("custrecord_cust_prod_stock_direct_toll");
        var single_direct_mp = searchResult.getValue("custrecord_cust_prod_stock_direct_mp");
        var cust_prod_stock_status = searchResult.getValue("custrecord_cust_prod_stock_status");
        var special_customer_type = searchResult.getValue("custentity_special_customer_type", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
        var mpex_5kg_price_point = parseInt(searchResult.getValue("custentity_mpex_5kg_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_3kg_price_point = parseInt(searchResult.getValue("custentity_mpex_3kg_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_1kg_price_point = parseInt(searchResult.getValue("custentity_mpex_1kg_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_500g_price_point = parseInt(searchResult.getValue("custentity_mpex_500g_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_B4_price_point = parseInt(searchResult.getValue("custentity_mpex_b4_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_C5_price_point = parseInt(searchResult.getValue("custentity_mpex_c5_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var mpex_DL_price_point = parseInt(searchResult.getValue("custentity_mpex_dl_price_point", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
        var barcode = searchResult.getValue("name");

        var z1 = cust_prod_date_stock_used.split('/');
        var date = (parseInt(z1[0]) < 10 ? '0' : '') + parseInt(z1[0]);
        var month = (parseInt(z1[1]) < 10 ? '0' : '') + parseInt(z1[1]);

        var new_date = date + '/' + month + '/' + z1[2];

        nlapiLogExecution('DEBUG', 'Prod Order ID', product_order_id);

        if (cust_prod_customer != old_customer_id) {

            /**
             * Reschedule script after creating product order for each customer
             */
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


            /**
             * Create Product Order
             */
            nlapiLogExecution('DEBUG', 'New Prod Order');

            var product_order_rec = nlapiCreateRecord('customrecord_mp_ap_product_order');
            product_order_rec.setFieldValue('custrecord_ap_order_customer', cust_prod_customer);
            product_order_rec.setFieldValue('custrecord_mp_ap_order_franchisee', cust_prod_zee);
            product_order_rec.setFieldValue('custrecord_mp_ap_order_order_status', 4); //Order Fulfilled
            product_order_rec.setFieldValue('custrecord_mp_ap_order_date', getDate());
            // product_order_rec.setFieldValue('custrecord_mp_ap_order_date', '31/07/2020');
            product_order_rec.setFieldValue('custrecord_ap_order_fulfillment_date', getDate());
            // product_order_rec.setFieldValue('custrecord_ap_order_fulfillment_date', '31/07/2020');
            product_order_rec.setFieldValue('custrecord_mp_ap_order_source', 6);
            product_order_id = nlapiSubmitRecord(product_order_rec);


            /**
             * Create Line Items associated to the product order. 
             */
            var ap_stock_line_item = nlapiCreateRecord('customrecord_ap_stock_line_item');
            ap_stock_line_item.setFieldValue('custrecord_ap_product_order', product_order_id);


            var barcode_beg = barcode.slice(0, 4);

            /**
             * Pricing Points:
                    Gold - Internal ID (1)
                    Platinum - Internal ID (2)
                    Standard - Internal ID (4)
             */

            /**
             * Creating line items for the product order based on the Barcode type and the item rate selected on the customer record. 
             */
            if (barcode_beg == 'MPEN' ||
                barcode_beg == 'MPET' ||
                barcode_beg == 'MPEF' ||
                barcode_beg == 'MPEB' ||
                barcode_beg == 'MPEC' ||
                barcode_beg == 'MPED' ||
                barcode_beg == 'MPEG') {
                if (barcode_beg == 'MPEN') {
                    nlapiLogExecution('DEBUG', 'Inside MPEN');
                    nlapiLogExecution('DEBUG', 'cust_prod_stock_status', cust_prod_stock_status);
                    switch (mpex_1kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPET') {
                    switch (mpex_3kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEF') {
                    switch (mpex_5kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEB') {
                    switch (mpex_B4_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEC') {
                    switch (mpex_C5_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPED') {
                    switch (mpex_DL_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEG') {
                    switch (mpex_500g_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                }
            }


            /**
             * Old Line Items Creation
             * Based on the delivery method and the special customer type.
             */
            // if (isNullorEmpty(special_customer_type) || special_customer_type != 4) {
            //     if (cust_prod_stock_status == 4) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
            //     } else if (cust_prod_stock_status == 5) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
            //     }
            // } else if (special_customer_type == 4) {
            //     if (cust_prod_stock_status == 4) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
            //     } else if (cust_prod_stock_status == 5) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
            //     }
            // }


            nlapiLogExecution('DEBUG', 'Details', 'Date Used:' + new_date + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_line_item_inv_details', 'Used:' + new_date + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_actual_qty', 1);
            nlapiSubmitRecord(ap_stock_line_item);


            /**
             * Update Customer Product Stock record with the product order ID
             */
            var cust_prod_stock_record = nlapiLoadRecord('customrecord_customer_product_stock', cust_prod_stock_id);
            cust_prod_stock_record.setFieldValue('custrecord_prod_stock_prod_order', product_order_id)
            cust_prod_stock_record.setFieldValue('custrecord_cust_prod_stock_status', 7)
            nlapiSubmitRecord(cust_prod_stock_record);


        } else {

            /**
             * Create Line Items associated to the product order.
             */
            var ap_stock_line_item = nlapiCreateRecord('customrecord_ap_stock_line_item');
            ap_stock_line_item.setFieldValue('custrecord_ap_product_order', product_order_id);

            var barcode_beg = barcode.slice(0, 4);

            /**
             * Pricing Points:
                    Gold - Internal ID (1)
                    Platinum - Internal ID (2)
                    Standard - Internal ID (4)
             */

            /**
             * Creating line items for the product order based on the Barcode type and the item rate selected on the customer record. 
             */
            if (barcode_beg == 'MPEN' ||
                barcode_beg == 'MPET' ||
                barcode_beg == 'MPEF' ||
                barcode_beg == 'MPEB' ||
                barcode_beg == 'MPEC' ||
                barcode_beg == 'MPED' ||
                barcode_beg == 'MPEG') {
                if (barcode_beg == 'MPEN') {
                    nlapiLogExecution('DEBUG', 'Inside MPEN');
                    nlapiLogExecution('DEBUG', 'cust_prod_stock_status', cust_prod_stock_status);
                    switch (mpex_1kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPET') {
                    switch (mpex_3kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEF') {
                    switch (mpex_5kg_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEB') {
                    switch (mpex_B4_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEC') {
                    switch (mpex_C5_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPED') {
                    switch (mpex_DL_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                } else if (barcode_beg == 'MPEG') {
                    switch (mpex_500g_price_point) {
                        case 1:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                        case 2:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
                            }
                            break;
                        case 4:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_standard_toll);
                            }
                            break;
                        case 5:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_direct_toll);
                            }
                            break;
                        default:
                            if (cust_prod_stock_status == 4) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
                            } else if (cust_prod_stock_status == 5) {
                                ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
                            }
                            break;
                    }
                }
            }


            /**
             * Old Line Items Creation
             * Based on the delivery method and the special customer type.
             */
            // if (isNullorEmpty(special_customer_type) || special_customer_type != 4) {
            //     if (cust_prod_stock_status == 4) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_mp);
            //     } else if (cust_prod_stock_status == 5) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_gold_toll);
            //     }
            // } else if (special_customer_type == 4) {
            //     if (cust_prod_stock_status == 4) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_mp);
            //     } else if (cust_prod_stock_status == 5) {
            //         ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_item', single_platinum_toll);
            //     }
            // }
            ap_stock_line_item.setFieldValue('custrecord_ap_line_item_inv_details', 'Used:' + new_date + '-' + barcode);
            ap_stock_line_item.setFieldValue('custrecord_ap_stock_line_actual_qty', 1);
            nlapiSubmitRecord(ap_stock_line_item);

            /**
             * Update the Customer Product Stoc record with the Product Order ID
             */
            var cust_prod_stock_record = nlapiLoadRecord('customrecord_customer_product_stock', cust_prod_stock_id);
            cust_prod_stock_record.setFieldValue('custrecord_prod_stock_prod_order', product_order_id)
            cust_prod_stock_record.setFieldValue('custrecord_cust_prod_stock_status', 7)
            nlapiSubmitRecord(cust_prod_stock_record);
        }


        old_customer_id = cust_prod_customer;
        count++;

        return true;
    });


}

/**
 * Return today's date
 * @return {[String]} today's date
 */
function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);

    return date;
}