/*
 * Module Description
 * NSVersion    Date            		Author
 * 1.00         2019-06-19 11:06:18 		ankith.ravindran
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-06-09T15:50:30+10:00
 *
 * @Description:
 *
 */
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function getLatestFiles() {

  if (!isNullorEmpty(ctx.getSetting('SCRIPT',
    'custscript_prev_deploy_scan_json'))) {
    prev_inv_deploy = ctx.getSetting('SCRIPT',
      'custscript_prev_deploy_scan_json');
  } else {
    prev_inv_deploy = ctx.getDeploymentId();
  }

  var todayDate = new Date();
  var yesterdayDate = new Date(todayDate);

  yesterdayDate.setDate(yesterdayDate.getDate() - 1)


  // To get todays date
  var today = nlapiDateToString(new Date(), 'dd-mm-yyyy');
  var yesterday = nlapiDateToString(yesterdayDate, 'dd-mm-yyyy');
  //var today = '2/8/2022';
  //
  nlapiLogExecution('DEBUG', 'yesterday', yesterday);

  var scanJSONSearch = nlapiLoadSearch('customrecord_scan_json',
    'customsearch_scan_json');
  var newFilterExpression = [
    ["name", "startswith", today], 'AND', ["isinactive", "is", "F"], 'AND', [
      "custrecord_scan_josn_sync", 'is', 2
    ]
  ];

  scanJSONSearch.setFilterExpression(newFilterExpression);
  var resultScanJSONSearch = scanJSONSearch.runSearch();

  var scan_json_record_id;

  resultScanJSONSearch.forEachResult(function (searchResultScanJSON) {
    scan_json_record_id = searchResultScanJSON.getValue('internalid');
    scan_json_record_name = searchResultScanJSON.getValue('name');
    nlapiLogExecution('DEBUG', 'scan_json_record_id', scan_json_record_id);
    nlapiLogExecution('DEBUG', 'scan_json_record_name',
      scan_json_record_name);

    var scan_json_record = nlapiLoadRecord('customrecord_scan_json',
      scan_json_record_id);

    var body = scan_json_record.getFieldValue('custrecord_json');
    var body_2 = scan_json_record.getFieldValue('custrecord_scan_json_2');

    nlapiLogExecution('DEBUG', 'body', body);
    nlapiLogExecution('DEBUG', 'body_2', body_2);

    if (isNullorEmpty(body_2)) {
      var todays_scans = JSON.parse(body);
      var barcodes = todays_scans.scans; // No. of barcodes
    } else {
      var todays_scans = JSON.parse(body_2);
      var barcodes = todays_scans.scans; // No. of barcodes
    }
    nlapiLogExecution('DEBUG', 'beginning barcodes length', barcodes.length);
    nlapiLogExecution('DEBUG', 'beginning barcodes ', JSON.stringify(
      barcodes));

    if (barcodes.length > 0) {
      // //Loop through each of the barcodes
      do {
        var x = barcodes.length - 1;
        var usage_loopstart_cust = ctx.getRemainingUsage();


        var scans = barcodes[x].scans;
        var weight = barcodes[x].weight;
        var height = barcodes[x].height;
        var length = barcodes[x].length;
        var width = barcodes[x].width;

        var order_number = barcodes[x].order_number;
        var order_date = barcodes[x].order_date;
        var delivery_speed = barcodes[x].delivery_speed;
        var depot_id = barcodes[x].depot_id;
        var order_total_price = barcodes[x].order_total_price;
        var item_price = barcodes[x].item_price;

        nlapiLogExecution('DEBUG', 'scans length', scans.length);
        nlapiLogExecution('DEBUG', 'scans', scans);
        nlapiLogExecution('DEBUG', 'scans stringify', JSON.stringify(scans));


        for (var y = 0; y < scans.length; y++) {
          nlapiLogExecution('DEBUG', 'scans inside loop', scans[y]);
          var barcode = scans[y].barcode;
          var barcode_length = 0;
          nlapiLogExecution('DEBUG', 'barcode', barcode);
          var connote_number = scans[y].connote_number;
          var product_type = scans[y].product_type;
          var customer_id = scans[y].customer_ns_id;
          var zee_id = scans[y].zee_ns_id;
          var rta_id = scans[y].id;
          var invoiceable = scans[y].invoiceable;
          var scan_type = scans[y].scan_type.toLowerCase();
          var operator_id = scans[y].operator_ns_id;
          if (operator_id == 909) {
            operator_id = 212;
          } else if (operator_id == 122) {
            operator_id = 907;
          }
          if (operator_id == 487 || operator_id == 172 || operator_id ==
            1171 || operator_id == 927) {
            operator_id = 884;
          }
          if (operator_id == 611) {
            operator_id = 503;
          }
          if (operator_id == 684) {
            operator_id = 528;
          }
          if (operator_id == 417) {
            operator_id = 789;
          }
          if (operator_id == 1094 || operator_id == 1116 || operator_id == 885 || operator_id == 224 || operator_id == 905 || operator_id == 926 || operator_id == 922 || operator_id == 23) {
            operator_id = 20;
          } if (operator_id == 895) {
            operator_id = 1123;
          }
          var updated_at = scans[y].updated_at;
          var deleted = scans[y].deleted;
          var external_barcode = scans[y].external_barcode;
          var source = scans[y].source;
          var receiver_suburb = scans[y].receiver_suburb;
          var receiver_postcode = scans[y].post_code;
          var receiver_state = scans[y].state;
          var receiver_addr1 = scans[y].address1;
          var receiver_addr2 = scans[y].address2;
          var receiver_name = scans[y].receiver_name;
          var receiver_email = scans[y].email;
          var receiver_phone = scans[y].phone;
          var account = scans[y].account;
          var futile_reasons = scans[y].futile_reason;
          var futile_images = scans[y].futile_photos;
          var reference_id = scans[y].reference_id;
          var job_id = scans[y].job_id;
          var sender_suburb = scans[y].sender_suburb;
          var sender_name = scans[y].sender_name;
          var sender_email = scans[y].sender_email;
          var sender_post_code = scans[y].sender_post_code;
          var sender_state = scans[y].sender_state;
          var sender_address1 = scans[y].sender_address1;
          var sender_address2 = scans[y].sender_address2;
          var sender_phone = scans[y].sender_phone;

          var delivery_speed = scans[y].delivery_speed;
          var order_number = scans[y].order_number;
          var order_date = scans[y].order_date;

          if (isNullorEmpty(scans[y].order_total_price)) {
            var order_total_price = null;
          } else {
            var order_total_price = scans[y].order_total_price.price;
            order_total_price = order_total_price / 100;
          }

          if (isNullorEmpty(scans[y].item_price)) {
            var item_price = null;
          } else {
            var item_price = scans[y].item_price.price;
            item_price = item_price / 100;
          }

          var courier = scans[y].courier;
          var depot_id = scans[y].depot_id;

          updated_at = updated_at.split("T");
          var time_updated_at = updated_at[1];
          time_updated_at = time_updated_at.split(".");
          time_updated_at = onTimeChange(time_updated_at[0]);
          var updated_at = updated_at[0];

          if (!isNullorEmpty(barcode)) {
            barcode = barcode.toUpperCase();
            barcode_length = barcode.length;

            if (barcode_length == 12) {
              connote_number = barcode;
              account = 'global_express'
            }

            var barcode_beg = barcode.slice(0, 4);
          } else {
            var barcode_beg = product_type;
          }

          updated_at = updated_at.split("-");
          if (!isNullorEmpty(order_date)) {
            order_date = order_date.split("-");
            order_date = nlapiStringToDate(order_date[2] + '/' + order_date[1] +
              '/' + order_date[0]);
          }


          updated_at = nlapiStringToDate(updated_at[2] + '/' + updated_at[1] +
            '/' + updated_at[0]);



          var productStockSearch = nlapiLoadSearch(
            'customrecord_customer_product_stock',
            'customsearch_rta_product_stock');

          var temp_expression = 'AND';
          var newFilterExpression = [
            ["name", "is", barcode], 'AND', ["isinactive", "is", "F"]
          ];

          nlapiLogExecution('AUDIT', 'newFilterExpression',
            newFilterExpression);

          productStockSearch.setFilterExpression(newFilterExpression);

          var resultSetProductStock = productStockSearch.runSearch();

          var count = 0;
          var prod_id;

          var save_barcode = true;

          resultSetProductStock.forEachResult(function (searchResult) {
            nlapiLogExecution('DEBUG', 'Barcode  exist', barcode)
            var customer_prod_stock_id = searchResult.getValue(
              'internalid');

            var customer_prod_stock = nlapiLoadRecord(
              'customrecord_customer_product_stock',
              customer_prod_stock_id);

            var stock_status = customer_prod_stock.getFieldValue(
              'custrecord_cust_prod_stock_status');
            customer_prod_stock.setFieldValue('custrecord_height',
              height);
            customer_prod_stock.setFieldValue('custrecord_weight',
              weight);
            customer_prod_stock.setFieldValue('custrecord_length',
              length);
            customer_prod_stock.setFieldValue('custrecord_width',
              width);

            nlapiLogExecution('DEBUG', 'scan_type', scan_type)

            if (stock_status != 6 && stock_status != 7) {
              if (!isNullorEmpty(deleted)) {

                if (account == 'sendle' && product_type == null) {

                  if (stock_status == 2) { //Existing Status is Pickup

                  } else if (stock_status == 4 || stock_status == 5) { //Existing Status is Lodged or Delivered

                  }


                } else {
                  // Status is Allocated to customer
                  if (stock_status == 1) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 8);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_zee', zee_id);

                  } else if (stock_status == 8) { // Status is Zee
                    // Stock
                    customer_prod_stock.setFieldValue('isinactive', 'T');
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_deleted', time_updated_at
                    );

                  } else if (stock_status == 4 || stock_status == 5) { // Status
                    // is
                    // Delivered
                    // to
                    // receiver
                    // /
                    // Lodged
                    // at
                    // TOLL

                    // Change status to Allocated to customer
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 1);
                  }
                }

              } else if (scan_type == 'futile') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 11);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_time', time_updated_at
                  );
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              } else if (scan_type == 'stockzee') {
                if (!isNullorEmpty(zee_id)) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 8);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer', null);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_time',
                    time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Zee ID', null);
                  save_barcode = false;
                }

              } else if (scan_type == 'allocate') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 1);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_time',
                    time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }

              } else if (scan_type == 'pickup') {
                if (!isNullorEmpty(customer_id)) {
                  var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                    'customsearch_prod_pricing_customer_lev_3');

                  if (delivery_speed == 'Express') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 2], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  } else if (delivery_speed == 'Standard') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  }

                  searchProductPricing.setFilterExpression(newFilterExpression);
                  var resultSetProductPricing = searchProductPricing.runSearch();

                  var firstResult = resultSetProductPricing.getResults(0, 1);

                  if (firstResult.length > 0) {
                    var prodPricingInternalID = firstResult[0].getValue('internalid');

                    var prodItemText = null;

                    if ((product_type == '25Kg' ||
                      product_type == '10Kg' ||
                      product_type == '5Kg' ||
                      product_type == '3Kg' ||
                      product_type == '1Kg' ||
                      product_type == '500g' ||
                      product_type == '250g' ||
                      product_type == 'B4') && account == 'sendle') {

                      product_type_lowercase = product_type.toLowerCase();

                      var itemText = 'custrecord_prod_pricing_';

                      itemText = itemText + product_type_lowercase;

                      prodItemText = firstResult[0].getText(itemText)

                    }
                    if (!isNullorEmpty(prodItemText)) {
                      var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                        'customsearch6413');

                      var newFilterExpressionAPItem = [
                        ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                      ];


                      searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                      var resultSetAPItem = searchAPItems.runSearch();

                      var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                      if (firstResultAPItem.length > 0) {
                        var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                    }

                    customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                  }
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 2);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_time', time_updated_at
                  );
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              } else if (scan_type == "delivery") {
                if (!isNullorEmpty(customer_id)) {
                  var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                    'customsearch_prod_pricing_customer_lev_3');

                  if (delivery_speed == 'Express') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  } else if (delivery_speed == 'Standard') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  }



                  searchProductPricing.setFilterExpression(newFilterExpression);
                  var resultSetProductPricing = searchProductPricing.runSearch();

                  var firstResult = resultSetProductPricing.getResults(0, 1);

                  if (firstResult.length > 0) {
                    var prodPricingInternalID = firstResult[0].getValue('internalid');

                    var prodItemText = null;

                    if ((product_type == '25Kg' ||
                      product_type == '10Kg' ||
                      product_type == '5Kg' ||
                      product_type == '3Kg' ||
                      product_type == '1Kg' ||
                      product_type == '500g' ||
                      product_type == '250g' ||
                      product_type == 'B4') && account == 'sendle') {

                      product_type_lowercase = product_type.toLowerCase();

                      var itemText = 'custrecord_prod_pricing_';

                      itemText = itemText + product_type_lowercase;

                      prodItemText = firstResult[0].getText(itemText)

                    }
                    if (!isNullorEmpty(prodItemText)) {
                      var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                        'customsearch6413');

                      var newFilterExpressionAPItem = [
                        ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                      ];


                      searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                      var resultSetAPItem = searchAPItems.runSearch();

                      var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                      if (firstResultAPItem.length > 0) {
                        var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                    }

                    customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                  }
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 4);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_final_del', 4);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_delivery_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_delivery_time',
                    time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              } else if (scan_type == "lodgement") {
                if (!isNullorEmpty(customer_id)) {
                  var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                    'customsearch_prod_pricing_customer_lev_3');

                  if (delivery_speed == 'Express') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 2], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  } else if (delivery_speed == 'Standard') {
                    var newFilterExpression = [
                      ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                    ];
                  }


                  searchProductPricing.setFilterExpression(newFilterExpression);
                  var resultSetProductPricing = searchProductPricing.runSearch();

                  var firstResult = resultSetProductPricing.getResults(0, 1);

                  if (firstResult.length > 0) {
                    var prodPricingInternalID = firstResult[0].getValue('internalid');

                    var prodItemText = null;

                    if ((product_type == '25Kg' ||
                      product_type == '10Kg' ||
                      product_type == '5Kg' ||
                      product_type == '3Kg' ||
                      product_type == '1Kg' ||
                      product_type == '500g' ||
                      product_type == '250g' ||
                      product_type == 'B4') && account == 'sendle') {

                      product_type_lowercase = product_type.toLowerCase();

                      var itemText = 'custrecord_prod_pricing_';

                      itemText = itemText + product_type_lowercase;

                      prodItemText = firstResult[0].getText(itemText)

                    }
                    if (!isNullorEmpty(prodItemText)) {
                      var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                        'customsearch6413');

                      var newFilterExpressionAPItem = [
                        ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                      ];


                      searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                      var resultSetAPItem = searchAPItems.runSearch();

                      var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                      if (firstResultAPItem.length > 0) {
                        var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                    }

                    customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                  }
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 5);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_final_del', 5);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_lodge_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_lodge_time', time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              }

              if (save_barcode == true) {
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_source', 6);
                customer_prod_stock.setFieldValue(
                  'custrecord_connote_number', connote_number);
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_operator', operator_id);
                if (invoiceable === false || invoiceable == 'false' ||
                  invoiceable === 'false' || invoiceable == false) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_invoiceable', 2);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_prepaid', 1);
                }

                var sourceId = getSourceID(source);


                customer_prod_stock.setFieldValue(
                  'custrecord_mpdl_number', external_barcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_barcode_source', sourceId);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_suburb', receiver_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_postcode', receiver_postcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_state', receiver_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr1', receiver_addr1);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr2', receiver_addr2);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_name', receiver_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_email', receiver_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_phone', receiver_phone);

                customer_prod_stock.setFieldValue(
                  'custrecord_sender_suburb', sender_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_name', sender_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_email', sender_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_post_code', sender_post_code);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_state', sender_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_1', sender_address1);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_2', sender_address2);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_phone', sender_phone);

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
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);
                } else if ((product_type == '25Kg' ||
                  product_type == '10Kg' ||
                  product_type == '5Kg' ||
                  product_type == '3Kg' ||
                  product_type == '1Kg' ||
                  product_type == '500g' ||
                  product_type == '250g' ||
                  product_type == 'B4') && delivery_speed == 'Express') {

                  if (product_type == '1Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 552;
                    }

                  } else if (product_type == '3Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 553;
                    }

                  } else if (product_type == '5Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 554;
                    }

                  } else if (product_type == 'B4') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 550;
                    }

                  } else if (product_type == '500g') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 638;
                    }

                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);

                }

                if (account == 'sendle') {
                  if (product_type == null) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_stock_prod_name', 862);
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 2);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);
                  } else {
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_item_price', item_price);
                    customer_prod_stock.setFieldValue('custrecord_order_number', order_number);
                    customer_prod_stock.setFieldValue('custrecord_order_total_price', order_total_price);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 1);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);

                  }
                } else if (account == 'global_express' && product_type ==
                  null) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', 863);
                  customer_prod_stock.setFieldValue(
                    'custrecord_integration', 2);
                  if (!isNullorEmpty(futile_reasons)) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_reasons', futile_reasons);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_futile_image', futile_images);
                  customer_prod_stock.setFieldValue(
                    'custrecord_ext_reference_id', reference_id);
                  customer_prod_stock.setFieldValue('custrecord_job_id',
                    job_id);
                }


                customer_prod_stock_id = nlapiSubmitRecord(
                  customer_prod_stock);



                nlapiLogExecution('DEBUG',
                  'Customer Product Stock Update',
                  customer_prod_stock_id)
              }


            } else if (stock_status == 6 && account == 'sendle') {
              if (!isNullorEmpty(deleted)) {

                if (account == 'sendle' && product_type == null) {

                  if (stock_status == 2) { //Existing Status is Pickup

                  } else if (stock_status == 4 || stock_status == 5) { //Existing Status is Lodged or Delivered

                  }


                } else {
                  // Status is Allocated to customer
                  if (stock_status == 1) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used', null);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 8);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_zee', zee_id);

                  } else if (stock_status == 8) { // Status is Zee
                    // Stock
                    customer_prod_stock.setFieldValue('isinactive', 'T');
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_deleted', time_updated_at
                    );

                  } else if (stock_status == 4 || stock_status == 5) { // Status
                    // is
                    // Delivered
                    // to
                    // receiver
                    // /
                    // Lodged
                    // at
                    // TOLL

                    // Change status to Allocated to customer
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 1);
                  }
                }

              } else if (scan_type == 'futile') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 11);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_time', time_updated_at
                  );
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              } else if (scan_type == 'stockzee') {
                if (!isNullorEmpty(zee_id)) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 8);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer', null);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_time',
                    time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Zee ID', null);
                  save_barcode = false;
                }

              } else if (scan_type == 'allocate') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer',
                    customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 1);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given',
                    time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_time',
                    time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }

              } else
                if (scan_type == 'pickup') {
                  if (!isNullorEmpty(customer_id)) {
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_pickup_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_pickup_time', time_updated_at
                    );
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                } else if (scan_type == "delivery") {
                  if (!isNullorEmpty(customer_id)) {
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 4);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_final_del', 4);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_delivery_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_delivery_time',
                      time_updated_at);
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                } else if (scan_type == "lodgement") {
                  if (!isNullorEmpty(customer_id)) {
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 5);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_final_del', 5);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_lodge_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_lodge_time', time_updated_at);
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                }

              if (save_barcode == true) {
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_source', 6);
                customer_prod_stock.setFieldValue(
                  'custrecord_connote_number', connote_number);
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_operator', operator_id);
                if (invoiceable === false || invoiceable == 'false' ||
                  invoiceable === 'false' || invoiceable == false) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_invoiceable', 2);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_prepaid', 1);
                }

                var sourceId = getSourceID(source);


                customer_prod_stock.setFieldValue(
                  'custrecord_mpdl_number', external_barcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_barcode_source', sourceId);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_suburb', receiver_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_postcode', receiver_postcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_state', receiver_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr1', receiver_addr1);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr2', receiver_addr2);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_name', receiver_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_email', receiver_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_phone', receiver_phone);

                customer_prod_stock.setFieldValue(
                  'custrecord_sender_suburb', sender_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_name', sender_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_email', sender_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_post_code', sender_post_code);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_state', sender_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_1', sender_address1);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_2', sender_address2);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_phone', sender_phone);

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
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);
                } else if ((product_type == '25Kg' || product_type == '10Kg' ||
                  product_type == '5Kg' ||
                  product_type == '3Kg' ||
                  product_type == '1Kg' ||
                  product_type == '500g' || product_type == '250g' ||
                  product_type == 'B4') && delivery_speed == 'Express') {

                  if (product_type == '1Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 552;
                    }

                  } else if (product_type == '3Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 553;
                    }

                  } else if (product_type == '5Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 554;
                    }

                  } else if (product_type == 'B4') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 550;
                    }

                  } else if (product_type == '500g') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 638;
                    }

                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);

                }

                if (account == 'sendle') {
                  if (product_type == null) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_stock_prod_name', 862);
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 2);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);
                  } else {
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_item_price', item_price);
                    customer_prod_stock.setFieldValue('custrecord_order_number', order_number);
                    customer_prod_stock.setFieldValue('custrecord_order_total_price', order_total_price);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 1);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);

                  }

                } else if (account == 'global_express' && product_type ==
                  null) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', 863);
                  customer_prod_stock.setFieldValue(
                    'custrecord_integration', 2);
                  if (!isNullorEmpty(futile_reasons)) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_reasons', futile_reasons);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_futile_image', futile_images);
                  customer_prod_stock.setFieldValue(
                    'custrecord_ext_reference_id', reference_id);
                  customer_prod_stock.setFieldValue('custrecord_job_id',
                    job_id);
                }


                customer_prod_stock_id = nlapiSubmitRecord(
                  customer_prod_stock);



                nlapiLogExecution('DEBUG',
                  'Customer Product Stock Update',
                  customer_prod_stock_id)
              }
            }
            count++;
            return true;
          });

          nlapiLogExecution('AUDIT', 'count', count);

          if (count == 0) {
            nlapiLogExecution('DEBUG', 'Barcode doesnt exist', barcode)
            var save_barcode = true;
            if (isNullorEmpty(deleted)) {
              var customer_prod_stock = nlapiCreateRecord(
                'customrecord_customer_product_stock');
              customer_prod_stock.setFieldValue('custrecord_height',
                height);
              customer_prod_stock.setFieldValue('custrecord_weight',
                weight);
              customer_prod_stock.setFieldValue('custrecord_length',
                length);
              customer_prod_stock.setFieldValue('custrecord_width',
                width);
              customer_prod_stock.setFieldValue(
                'custrecord_cust_date_stock_given', updated_at);
              customer_prod_stock.setFieldValue(
                'custrecord_cust_time_stock_given', time_updated_at);
              customer_prod_stock.setFieldValue('custrecord_connote_number',
                connote_number);
              if (invoiceable === false || invoiceable == 'false' ||
                invoiceable === 'false' || invoiceable == false) {
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_invoiceable', 2);
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_prepaid', 1);
              }

              customer_prod_stock.setFieldValue('name', barcode);

              nlapiLogExecution('DEBUG', 'scan_type', scan_type)

              if (scan_type == 'futile') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer', customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 11);

                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given', time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_used', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_used', time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_pickup_time', time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }
              } else if (scan_type == 'stockzee') {
                if (!isNullorEmpty(zee_id)) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 8);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given', time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer', null);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_zee', zee_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_zee_stock_time', time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Zee ID', null);
                  save_barcode = false;
                }

              } else if (scan_type == 'allocate') {
                if (!isNullorEmpty(customer_id)) {
                  if (invoiceable === false || invoiceable == 'false' ||
                    invoiceable === 'false' || invoiceable == false) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_invoiceable', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_prepaid', 1);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_customer', customer_id);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_status', 1);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_date_stock_given', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_time_stock_given', time_updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_date', updated_at);
                  customer_prod_stock.setFieldValue(
                    'custrecord_history_allocate_time', time_updated_at);
                } else {
                  nlapiSendEmail(409635, [
                    'ankith.ravindran@mailplus.com.au'
                  ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                  ' has empty Customer ID', null);
                  save_barcode = false;
                }

              } else
                if (scan_type == 'pickup') {
                  if (!isNullorEmpty(customer_id)) {
                    var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                      'customsearch_prod_pricing_customer_lev_3');

                    if (delivery_speed == 'Express') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 2], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    } else if (delivery_speed == 'Standard') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    }

                    searchProductPricing.setFilterExpression(newFilterExpression);
                    var resultSetProductPricing = searchProductPricing.runSearch();

                    var firstResult = resultSetProductPricing.getResults(0, 1);

                    if (firstResult.length > 0) {
                      var prodPricingInternalID = firstResult[0].getValue('internalid');

                      var prodItemText = null;

                      if ((product_type == '25Kg' ||
                        product_type == '10Kg' ||
                        product_type == '5Kg' ||
                        product_type == '3Kg' ||
                        product_type == '1Kg' ||
                        product_type == '500g' ||
                        product_type == '250g' ||
                        product_type == 'B4') && account == 'sendle') {

                        product_type_lowercase = product_type.toLowerCase();

                        var itemText = 'custrecord_prod_pricing_';

                        itemText = itemText + product_type_lowercase;

                        prodItemText = firstResult[0].getText(itemText);

                      }
                      nlapiLogExecution('DEBUG', 'prodItemText', prodItemText);

                      if (!isNullorEmpty(prodItemText)) {
                        var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                          'customsearch6413');

                        var newFilterExpressionAPItem = [
                          ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                        ];


                        searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                        var resultSetAPItem = searchAPItems.runSearch();

                        var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                        if (firstResultAPItem.length > 0) {
                          var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                          nlapiLogExecution('DEBUG', 'apItemInternalID', apItemInternalID);
                        }

                        customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                    }
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 2);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_pickup_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_pickup_time', time_updated_at
                    );
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                } else if (scan_type == "delivery") {
                  if (!isNullorEmpty(customer_id)) {
                    var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                      'customsearch_prod_pricing_customer_lev_3');

                    if (delivery_speed == 'Express') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    } else if (delivery_speed == 'Standard') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    }



                    searchProductPricing.setFilterExpression(newFilterExpression);
                    var resultSetProductPricing = searchProductPricing.runSearch();

                    var firstResult = resultSetProductPricing.getResults(0, 1);

                    if (firstResult.length > 0) {
                      var prodPricingInternalID = firstResult[0].getValue('internalid');

                      var prodItemText = null;

                      if ((product_type == '25Kg' ||
                        product_type == '10Kg' ||
                        product_type == '5Kg' ||
                        product_type == '3Kg' ||
                        product_type == '1Kg' ||
                        product_type == '500g' ||
                        product_type == '250g' ||
                        product_type == 'B4') && account == 'sendle') {

                        product_type_lowercase = product_type.toLowerCase();

                        var itemText = 'custrecord_prod_pricing_';

                        itemText = itemText + product_type_lowercase;

                        prodItemText = firstResult[0].getText(itemText)

                      }
                      nlapiLogExecution('DEBUG', 'prodItemText', prodItemText)
                      if (!isNullorEmpty(prodItemText)) {
                        var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                          'customsearch6413');

                        var newFilterExpressionAPItem = [
                          ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                        ];


                        searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                        var resultSetAPItem = searchAPItems.runSearch();

                        var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                        if (firstResultAPItem.length > 0) {
                          var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                        }

                        customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                    }
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 4);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_final_del', 4);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_delivery_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_delivery_time',
                      time_updated_at);
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                } else if (scan_type == "lodgement") {
                  if (!isNullorEmpty(customer_id)) {
                    var searchProductPricing = nlapiLoadSearch('customrecord_product_pricing',
                      'customsearch_prod_pricing_customer_lev_3');

                    if (delivery_speed == 'Express') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 2], 'AND', ["custrecord_prod_pricing_carrier_last_mil", "anyof", 2], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    } else if (delivery_speed == 'Standard') {
                      var newFilterExpression = [
                        ["custrecord_prod_pricing_customer", "anyof", customer_id], 'AND', ["custrecord_prod_pricing_delivery_speeds", "anyof", 1], 'AND', ["custrecord_prod_pricing_status", "anyof", 2]
                      ];
                    }


                    searchProductPricing.setFilterExpression(newFilterExpression);
                    var resultSetProductPricing = searchProductPricing.runSearch();

                    var firstResult = resultSetProductPricing.getResults(0, 1);

                    if (firstResult.length > 0) {
                      var prodPricingInternalID = firstResult[0].getValue('internalid');

                      var prodItemText = null;

                      if ((product_type == '25Kg' ||
                        product_type == '10Kg' ||
                        product_type == '5Kg' ||
                        product_type == '3Kg' ||
                        product_type == '1Kg' ||
                        product_type == '500g' ||
                        product_type == '250g' ||
                        product_type == 'B4') && account == 'sendle') {

                        product_type_lowercase = product_type.toLowerCase();

                        var itemText = 'custrecord_prod_pricing_';

                        itemText = itemText + product_type_lowercase;

                        prodItemText = firstResult[0].getText(itemText)

                      }
                      nlapiLogExecution('DEBUG', 'prodItemText', prodItemText)
                      if (!isNullorEmpty(prodItemText)) {
                        var searchAPItems = nlapiLoadSearch('customrecord_ap_item',
                          'customsearch6413');

                        var newFilterExpressionAPItem = [
                          ["custrecord_ap_item_default.custitem_price_plans", "anyof", "13", "14"], 'AND', ["name", "is", prodItemText]
                        ];


                        searchAPItems.setFilterExpression(newFilterExpressionAPItem);
                        var resultSetAPItem = searchAPItems.runSearch();

                        var firstResultAPItem = resultSetAPItem.getResults(0, 1);
                        if (firstResultAPItem.length > 0) {
                          var apItemInternalID = firstResultAPItem[0].getValue('internalid');
                        }

                        customer_prod_stock.setFieldValue('custrecord_cust_stock_prod_name', apItemInternalID);
                      }

                      customer_prod_stock.setFieldValue('custrecord_cust_prod_pricing', prodPricingInternalID);
                    }
                    if (invoiceable === false || invoiceable == 'false' ||
                      invoiceable === 'false' || invoiceable == false) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_invoiceable', 2);
                      customer_prod_stock.setFieldValue(
                        'custrecord_cust_prod_stock_prepaid', 1);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_status', 5);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_customer',
                      customer_id);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_prod_stock_final_del', 5);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_date_stock_used', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_time_stock_used',
                      time_updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_lodge_date', updated_at);
                    customer_prod_stock.setFieldValue(
                      'custrecord_history_lodge_time', time_updated_at);
                  } else {
                    nlapiSendEmail(409635, [
                      'ankith.ravindran@mailplus.com.au'
                    ], 'MPEX Scan Sync', 'Barcode: ' + barcode +
                    ' has empty Customer ID', null);
                    save_barcode = false;
                  }
                }

              if (save_barcode == true) {
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_source', 6);
                customer_prod_stock.setFieldValue(
                  'custrecord_connote_number', connote_number);
                customer_prod_stock.setFieldValue(
                  'custrecord_cust_prod_stock_operator', operator_id);
                if (invoiceable === false || invoiceable == 'false' ||
                  invoiceable === 'false' || invoiceable == false) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_invoiceable', 2);
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_prod_stock_prepaid', 1);
                }

                var sourceId = getSourceID(source);


                customer_prod_stock.setFieldValue(
                  'custrecord_mpdl_number', external_barcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_barcode_source', sourceId);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_suburb', receiver_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_postcode', receiver_postcode);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_state', receiver_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr1', receiver_addr1);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_addr2', receiver_addr2);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_name', receiver_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_email', receiver_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_receiver_phone', receiver_phone);

                customer_prod_stock.setFieldValue(
                  'custrecord_sender_suburb', sender_suburb);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_name', sender_name);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_email', sender_email);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_post_code', sender_post_code);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_state', sender_state);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_1', sender_address1);
                customer_prod_stock.setFieldValue(
                  'custrecord_sender_address_2', sender_address2);
                customer_prod_stock.setFieldValue(
                  'custrecord_senders_phone', sender_phone);

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
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);
                } else if ((product_type == '25Kg' || product_type == '10Kg' ||
                  product_type == '5Kg' ||
                  product_type == '3Kg' ||
                  product_type == '1Kg' ||
                  product_type == '500g' || product_type == '250g' ||
                  product_type == 'B4') && delivery_speed == 'Express') {

                  if (product_type == '1Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 552;
                    }

                  } else if (product_type == '3Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 553;
                    }

                  } else if (product_type == '5Kg') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 554;
                    }

                  } else if (product_type == 'B4') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 550;
                    }

                  } else if (product_type == '500g') {
                    if (delivery_speed == 'Standard') {

                    } else if (delivery_speed == "Express") {
                      prod_id = 638;
                    }

                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', prod_id);

                }

                if (account == 'sendle') {
                  if (product_type == null) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_cust_stock_prod_name', 862);
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 2);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);
                  } else {
                    customer_prod_stock.setFieldValue(
                      'custrecord_integration', 1);
                    if (!isNullorEmpty(futile_reasons)) {
                      customer_prod_stock.setFieldValue(
                        'custrecord_futile_reasons', futile_reasons);
                    }
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_image', futile_images);
                    customer_prod_stock.setFieldValue(
                      'custrecord_ext_reference_id', reference_id);
                    customer_prod_stock.setFieldValue('custrecord_job_id',
                      job_id);
                    customer_prod_stock.setFieldValue('custrecord_order_date', order_date);
                    customer_prod_stock.setFieldValue('custrecord_item_price', item_price);
                    customer_prod_stock.setFieldValue('custrecord_order_number', order_number);
                    customer_prod_stock.setFieldValue('custrecord_order_total_price', order_total_price);
                    customer_prod_stock.setFieldValue('custrecord_delivery_speed', 1);
                    customer_prod_stock.setFieldValue('custrecord_lodgement_location', depot_id);
                    customer_prod_stock.setFieldValue('custrecord_carrier_label', courier);

                  }
                } else if (account == 'global_express' && product_type ==
                  null) {
                  customer_prod_stock.setFieldValue(
                    'custrecord_cust_stock_prod_name', 863);
                  customer_prod_stock.setFieldValue(
                    'custrecord_integration', 2);
                  if (!isNullorEmpty(futile_reasons)) {
                    customer_prod_stock.setFieldValue(
                      'custrecord_futile_reasons', futile_reasons);
                  }
                  customer_prod_stock.setFieldValue(
                    'custrecord_futile_image', futile_images);
                  customer_prod_stock.setFieldValue(
                    'custrecord_ext_reference_id', reference_id);
                  customer_prod_stock.setFieldValue('custrecord_job_id',
                    job_id);
                }

                customer_prod_stock_id = nlapiSubmitRecord(
                  customer_prod_stock);

                nlapiLogExecution('DEBUG',
                  'Customer Product Stock Update',
                  customer_prod_stock_id)
              }
            }
          }


        }

        barcodes.splice(x, 1);
        var scan_json = '{ "scans": ' + JSON.stringify(barcodes) + '}';
        scan_json_record.setFieldValue('custrecord_json', scan_json);
        nlapiSubmitRecord(scan_json_record);

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy,
          null);
        nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
        if (reschedule == 'false') {

          return false;
        }

      }
      while (barcodes.length > 0);
    } else {
      scan_json_record.setFieldValue('custrecord_scan_josn_sync', 1);
      nlapiSubmitRecord(scan_json_record);
    }


    return true;
  });


  // //Get todays scans based on updated_at date

}

function getSourceID(source) {
  switch (source) {
    case 'shopify':
      return 2;
      break;
    case 'manual':
      return 1;
      break;
    case 'bulk':
      return 4;
      break;
    case 'portal':
      return 3;
      break;
    case 'threepl':
      return 5;
      break;
    default:
      return null;
      break;
  }
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
  // time = time.replace(hours, ('0' + hours));
  // }
  if (time.indexOf('PM') != -1 && hours < 12) {
    console.log(hours + 12)
    time = time.replace(hours_string, (hours + 12));
  }
  return time.replace(/( AM| PM)/, '');
}
