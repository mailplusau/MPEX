/*To do product calculation. AP Line Item ID and the Actual Quantity are the parameters passed into the function. 
The function returns the item price as well as the fracnchisee commission for that AP Line Item */
function productCalculations(lineItemId, ActQty) {

    //Variable to store the 4 different values of item price / franchisee commission / quantity ranges stored in NetSuite.
    // var item_rates = ['a', 'b', 'c', 'd', 'e', 'f'];
    var item_rates = ['a'];

    var total_rate_50packs = 0.0;
    var franchisee_com = 0.0;
    var temp_rate1 = 0.0;
    var temp_rate2 = 0.0;
    var temp_rate3 = 0.0;
    var temp_comm = 0.0;
    var gst = 0;
    var item_rate = 0.0;
    var item_price = 0.0;
    var text = 'custrecord_ap_qty_';

    var calculated_value = [];

    var fil_po = [];
    fil_po[fil_po.length] = new nlobjSearchFilter('internalid', null, 'is', lineItemId);


    var col_po = [];
    col_po[col_po.length] = new nlobjSearchColumn('internalid');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_pricing_algorithm');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_gst_applicable');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_qty_per_carton');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_price_a');
    // col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_price_b');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_franchise_comm_a');
    // col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_franchise_comm_b');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_a');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_b');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_c');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_d');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_e');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_qty_f');

    var poSearch = nlapiSearchRecord('customrecord_ap_item', null, fil_po, col_po);


    //Algorithm Type - Price List
    if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 1 || isNullorEmpty(poSearch[0].getValue('custrecord_ap_item_pricing_algorithm'))) {

        //Loop through all the 4 columns of qty / item prices / franchisee commission
        for (var x = 0; x < item_rates.length; x++) {

            var last_value = item_rates[x];
            var temp = text + item_rates[x];

            //Get the quantity from the record
            var y = poSearch[0].getValue(temp);

            //As long as the quantity is not empty or null
            if (!isNullorEmpty(y)) {

                //If the quantity stored in NetSuite is 1
                if (y == 1) {
                    var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
                    var val2 = 'custrecord_ap_price_' + item_rates[x];

                    var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

                    if (gst_applicable == 1) {
                        gst = 10;
                    } else {
                        gst = 0.0;
                    }

                    // franchisee_com = nlapiLookupField('customrecord_ap_item', lineItemId, val1);
                    franchisee_com = poSearch[0].getValue(val1);
                    // item_rate = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
                    item_rate = poSearch[0].getValue(val2);


                    franchisee_com = (parseFloat(franchisee_com) + (parseFloat(franchisee_com) * (gst / 100))) * parseInt(ActQty);

                    calculated_value[0] = item_rate;
                    calculated_value[1] = franchisee_com;

                    break;
                }

                //If the actual quantity is less than the quantity stored in NetSuite.
                if (parseInt(ActQty) < y) {

                    var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
                    var val2 = 'custrecord_ap_price_' + item_rates[x];

                    var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

                    if (gst_applicable == 1) {
                        gst = 10;
                    } else {
                        gst = 0.0;
                    }

                    // franchisee_com = nlapiLookupField('customrecord_ap_item', lineItemId, val1);
                    franchisee_com = poSearch[0].getValue(val1);
                    // item_rate = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
                    item_rate = poSearch[0].getValue(val2);


                    franchisee_com = (parseFloat(franchisee_com) + (parseFloat(franchisee_com) * (gst / 100))) * parseInt(ActQty);
                    calculated_value[0] = item_rate;
                    calculated_value[1] = franchisee_com;
                    break;
                }
            } else {

                var last_value = item_rates[(x - 1)];
                var temp = text + item_rates[(x - 1)];
                var y = poSearch[0].getValue(temp);

                var val1 = 'custrecord_ap_franchise_comm_' + item_rates[(x - 1)];
                var val2 = 'custrecord_ap_price_' + item_rates[(x - 1)];

                var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

                if (gst_applicable == 1) {
                    gst = 10;
                } else {
                    gst = 0.0;
                }

                // franchisee_com = nlapiLookupField('customrecord_ap_item', lineItemId, val1);
                franchisee_com = poSearch[0].getValue(val1);
                // item_rate = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
                item_rate = poSearch[0].getValue(val2);


                franchisee_com = (parseFloat(franchisee_com) + (parseFloat(franchisee_com) * (gst / 100))) * parseInt(ActQty);
                calculated_value[0] = item_rate;
                calculated_value[1] = franchisee_com;
                break;

            }
        }

    } //Algorithm Type - Remainder
    // else if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 2) {
    //     for (var x = 0; x < item_rates.length; x++) {
    //         var temp = text + item_rates[x];
    //         var y = poSearch[0].getValue(temp);
    //         if (y != '') {

    //             //if the actual quantity is less than the QTYA stored in NetSuite
    //             if (parseInt(ActQty) < y && x == 0) {

    //                 var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

    //                 if (gst_applicable == 1) {
    //                     gst = 10;
    //                 } else {
    //                     gst = 0.0;
    //                 }

    //                 var SODrem = parseInt(ActQty) % y;

    //                 if (SODrem != 0) {

    //                     var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //                     var val2 = 'custrecord_ap_price_' + item_rates[x];

    //                     var rate2 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                     var franch_comm2 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                     franch_comm2 = parseFloat(franch_comm2);


    //                     temp_comm = temp_comm + ((franch_comm2 + (franch_comm2 * (gst / 100))) * SODrem);
    //                     temp_rate2 = parseFloat(rate2);

    //                     total_rate_50packs = total_rate_50packs + (temp_rate2 * SODrem);

    //                 }

    //                 franchisee_com = temp_comm;
    //                 calculated_value[0] = total_rate_50packs;
    //                 calculated_value[1] = franchisee_com;
    //                 break;

    //             }
    //             //if actual quantity goes into the range of QTYB. 
    //             else if (x == 1) {

    //                 var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

    //                 if (gst_applicable == 1) {
    //                     gst = 10;
    //                 } else {
    //                     gst = 0.0;
    //                 }

    //                 var temp_comm1 = 0.0;
    //                 var temp_comm2 = 0.0;

    //                 //the quantity stored in NetSuite should always be one more than the actual value. Eg: SOD labels has one pack of 50 loables, then QTYB should have a value for 51. Hence (y-1) is done below. 

    //                 //get the number of pieces  
    //                 var SODrem = parseInt(ActQty) % (y - 1);

    //                 //get the number of packs.
    //                 var SOD_50pack = Math.floor(parseInt(ActQty) / (y - 1));

    //                 //get the price and fr4anchisee commission for the packs
    //                 if (SOD_50pack != 0) {
    //                     var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //                     var val2 = 'custrecord_ap_price_' + item_rates[x];

    //                     var rate1 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                     var franch_comm1 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                     franch_comm1 = parseFloat(franch_comm1);



    //                     temp_comm1 = temp_comm1 + ((franch_comm1 + (franch_comm1 * (gst / 100))) * SOD_50pack);
    //                     temp_rate1 = parseFloat(rate1);

    //                     total_rate_50packs = total_rate_50packs + (temp_rate1 * SOD_50pack);


    //                 }

    //                 //get the price and franchisee commission for individual pieces
    //                 if (SODrem != 0) {

    //                     var val1 = 'custrecord_ap_franchise_comm_' + item_rates[0];
    //                     var val2 = 'custrecord_ap_price_' + item_rates[0];

    //                     var rate2 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                     var franch_comm2 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                     franch_comm2 = parseFloat(franch_comm2);
    //                     temp_comm = temp_comm + ((franch_comm2 + (franch_comm2 * (gst / 100))) * SODrem);
    //                     temp_rate2 = parseFloat(rate2);

    //                     total_rate_50packs = total_rate_50packs + (temp_rate2 * SODrem);

    //                 }

    //                 franchisee_com = temp_comm1 + temp_comm2;
    //                 // total_rate_50packs = temp_rate1 + temp_rate2;
    //                 calculated_value[0] = total_rate_50packs;
    //                 calculated_value[1] = franchisee_com;
    //                 break;

    //             }
    //         }
    //     }
    // }
    // //Algorithm Type - List Remainder
    // else if (poSearch[0].getValue('custrecord_ap_item_pricing_algorithm') == 3) {
    //     for (var x = 0; x < item_rates.length; x++) {

    //         var temp = text + item_rates[x];
    //         var y = poSearch[0].getValue(temp);

    //         var qty_per_carton = poSearch[0].getValue('custrecord_ap_item_qty_per_carton');

    //         var total_packets_in_carton = y * qty_per_carton;

    //         var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

    //         if (gst_applicable == 1) {
    //             gst = 10;
    //         } else {
    //             gst = 0.0;
    //         }

    //         if (ActQty < total_packets_in_carton) {
    //             var temp_comm1 = 0.0;
    //             var temp_comm2 = 0.0;
    //             var packages_piece = ActQty % qty_per_carton;
    //             var packages_carton = Math.floor(ActQty / qty_per_carton);

    //             if (packages_carton != 0) {
    //                 var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //                 var val2 = 'custrecord_ap_price_' + item_rates[x];

    //                 var rate1 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                 var franch_comm1 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                 franch_comm1 = parseFloat(franch_comm1);



    //                 temp_comm1 = temp_comm1 + ((franch_comm1 + (franch_comm1 * (gst / 100))) * packages_carton);
    //                 temp_rate1 = parseFloat(rate1);

    //                 total_rate_50packs = total_rate_50packs + (temp_rate1 * packages_carton);


    //             }
    //             if (packages_piece != 0) {

    //                 var val1 = 'custrecord_ap_franchise_comm_' + item_rates[0];
    //                 var val2 = 'custrecord_ap_price_' + item_rates[0];

    //                 var rate2 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                 var franch_comm2 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                 franch_comm2 = parseFloat(franch_comm2);
    //                 temp_comm2 = temp_comm2 + ((franch_comm2 + (franch_comm2 * (gst / 100))) * packages_piece);
    //                 temp_rate2 = parseFloat(rate2);

    //                 total_rate_50packs = total_rate_50packs + (temp_rate2 * packages_piece);

    //             }

    //             franchisee_com = temp_comm1 + temp_comm2;
    //             calculated_value[0] = total_rate_50packs;
    //             calculated_value[1] = franchisee_com;

    //             break;
    //         }
    //         if (x == (item_rates.length - 1)) {
    //             var temp_comm1 = 0.0;
    //             var temp_comm2 = 0.0;
    //             var packages_piece = ActQty % qty_per_carton;
    //             var packages_carton = Math.floor(ActQty / qty_per_carton);

    //             if (packages_carton != 0) {
    //                 var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //                 var val2 = 'custrecord_ap_price_' + item_rates[x];

    //                 var rate1 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                 var franch_comm1 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                 franch_comm1 = parseFloat(franch_comm1);



    //                 temp_comm1 = temp_comm1 + ((franch_comm1 + (franch_comm1 * (gst / 100))) * packages_carton);
    //                 temp_rate1 = parseFloat(rate1);

    //                 total_rate_50packs = total_rate_50packs + (temp_rate1 * packages_carton);


    //             }
    //             if (packages_piece != 0) {

    //                 var val1 = 'custrecord_ap_franchise_comm_' + item_rates[0];
    //                 var val2 = 'custrecord_ap_price_' + item_rates[0];

    //                 var rate2 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //                 var franch_comm2 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);

    //                 franch_comm2 = parseFloat(franch_comm2);
    //                 temp_comm2 = temp_comm2 + ((franch_comm2 + (franch_comm2 * (gst / 100))) * packages_piece);
    //                 temp_rate2 = parseFloat(rate2);

    //                 total_rate_50packs = total_rate_50packs + (temp_rate2 * packages_piece);

    //             }
    //             franchisee_com = temp_comm1 + temp_comm2;
    //             calculated_value[0] = total_rate_50packs;
    //             calculated_value[1] = franchisee_com;
    //             break;
    //         }
    //     }
    // } else {
    //     for (var x = 0; x < item_rates.length; x++) {

    //         var temp = text + item_rates[x];
    //         var y = poSearch[0].getValue(temp);

    //         var qty_per_carton = poSearch[0].getValue('custrecord_ap_item_qty_per_carton');

    //         var qty_per_carton_parsed = 0.0;

    //         qty_per_carton_parsed = parseFloat(qty_per_carton);

    //         var total_packets_in_carton = y * qty_per_carton;

    //         var gst_applicable = poSearch[0].getValue('custrecord_ap_item_gst_applicable');

    //         if (gst_applicable == 1) {
    //             gst = 10;
    //         } else {
    //             gst = 0.0;
    //         }

    //         if (ActQty < total_packets_in_carton) {

    //             var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //             var val2 = 'custrecord_ap_price_' + item_rates[x];

    //             var rate1 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //             var franch_comm1 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);
    //             temp_rate1 = parseFloat(rate1);
    //             franch_comm1 = parseFloat(franch_comm1);

    //             if (x == 0) {

    //                 // var count_text = text + item_rates[1];
    //                 // var discount_break_count = poSearch[0].getValue(count_text);

    //                 // if(ActQty < discount_break_count)
    //                 // {
    //                 item_rate = (temp_rate1);
    //                 calculated_value[1] = (franch_comm1) * ActQty;
    //                 // }                
    //                 // else {

    //                 //   var val3 = 'custrecord_ap_franchise_comm_' + item_rates[1]; 
    //                 //   var val4 = 'custrecord_ap_price_' + item_rates[1]; 

    //                 //   var rate2 = nlapiLookupField('customrecord_ap_item', lineItemId, val4);
    //                 //  var franch_comm2 = nlapiLookupField('customrecord_ap_item', lineItemId, val3);
    //                 //  temp_rate2 = parseFloat(rate2);
    //                 //  franch_comm2 = parseFloat(franch_comm2);

    //                 //   item_rate = temp_rate2 / discount_break_count;


    //                 //    temp_comm1 = ((franch_comm2/discount_break_count) + ((franch_comm2/discount_break_count)* (gst/100))) * ActQty;
    //                 //    calculated_value[1] = temp_comm1;
    //                 // }

    //             } else {

    //                 //Divide the item rate with the quantity per carton to get the price per unit
    //                 item_rate = temp_rate1 / qty_per_carton_parsed;


    //                 temp_comm1 = ((franch_comm1 / qty_per_carton_parsed) + ((franch_comm1 / qty_per_carton_parsed) * (gst / 100))) * ActQty;
    //                 calculated_value[1] = temp_comm1;

    //             }
    //             break;
    //         }
    //         if (x == (item_rates.length - 1)) {

    //             var val1 = 'custrecord_ap_franchise_comm_' + item_rates[x];
    //             var val2 = 'custrecord_ap_price_' + item_rates[x];

    //             var rate1 = nlapiLookupField('customrecord_ap_item', lineItemId, val2);
    //             var franch_comm1 = nlapiLookupField('customrecord_ap_item', lineItemId, val1);
    //             temp_rate1 = parseFloat(rate1);
    //             franch_comm1 = parseFloat(franch_comm1);

    //             item_rate = temp_rate1 / qty_per_carton_parsed;


    //             temp_comm1 = ((franch_comm1 / qty_per_carton_parsed) + ((franch_comm1 / qty_per_carton_parsed) * (gst / 100))) * ActQty;
    //             calculated_value[1] = temp_comm1;

    //             break;
    //         }
    //     }
    // }

    if (total_rate_50packs == 0.0) {
        item_price = (item_rate * ActQty);
    } else {
        item_price = total_rate_50packs;
    }

    calculated_value[0] = item_price;

    return calculated_value

}