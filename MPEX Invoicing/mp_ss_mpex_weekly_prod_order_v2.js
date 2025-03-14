/**
 * Module Description
 *
 * NSVersion    Date                        Author
 * 1.00         2020-06-17 10:00:05         Ankith
 *
 * Description: Create Product Orders for MPEX Weekly Invoicing
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2025-03-12T21:29:37.395Z
 *
 */

var usage_threshold = 200; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

  prev_inv_deploy = ctx.getDeploymentId();


  /**
   * MPEX - To Create Product Order (For Weekly Invoicing)
   *
   */
  var createProdOrderSearch = nlapiLoadSearch(
    'customrecord_customer_product_stock',
    'customsearch_mpex_weekly_prod_order');
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

    var usage_loopstart_cust = ctx.getRemainingUsage();

    if ((usage_loopstart_cust < 200)) {

      reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);

      if (reschedule == false) {
        return false;
      }
    }

    var cust_prod_stock_id = searchResult.getValue("internalid");
    var connote_number = searchResult.getValue("custrecord_connote_number");
    var barcode_source = searchResult.getValue("custrecord_barcode_source");
    var manual_surcharge = searchResult.getValue(
      "custentity_manual_surcharge",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var fuel_surcharge = searchResult.getValue(
      "custentity_fuel_surcharge",
      "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", null);
    var mpex_fuel_surcharge = searchResult.getValue(
      "custentity_mpex_surcharge",
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

    //Receiver Details
    var receiverSuburb = searchResult.getValue(
      "custrecord_receiver_suburb");
    var receiverPostcode = searchResult.getValue(
      "custrecord_receiver_postcode");
    var receiverState = searchResult.getValue(
      "custrecord_receiver_state");

    //Sender Details
    var senderSuburb = searchResult.getValue(
      "custrecord_sender_suburb");
    var senderPostcode = searchResult.getValue(
      "custrecord_sender_post_code");
    var senderState = searchResult.getValue(
      "custrecord_sender_state");

    var manualFeeToBeCharged = searchResult.getValue(
      "custrecord_manual_fee_charged");
    var barcodeDeliverySpeed = searchResult.getValue(
      "custrecord_delivery_speed");

    nlapiLogExecution('AUDIT', 'receiverSuburb', receiverSuburb);
    nlapiLogExecution('AUDIT', 'receiverPostcode', receiverPostcode);


    var teirType = 0;
    var currentBarcodeRASTier1 = false;
    var currentBarcodeRASTier2 = false;
    var currentBarcodeRASTier3 = false;

    var tgeReceiverTempLevyApplicable = false;
    var tgeSenderTempLevyApplicable = false;

    if (barcodeDeliverySpeed == 2) {
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


      tgeRASSuburbListSearch.forEachResult(function (searchResult) {

        teirType = searchResult.getValue('custrecord_ras_teir');
        return true;
      });

      //Check if receiver suburb/state/postcode is in the TGE Temp Levy Suburb List
      //Search Name: TGE Temperory Levy - Suburb List Search
      var tgeTempLevySuburbListSearch = nlapiLoadSearch('customrecord_tge_temp_levy_suburb_list',
        'customsearch_tge_temp_levy_suburb_list');

      var newFilters = new Array();
      newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_temp_levy_suburb', null, 'is',
        receiverSuburb);
      newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_temp_levy_state', null, 'is',
        receiverState);
      newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_levy_postcode', null, 'is',
        receiverPostcode);

      tgeTempLevySuburbListSearch.addFilters(newFilters);

      var tgeTempLevySuburbListSearchResult = tgeTempLevySuburbListSearch.runSearch();
      var result = tgeTempLevySuburbListSearchResult.getResults(0, 1);
      if (result.length != 0) {
        tgeReceiverTempLevyApplicable = true;
      }

      if (tgeReceiverTempLevyApplicable == false) {
        //Check if sender suburb/state/postcode is in the TGE Temp Levy Suburb List
        //Search Name: TGE Temperory Levy - Suburb List Search
        var tgeTempLevySuburbListSearch = nlapiLoadSearch('customrecord_tge_temp_levy_suburb_list',
          'customsearch_tge_temp_levy_suburb_list');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_temp_levy_suburb', null, 'is',
          senderSuburb);
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_temp_levy_state', null, 'is',
          senderState);
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_tge_levy_postcode', null, 'is',
          senderPostcode);

        tgeTempLevySuburbListSearch.addFilters(newFilters);

        var tgeTempLevySuburbListSearchResult = tgeTempLevySuburbListSearch.runSearch();
        var result = tgeTempLevySuburbListSearchResult.getResults(0, 1);
        if (result.length != 0) {
          tgeReceiverTempLevyApplicable = true;
        }
      }
    }

    nlapiLogExecution('AUDIT', 'teirType', teirType);

    if (teirType == 1) {
      rasTeir1Count++;
      currentBarcodeRASTier1 = true;
    } else if (teirType == 2) {
      rasTeir2Count++;
      currentBarcodeRASTier2 = true;
    } else if (teirType == 3) {
      rasTeir3Count++;
      currentBarcodeRASTier3 = true;
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

    var z1 = cust_prod_date_stock_used.split('/');
    var date = (parseInt(z1[0]) < 10 ? '0' : '') + parseInt(z1[0]);
    var month = (parseInt(z1[1]) < 10 ? '0' : '') + parseInt(z1[1]);

    var new_date = date + '/' + month + '/' + z1[2];

    var prod_name = product_name_text.split(" - ");
    var product_type = prod_name[1].substring(0, 2);

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

        // rasTeir1Count = 0;
        // rasTeir2Count = 0;
        // rasTeir3Count = 0;
        // manualBarcodesCount = 0;

        var params = {
          custscript_prev_deploy_create_prod_order: ctx.getDeploymentId(),
        }

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy,
          params);

        if (reschedule == false) {

          return false;
        }
      }


      /**
       * Create Product Order
       */
      nlapiLogExecution('DEBUG', 'New Prod Order');

      var product_order_rec = nlapiCreateRecord(
        'customrecord_mp_ap_product_order');

      if (fuel_surcharge == 1 || fuel_surcharge == '1' ||
        mpex_fuel_surcharge == 1 || mpex_fuel_surcharge == '1') {
        product_order_rec.setFieldValue('custrecord_fuel_surcharge_applied',
          1);
      }
      product_order_rec.setFieldValue('custrecord_ap_order_customer',
        cust_prod_customer);
      product_order_rec.setFieldValue('custrecord_mp_ap_order_franchisee',
        cust_prod_zee);
      product_order_rec.setFieldValue('custrecord_mp_ap_order_order_status',
        4); //Order Fulfilled
      product_order_rec.setFieldValue('custrecord_mp_ap_order_date',
        getDate());
      //            product_order_rec.setFieldValue('custrecord_mp_ap_order_date', '22/08/2021');
      product_order_rec.setFieldValue(
        'custrecord_ap_order_fulfillment_date', getDate());
      //             product_order_rec.setFieldValue('custrecord_ap_order_fulfillment_date', '22/08/2021');
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

      /**
       * Creating line items for the product order based on the Barcode type and the item rate selected on the customer record.
       */
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_item', product_name);

      // var inv_details = new_date + '-' + barcode;
      // if (inv_details.length > 33) {
      //   inv_details = new_date + '-' + connote_number;
      // }
      if (!isNullorEmpty(connote_number)) {
        var inv_details = new_date + '-' + connote_number;
      } else {
        var inv_details = new_date + '-' + barcode;
      }

      nlapiLogExecution('DEBUG', 'Details', inv_details);

      ap_stock_line_item.setFieldValue(
        'custrecord_ap_line_item_inv_details', inv_details);
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_actual_qty', 1);

      if (currentBarcodeRASTier1 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 1');
      } else if (currentBarcodeRASTier2 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 2');
      } else if (currentBarcodeRASTier3 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 3');
      }


      if ((barcode_source == 1 || isNullorEmpty(barcode_source)) && manualFeeToBeCharged != 2) {
        manualBarcodesCount++;
      }

      if (manual_surcharge == 1 || mpex_fuel_surcharge == 1) {
        if (barcode_source == 1 && digital_label == 0) {
          manual_surcharge_to_be_applied = true;

        } else {
          manual_surcharge_to_be_applied = false;
          digital_label++;
        }
      }

      var apLineItemRecordID = nlapiSubmitRecord(ap_stock_line_item);

      //Update the TGE Temp Levy field in the AP Line Item record
      if (tgeReceiverTempLevyApplicable == true || tgeSenderTempLevyApplicable == true) {
        var apLineItemRecord = nlapiLoadRecord(
          'customrecord_ap_stock_line_item', apLineItemRecordID);
        var expectedRevenue = apLineItemRecord.getFieldValue(
          'custrecord_ap_line_item_exp_revenue');
        //Calculate the 25% TGE Temp Levy
        var tgeTempLevy = (expectedRevenue * 0.25).toFixed(2);
        apLineItemRecord.setFieldValue('custrecord_tge_temp_levy', tgeTempLevy);
        nlapiSubmitRecord(apLineItemRecord);
      }


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

      /**
       * Create Line Items associated to the product order.
       */
      var ap_stock_line_item = nlapiCreateRecord(
        'customrecord_ap_stock_line_item');
      ap_stock_line_item.setFieldValue('custrecord_ap_product_order',
        product_order_id);

      var barcode_beg = barcode.slice(0, 4);


      /**
       * Creating line items for the product order based on the Barcode type and the item rate selected on the customer record.
       */

      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_item', product_name);

      // var inv_details = new_date + '-' + barcode;
      // if (inv_details.length > 33) {
      //   inv_details = new_date + '-' + connote_number;
      // }
      if (!isNullorEmpty(connote_number)) {
        var inv_details = new_date + '-' + connote_number;
      } else {
        var inv_details = new_date + '-' + barcode;
      }
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_line_item_inv_details', inv_details);
      ap_stock_line_item.setFieldValue(
        'custrecord_ap_stock_line_actual_qty', 1);

      if (currentBarcodeRASTier1 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 1');
      } else if (currentBarcodeRASTier2 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 2');
      } else if (currentBarcodeRASTier3 == true) {
        ap_stock_line_item.setFieldValue(
          'custrecord_ap_bill_item_description', 'Tier 3');
      }


      if ((barcode_source == 1 || isNullorEmpty(barcode_source)) && manualFeeToBeCharged != 2) {
        manualBarcodesCount++;
      }

      if (manual_surcharge == 1 || mpex_fuel_surcharge == 1) {
        if (barcode_source == 1 && digital_label == 0) {
          manual_surcharge_to_be_applied = true;
        } else {
          manual_surcharge_to_be_applied = false;
          digital_label++;
        }
      }

      var apLineItemRecordID = nlapiSubmitRecord(ap_stock_line_item);

      //Update the TGE Temp Levy field in the AP Line Item record
      if (tgeReceiverTempLevyApplicable == true || tgeSenderTempLevyApplicable == true) {
        var apLineItemRecord = nlapiLoadRecord(
          'customrecord_ap_stock_line_item', apLineItemRecordID);
        var expectedRevenue = apLineItemRecord.getFieldValue(
          'custrecord_ap_line_item_exp_revenue');
        //Calculate the 25% TGE Temp Levy
        var tgeTempLevy = (expectedRevenue * 0.25).toFixed(2);
        apLineItemRecord.setFieldValue('custrecord_tge_temp_levy', tgeTempLevy);
        nlapiSubmitRecord(apLineItemRecord);
      }

      /**
       * Update the Customer Product Stock record with the Product Order ID
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

        // rasTeir1Count = 0;
        // rasTeir2Count = 0;
        // rasTeir3Count = 0;

        // manualBarcodesCount = 0;

        var params = {
          custscript_prev_deploy_create_prod_order: ctx.getDeploymentId(),
        }

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy,
          params);

        if (reschedule == false) {

          return false;
        }
      }
    }


    old_customer_id = cust_prod_customer;
    old_product_order_id = product_order_id
    count++;

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
