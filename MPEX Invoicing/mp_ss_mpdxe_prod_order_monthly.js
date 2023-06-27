/**
 * Module Description
 *
 * NSVersion    Date                        Author
 * 1.00         2019-04-11 12:25:19         ankith.ravindran
 *
 * Description: Create Monthly Product Orders for MPEX
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-03-15T17:08:56+11:00
 *
 */

var usage_threshold = 200; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {


  nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT',
    'custscript_prev_deploy_create_prod_order'));
  if (!isNullorEmpty(ctx.getSetting('SCRIPT',
    'custscript_prev_deploy_create_prod_order'))) {
    prev_inv_deploy = ctx.getSetting('SCRIPT',
      'custscript_prev_deploy_create_prod_order');
  } else {
    prev_inv_deploy = ctx.getDeploymentId();
  }

  /**
   * MPEX - To Create Product Order (For Monthly Invoicing)
   */
  var createProdOrderSearch = nlapiLoadSearch(
    'customrecord_customer_product_stock',
    'customsearch_prod_stock_create_prod_orde');
  var resultCreateProdOrder = createProdOrderSearch.runSearch();

  var old_customer_id = null;
  var product_order_id;
  var old_product_order_id = null;
  var count = 0;
  var digital_label = 0;

  var rasTeir1Count = 0;
  var rasTeir2Count = 0;
  var rasTeir3Count = 0;

  var manualBarcodesCount = 0;

  var manual_surcharge_to_be_applied = false;
  var fuel_surcharge_to_be_applied = false;

  /**
   * Go through each line item from the search.
   */
  resultCreateProdOrder.forEachResult(function (searchResult) {

    var cust_prod_stock_id = searchResult.getValue("internalid");
    var connote_number = searchResult.getValue("custrecord_connote_number");
    var barcode_source = searchResult.getValue("custrecord_barcode_source");
    var manual_surcharge = searchResult.getValue(
      "custentity_manual_surcharge",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var fuel_surcharge = searchResult.getValue(
      "custentity_fuel_surcharge",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var product_name = searchResult.getValue(
      "custrecord_cust_stock_prod_name");
    var product_name_text = searchResult.getText(
      "custrecord_cust_stock_prod_name");
    var cust_prod_item = searchResult.getValue(
      "custrecord_cust_stock_prod_name");
    var cust_prod_date_stock_used = searchResult.getValue(
      "custrecord_cust_date_stock_used");
    var cust_prod_customer = searchResult.getValue(
      "custrecord_cust_prod_stock_customer");
    var cust_prod_zee = searchResult.getValue("partner",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var single_gold_toll = searchResult.getValue(
      "custrecord_cust_prod_stock_single_name");
    var single_gold_mp = searchResult.getValue(
      "custrecord_cust_prod_stock_name_mp");
    var single_platinum_mp = searchResult.getValue(
      "custrecord_cust_prod_stock_3rd_party_mp");
    var single_platinum_toll = searchResult.getValue(
      "custrecord_cust_prod_stock_3rd_party_tol");
    var single_standard_mp = searchResult.getValue(
      "custrecord_mpex_standard_mp_rate");
    var single_standard_toll = searchResult.getValue(
      "custrecord_mpex_standard_toll_rate");
    var single_direct_toll = searchResult.getValue(
      "custrecord_cust_prod_stock_direct_toll");
    var single_direct_mp = searchResult.getValue(
      "custrecord_cust_prod_stock_direct_mp");
    var single_pro_toll = searchResult.getValue(
      "custrecord_cust_prod_stock_pro_toll");
    var single_pro_mp = searchResult.getValue(
      "custrecord_cust_prod_stock_pro_mp");
    var single_pro_gold_toll = searchResult.getValue(
      "custrecord_cust_prod_stock_pro_gold_toll");
    var single_pro_gold_mp = searchResult.getValue(
      "custrecord_cust_prod_stock_pro_gold_mp");
    var cust_prod_stock_status = searchResult.getValue(
      "custrecord_cust_prod_stock_status");
    var special_customer_type = searchResult.getValue(
      "custentity_special_customer_type",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var mpex_5kg_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_5kg_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_3kg_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_3kg_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_1kg_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_1kg_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_500g_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_500g_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_B4_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_b4_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_C5_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_c5_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var mpex_DL_price_point = parseInt(searchResult.getValue(
      "custentity_mpex_dl_price_point",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null));
    var barcode = searchResult.getValue("name");
    var manual_platinum_mp = searchResult.getValue(
      "custrecord_mpex_manual_plat_mp");
    var manual_platinum_toll = searchResult.getValue(
      "custrecord_mpex_manual_plat_toll");
    var pro_gold_mp = searchResult.getValue("custrecord_mpex_pro_gold_mp");
    var pro_gold_toll = searchResult.getValue(
      "custrecord_mpex_pro_gold_toll");
    var pro_platinum_mp = searchResult.getValue(
      "custrecord_mpex_pro_platinum_mp");
    var pro_platinum_toll = searchResult.getValue(
      "custrecord_mpex_platinum_toll");
    var pro_plus_mp = searchResult.getValue("custrecord_mpex_pro_plus_mp");
    var pro_plus_toll = searchResult.getValue(
      "custrecord_mpex_pro_plus_toll");
    var pro_standard_mp = searchResult.getValue(
      "custrecord_mpex_pro_standard_mp");
    var pro_standard_toll = searchResult.getValue(
      "custrecord_mpex_pro_standard_toll");

    var receiverSuburb = searchResult.getValue(
      "custrecord_receiver_suburb");
    var receiverPostcode = searchResult.getValue(
      "custrecord_receiver_postcode");
    var receiverState = searchResult.getValue(
      "custrecord_receiver_state");

    nlapiLogExecution('AUDIT', 'receiverSuburb', receiverSuburb);
    nlapiLogExecution('AUDIT', 'receiverPostcode', receiverPostcode);

    // MP Express - Manual Usage - Contact List
    var tgeRASSuburbListSearch = nlapiLoadSearch('customrecord_tge_ras_suburb_list',
      'customsearch_tge_ras_suburb_list');

    var newFilters = new Array();
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ras_suburb', null, 'is',
      receiverSuburb);
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ras_postcode', null, 'is',
      receiverPostcode);

    tgeRASSuburbListSearch.addFilters(newFilters);

    var tgeRASSuburbListSearch = tgeRASSuburbListSearch.runSearch();
    var teirType = 0;
    tgeRASSuburbListSearch.forEachResult(function (searchResult) {

      teirType = searchResult.getValue('custrecord_ras_teir');
      return true;
    });

    nlapiLogExecution('AUDIT', 'teirType', teirType);

    if (teirType == 1) {
      rasTeir1Count++;
    } else if (teirType == 2) {
      rasTeir2Count++;
    } else if (teirType == 3) {
      rasTeir3Count++;
    }

    nlapiLogExecution('AUDIT', 'rasTeir1Count', rasTeir1Count);
    nlapiLogExecution('AUDIT', 'rasTeir2Count', rasTeir2Count);
    nlapiLogExecution('AUDIT', 'rasTeir3Count', rasTeir3Count);

    var cust_prod_pricing_dl_ns_item = searchResult.getValue("custrecord_prod_pricing_dl", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_c5_ns_item = searchResult.getValue("custrecord_prod_pricing_c5", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_b4_ns_item = searchResult.getValue("custrecord_prod_pricing_b4", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_250g_ns_item = searchResult.getValue("custrecord_prod_pricing_250g", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_500g_ns_item = searchResult.getValue("custrecord_prod_pricing_500g", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_1kg_ns_item = searchResult.getValue("custrecord_prod_pricing_1kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_3kg_ns_item = searchResult.getValue("custrecord_prod_pricing_3kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_5kg_ns_item = searchResult.getValue("custrecord_prod_pricing_5kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_10kg_ns_item = searchResult.getValue("custrecord_prod_pricing_10kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_25kg_ns_item = searchResult.getValue("custrecord_prod_pricing_25kg", "CUSTRECORD_CUST_PROD_PRICING", null);

    var cust_prod_pricing_dl_ns_item_text = searchResult.getText("custrecord_prod_pricing_dl", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_c5_ns_item_text = searchResult.getText("custrecord_prod_pricing_c5", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_b4_ns_item_text = searchResult.getText("custrecord_prod_pricing_b4", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_250g_ns_item_text = searchResult.getText("custrecord_prod_pricing_250g", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_500g_ns_item_text = searchResult.getText("custrecord_prod_pricing_500g", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_1kg_ns_item_text = searchResult.getText("custrecord_prod_pricing_1kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_3kg_ns_item_text = searchResult.getText("custrecord_prod_pricing_3kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_5kg_ns_item_text = searchResult.getText("custrecord_prod_pricing_5kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_10kg_ns_item_text = searchResult.getText("custrecord_prod_pricing_10kg", "CUSTRECORD_CUST_PROD_PRICING", null);
    var cust_prod_pricing_25kg_ns_item_text = searchResult.getText("custrecord_prod_pricing_25kg", "CUSTRECORD_CUST_PROD_PRICING", null);


    var z1 = cust_prod_date_stock_used.split('/');
    var date = (parseInt(z1[0]) < 10 ? '0' : '') + parseInt(z1[0]);
    var month = (parseInt(z1[1]) < 10 ? '0' : '') + parseInt(z1[1]);

    var new_date = date + '/' + month + '/' + z1[2];

    var prod_name = product_name_text.split(" - ");
    var product_type = prod_name[1].substring(0, 2);

    nlapiLogExecution('DEBUG', 'product_type', product_type);
    nlapiLogExecution('DEBUG', 'Barcode', barcode);
    nlapiLogExecution('DEBUG', 'Prod Name', product_name);
    nlapiLogExecution('DEBUG', 'Prod Order ID', product_order_id);
    nlapiLogExecution('DEBUG', 'single_gold_toll', single_gold_toll);
    nlapiLogExecution('DEBUG', 'single_gold_mp', single_gold_mp);
    nlapiLogExecution('DEBUG', 'single_platinum_mp', single_platinum_mp);
    nlapiLogExecution('DEBUG', 'single_platinum_toll', single_platinum_toll);
    nlapiLogExecution('DEBUG', 'single_standard_mp', single_standard_mp);
    nlapiLogExecution('DEBUG', 'single_platinum_toll', single_platinum_toll);
    nlapiLogExecution('DEBUG', 'single_pro_toll', single_pro_toll);
    nlapiLogExecution('DEBUG', 'single_pro_mp', single_pro_mp);
    nlapiLogExecution('DEBUG', 'mpex_5kg_price_point', mpex_5kg_price_point);
    nlapiLogExecution('DEBUG', 'mpex_3kg_price_point', mpex_3kg_price_point);
    nlapiLogExecution('DEBUG', 'mpex_1kg_price_point', mpex_1kg_price_point);
    nlapiLogExecution('DEBUG', 'mpex_500g_price_point',
      mpex_500g_price_point);
    nlapiLogExecution('DEBUG', 'mpex_B4_price_point', mpex_B4_price_point);
    nlapiLogExecution('DEBUG', 'mpex_C5_price_point', mpex_C5_price_point);
    nlapiLogExecution('DEBUG', 'mpex_DL_price_point', mpex_DL_price_point);

    nlapiLogExecution('AUDIT', 'product_type', product_type);
    nlapiLogExecution('AUDIT', 'Barcode', barcode);
    nlapiLogExecution('AUDIT', 'Prod Name', product_name);
    nlapiLogExecution('AUDIT', 'Prod Order ID', product_order_id);
    nlapiLogExecution('AUDIT', 'Barcode Source', barcode_source);


    if (cust_prod_customer != old_customer_id) {

      /**
       * Reschedule script after creating product order for each customer
       */
      if (count != 0) {

        var productOrderRec = nlapiLoadRecord(
          'customrecord_mp_ap_product_order', old_product_order_id);
        if (manual_surcharge_to_be_applied == true) {
          productOrderRec.setFieldValue(
            'custrecord_manual_surcharge_applied', 1)
        } else {
          productOrderRec.setFieldValue(
            'custrecord_manual_surcharge_applied', 2)
        }

        nlapiLogExecution('AUDIT', 'manualBarcodesCount before saving', manualBarcodesCount);

        productOrderRec.setFieldValue('custrecord_ras_teir1_barcode_count', rasTeir1Count);
        productOrderRec.setFieldValue('custrecord_ras_teir2_barcode_count', rasTeir2Count);
        productOrderRec.setFieldValue('custrecord_ras_teir3_barcode_count', rasTeir3Count);
        productOrderRec.setFieldValue('custrecord_manual_barcode_count', manualBarcodesCount);
        nlapiSubmitRecord(productOrderRec);
        nlapiSubmitRecord(productOrderRec);


        var params = {
          custscript_prev_deploy_create_prod_order: ctx.getDeploymentId(),
        }

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy,
          params);
        nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
        if (reschedule == false) {

          return false;
        }
      }

      /*
       * Create Product Order
       */

      nlapiLogExecution('DEBUG', 'New Prod Order');

      var product_order_rec = nlapiCreateRecord(
        'customrecord_mp_ap_product_order');
      nlapiLogExecution('DEBUG', 'fuel_surcharge', fuel_surcharge);
      if (fuel_surcharge == 1 || fuel_surcharge == '1') {
        product_order_rec.setFieldValue('custrecord_fuel_surcharge_applied',
          1);
      }
      product_order_rec.setFieldValue('custrecord_ap_order_customer',
        cust_prod_customer);
      product_order_rec.setFieldValue('custrecord_mp_ap_order_franchisee',
        cust_prod_zee);
      product_order_rec.setFieldValue('custrecord_mp_ap_order_order_status',
        4);
      product_order_rec.setFieldValue('custrecord_mp_ap_order_date',
        getDate());
      //            product_order_rec.setFieldValue('custrecord_mp_ap_order_date', '15/08/2021');
      product_order_rec.setFieldValue(
        'custrecord_ap_order_fulfillment_date', getDate());
      //            product_order_rec.setFieldValue('custrecord_ap_order_fulfillment_date', '15/08/2021');
      product_order_rec.setFieldValue('custrecord_mp_ap_order_source', 6);
      product_order_id = nlapiSubmitRecord(product_order_rec);

      /**
       * Create Line Items associated to the product order.
       */
      var ap_stock_line_item = nlapiCreateRecord(
        'customrecord_ap_stock_line_item');
      ap_stock_line_item.setFieldValue('custrecord_ap_product_order',
        product_order_id);


      var barcode_beg = barcode.slice(0, 4);

      nlapiLogExecution('DEBUG', 'barcode_beg', barcode_beg);
      nlapiLogExecution('DEBUG', 'barcode', barcode);

      /*
          Old MPEX Pricing - 1st Nov 2021 Onwards
              Gold    1
              Platinum    2
              Same as AP  3
              Standard    4
              AP Match    5
              Pro Platinum (Old)  6
              Pro Gold (Old)  7
      */

      /*
      New MPEX Price Points - 1st Sept 2021 Onwards
          Pro Standard    8
          Pro Plus    9
          Manual Platinum 10
          Pro Platinum    11
          Pro Gold    12
       */


      /**
       * Creating line items for the product order based on the Barcode type and the item rate selected on the customer record.
       */
      // if (barcode_beg == 'MPEN' ||
      //   barcode_beg == 'MPET' ||
      //   barcode_beg == 'MPEF' ||
      //   barcode_beg == 'MPEB' ||
      //   barcode_beg == 'MPEC' ||
      //   barcode_beg == 'MPED' ||
      //   barcode_beg == 'MPEG') {
      //   if (barcode_beg == 'MPEN') {
      //     nlapiLogExecution('DEBUG', 'Inside MPEN');
      //     nlapiLogExecution('DEBUG', 'cust_prod_stock_status',
      //       cust_prod_stock_status);
      //     if (!isNullorEmpty(cust_prod_pricing_1kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1kg_ns_item_text);
      //     } else {
      //       switch (mpex_1kg_price_point) {
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPET') {
      //     if (!isNullorEmpty(cust_prod_pricing_3kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_3kg_ns_item_text);
      //     } else {
      //       switch (mpex_3kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEF') {
      //     if (!isNullorEmpty(cust_prod_pricing_5kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_5kg_ns_item_text);
      //     } else {
      //       switch (mpex_5kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEB') {
      //     if (!isNullorEmpty(cust_prod_pricing_b4_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1b4_ns_item_text);
      //     } else {
      //       switch (mpex_B4_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEC') {
      //     if (!isNullorEmpty(cust_prod_pricing_c5_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_c5_ns_item_text);
      //     } else {
      //       switch (mpex_C5_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPED') {
      //     if (!isNullorEmpty(cust_prod_pricing_dl_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_dl_ns_item_text);
      //     } else {
      //       switch (mpex_DL_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEG') {
      //     if (!isNullorEmpty(cust_prod_pricing_500g_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_500g_ns_item_text);
      //     } else {
      //       switch (mpex_500g_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   }
      // } else {
      //   if (product_type == '1K') {
      //     nlapiLogExecution('DEBUG', 'Inside MPEN');
      //     nlapiLogExecution('DEBUG', 'cust_prod_stock_status',
      //       cust_prod_stock_status);
      //     if (!isNullorEmpty(cust_prod_pricing_1kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1kg_ns_item_text);
      //     } else {
      //       switch (mpex_1kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '3K') {
      //     if (!isNullorEmpty(cust_prod_pricing_3kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_3kg_ns_item_text);
      //     } else {
      //       switch (mpex_3kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '5K') {
      //     if (!isNullorEmpty(cust_prod_pricing_5kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_5kg_ns_item_text);
      //     } else {
      //       switch (mpex_5kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'B4') {
      //     if (!isNullorEmpty(cust_prod_pricing_b4_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_b4_ns_item_text);
      //     } else {
      //       switch (mpex_B4_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'C5') {
      //     if (!isNullorEmpty(cust_prod_pricing_c5_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_c5_ns_item_text);
      //     } else {
      //       switch (mpex_C5_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'DL') {
      //     if (!isNullorEmpty(cust_prod_pricing_dl_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_dl_ns_item_text);
      //     } else {
      //       switch (mpex_DL_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '50') {
      //     if (!isNullorEmpty(cust_prod_pricing_500g_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_500g_ns_item_text);
      //     } else {
      //       switch (mpex_500g_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   }
      // }

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

      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_item', product_name);

      var inv_details = 'Used:' + new_date + '-' + barcode;
      if (inv_details.length > 33) {
        inv_details = 'Used:' + new_date + '-' + connote_number;
      }

      ap_stock_line_item.setFieldValue(
        'custrecord_ap_line_item_inv_details', inv_details);
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_actual_qty', 1);

      if (barcode_source == 1 || isNullorEmpty(barcode_source)) {
        manualBarcodesCount++;
      }

      if (manual_surcharge == 1) {
        if (barcode_source == 1 && digital_label == 0) {
          manual_surcharge_to_be_applied = true;
        } else {
          manual_surcharge_to_be_applied = false;
          digital_label++;
        }
      }

      nlapiSubmitRecord(ap_stock_line_item);

      nlapiLogExecution('DEBUG', 'cust_prod_stock_id', cust_prod_stock_id);

      /**
       * Update Customer Product Stock record with the product order ID
       */
      var cust_prod_stock_record = nlapiLoadRecord(
        'customrecord_customer_product_stock', cust_prod_stock_id);
      cust_prod_stock_record.setFieldValue(
        'custrecord_prod_stock_prod_order', product_order_id)
      cust_prod_stock_record.setFieldValue(
        'custrecord_cust_prod_stock_status', 7)
      nlapiSubmitRecord(cust_prod_stock_record);


    } else {
      nlapiLogExecution('DEBUG',
        'Inside Create Line Items associated to the product order. ')
      /**
       * Create Line Items associated to the product order.
       */
      var ap_stock_line_item = nlapiCreateRecord(
        'customrecord_ap_stock_line_item');
      ap_stock_line_item.setFieldValue('custrecord_ap_product_order',
        product_order_id);


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
      // if (barcode_beg == 'MPEN' ||
      //   barcode_beg == 'MPET' ||
      //   barcode_beg == 'MPEF' ||
      //   barcode_beg == 'MPEB' ||
      //   barcode_beg == 'MPEC' ||
      //   barcode_beg == 'MPED' ||
      //   barcode_beg == 'MPEG') {
      //   if (barcode_beg == 'MPEN') {
      //     nlapiLogExecution('DEBUG', 'Inside MPEN');
      //     nlapiLogExecution('DEBUG', 'cust_prod_stock_status',
      //       cust_prod_stock_status);
      //     if (!isNullorEmpty(cust_prod_pricing_1kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1kg_ns_item_text);
      //     } else {
      //       switch (mpex_1kg_price_point) {
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPET') {
      //     if (!isNullorEmpty(cust_prod_pricing_3kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_3kg_ns_item_text);
      //     } else {
      //       switch (mpex_3kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEF') {
      //     if (!isNullorEmpty(cust_prod_pricing_5kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_5kg_ns_item_text);
      //     } else {
      //       switch (mpex_5kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEB') {
      //     if (!isNullorEmpty(cust_prod_pricing_b4_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1b4_ns_item_text);
      //     } else {
      //       switch (mpex_B4_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEC') {
      //     if (!isNullorEmpty(cust_prod_pricing_c5_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_c5_ns_item_text);
      //     } else {
      //       switch (mpex_C5_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPED') {
      //     if (!isNullorEmpty(cust_prod_pricing_dl_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_dl_ns_item_text);
      //     } else {
      //       switch (mpex_DL_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (barcode_beg == 'MPEG') {
      //     if (!isNullorEmpty(cust_prod_pricing_500g_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_500g_ns_item_text);
      //     } else {
      //       switch (mpex_500g_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   }
      // } else {
      //   if (product_type == '1K') {
      //     nlapiLogExecution('DEBUG', 'Inside MPEN');
      //     nlapiLogExecution('DEBUG', 'cust_prod_stock_status',
      //       cust_prod_stock_status);
      //     if (!isNullorEmpty(cust_prod_pricing_1kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_1kg_ns_item_text);
      //     } else {
      //       switch (mpex_1kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '3K') {
      //     if (!isNullorEmpty(cust_prod_pricing_3kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_3kg_ns_item_text);
      //     } else {
      //       switch (mpex_3kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '5K') {
      //     if (!isNullorEmpty(cust_prod_pricing_5kg_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_5kg_ns_item_text);
      //     } else {
      //       switch (mpex_5kg_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'B4') {
      //     if (!isNullorEmpty(cust_prod_pricing_b4_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_b4_ns_item_text);
      //     } else {
      //       switch (mpex_B4_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'C5') {
      //     if (!isNullorEmpty(cust_prod_pricing_c5_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_c5_ns_item_text);
      //     } else {
      //       switch (mpex_C5_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == 'DL') {
      //     if (!isNullorEmpty(cust_prod_pricing_dl_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_dl_ns_item_text);
      //     } else {
      //       switch (mpex_DL_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   } else if (product_type == '50') {
      //     if (!isNullorEmpty(cust_prod_pricing_500g_ns_item)) {
      //       ap_stock_line_item.setFieldText(
      //         'custrecord_ap_stock_line_item', cust_prod_pricing_500g_ns_item_text);
      //     } else {
      //       switch (mpex_500g_price_point) {
      //         // case 1:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_gold_toll);
      //         //   }
      //         //   break;
      //         // case 2:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_platinum_toll);
      //         //   }
      //         //   break;
      //         // case 4:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_standard_toll);
      //         //   }
      //         //   break;
      //         // case 5:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_direct_toll);
      //         //   }
      //         //   break;
      //         // case 6:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_toll);
      //         //   }
      //         //   break;
      //         // case 7:
      //         //   if (cust_prod_stock_status == 4) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_mp);
      //         //   } else if (cust_prod_stock_status == 5) {
      //         //     ap_stock_line_item.setFieldValue(
      //         //       'custrecord_ap_stock_line_item', single_pro_gold_toll);
      //         //   }
      //         //   break;
      //         case 8:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_standard_toll);
      //           }
      //           break;
      //         case 9:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_plus_toll);
      //           }
      //           break;
      //         case 10:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', manual_platinum_toll);
      //           }
      //           break;
      //         case 11:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_platinum_toll);
      //           }
      //           break;
      //         case 12:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //         default:
      //           if (cust_prod_stock_status == 4) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_mp);
      //           } else if (cust_prod_stock_status == 5) {
      //             ap_stock_line_item.setFieldValue(
      //               'custrecord_ap_stock_line_item', pro_gold_toll);
      //           }
      //           break;
      //       }
      //     }
      //   }
      // }



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

      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_item', product_name);

      var inv_details = 'Used:' + new_date + '-' + barcode;
      if (inv_details.length > 33) {
        inv_details = 'Used:' + new_date + '-' + connote_number;
      }
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_line_item_inv_details', inv_details);
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_actual_qty', 1);

      if (barcode_source == 1 || isNullorEmpty(barcode_source)) {
        manualBarcodesCount++;
      }

      if (manual_surcharge == 1) {
        if (barcode_source == 1 && digital_label == 0) {
          manual_surcharge_to_be_applied = true;
        } else {
          manual_surcharge_to_be_applied = false;
          digital_label++;
        }
      }

      nlapiSubmitRecord(ap_stock_line_item);


      /**
       * Update Customer Product Stock record with the product order ID
       */
      var cust_prod_stock_record = nlapiLoadRecord(
        'customrecord_customer_product_stock', cust_prod_stock_id);
      cust_prod_stock_record.setFieldValue(
        'custrecord_prod_stock_prod_order', product_order_id)
      cust_prod_stock_record.setFieldValue(
        'custrecord_cust_prod_stock_status', 7)
      nlapiSubmitRecord(cust_prod_stock_record);

      /**
       * Reschedule script after updating product order with AP Line Item an the count of line items created is 150
       */
      if (count > 450) {

        nlapiLogExecution('DEBUG', 'Count', count);
        var productOrderRec = nlapiLoadRecord(
          'customrecord_mp_ap_product_order', old_product_order_id);
        if (manual_surcharge_to_be_applied == true) {
          productOrderRec.setFieldValue(
            'custrecord_manual_surcharge_applied', 1)
        } else {
          productOrderRec.setFieldValue(
            'custrecord_manual_surcharge_applied', 2)
        }

        nlapiLogExecution('AUDIT', 'manualBarcodesCount saving once count crossed 450', manualBarcodesCount);

        productOrderRec.setFieldValue('custrecord_ras_teir1_barcode_count', rasTeir1Count);
        productOrderRec.setFieldValue('custrecord_ras_teir2_barcode_count', rasTeir2Count);
        productOrderRec.setFieldValue('custrecord_ras_teir3_barcode_count', rasTeir3Count);
        productOrderRec.setFieldValue('custrecord_manual_barcode_count', manualBarcodesCount);

        nlapiSubmitRecord(productOrderRec);
        var params = {
          custscript_prev_deploy_create_prod_order: ctx.getDeploymentId(),
        }

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy,
          params);
        nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
        if (reschedule == false) {

          return false;
        }
      }
    }

    old_customer_id = cust_prod_customer;
    old_product_order_id = product_order_id
    count++;

    nlapiLogExecution('DEBUG', 'Counter', count);
    nlapiLogExecution('DEBUG', 'Manual Surcharge Applied',
      manual_surcharge_to_be_applied);

    return true;
  });

  if (count > 0) {
    var productOrderRec = nlapiLoadRecord(
      'customrecord_mp_ap_product_order', old_product_order_id);
    if (manual_surcharge_to_be_applied == true) {
      productOrderRec.setFieldValue(
        'custrecord_manual_surcharge_applied', 1)
    } else {
      productOrderRec.setFieldValue(
        'custrecord_manual_surcharge_applied', 2)
    }

    nlapiLogExecution('AUDIT', 'manualBarcodesCount saving at the last loop', manualBarcodesCount);

    productOrderRec.setFieldValue('custrecord_ras_teir1_barcode_count', rasTeir1Count);
    productOrderRec.setFieldValue('custrecord_ras_teir2_barcode_count', rasTeir2Count);
    productOrderRec.setFieldValue('custrecord_ras_teir3_barcode_count', rasTeir3Count);
    productOrderRec.setFieldValue('custrecord_manual_barcode_count', manualBarcodesCount);

    nlapiSubmitRecord(productOrderRec);
  }

}

/**
 * Return today's date
 * @return {[String]} date
 */
function getDate() {
  var date = new Date();
  if (date.getHours() > 6) {
    date = nlapiAddDays(date, 1);
  }
  date = nlapiDateToString(date);

  return date;
}
