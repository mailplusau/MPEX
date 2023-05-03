/**
 * Author:               Ankith Ravindran
 * Created on:           Fri Apr 21 2023
 * Modified on:          Fri Apr 21 2023 09:12:15
 * SuiteScript Version:  1.0 
 * Description:          Secure RTA API to get scan json for the previous day. 
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */

var ctx = nlapiGetContext();


function getScansV4() {

    // Hit RTA API
    var headers = {};
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    headers['GENERAL-API-KEY'] = '708aa067-d67d-73e6-8967-66786247f5d7';

    var todayDate = new Date();

    var jsonName = formatDate(todayDate);

    nlapiLogExecution("DEBUG", "jsonName", jsonName);

    var mainURL = 'http://app.mailplus.com.au/api/v1/admin/scans/sync?date=' + formatDate(todayDate);

    var response = nlapiRequestURL(mainURL, null, headers);

    var body = response.body;

    nlapiLogExecution('DEBUG', 'body', body);

    var todays_scans = JSON.parse(body);
    var barcodes = todays_scans.barcodes;
    var no_of_barcodes = barcodes.length; //No. of barcodes

    //100 barcodes per record created. 
    var nb_records = parseInt(no_of_barcodes / 100) + 1;

    for (var y = 0; y < nb_records; y++) {

        //Set the upper bound for loop based on number of barcodes
        if (no_of_barcodes > 100) {
            var nb_scans_in_record = 100; // Number of barcodes in each page except the last one.
            // if (y == nb_records - 1) {
            // 	var upper_bound = 100;
            // } else {
            var upper_bound = nb_scans_in_record * (y + 1);
            // }
        } else {
            var nb_scans_in_record = no_of_barcodes;
            var upper_bound = no_of_barcodes;
        }

        var scans_1 = '';

        //Iterate through each of the barcode
        for (var barcode_count = nb_scans_in_record * y; barcode_count < upper_bound; barcode_count++) {

            // var scans_length = JSON.parse(barcodes[barcode_count])
            var scans_string = JSON.stringify(barcodes[barcode_count]);
            if (!isNullorEmpty(scans_string)) {
                var scans_string_length = scans_string.length;
                var barcode = barcodes[barcode_count].code;
                var barcodes_scans = barcodes[barcode_count].scans; //barcode scans

                scans_1 += scans_string + ',';
                var scans_per_barcode = barcodes_scans.length; //No. of scans per barcode
            }
        }

        scans_1 = scans_1.substring(0, scans_1.length - 1);

        var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
        scan_json_record.setFieldValue('name', jsonName + '_Part_' + (y + 1));
        var scan_json_2 = '{ "scans": [' + scans_1 + ']}';
        scan_json_record.setFieldValue('custrecord_json', scan_json_2);
        scan_json_record.setFieldValue('custrecord_scan_josn_sync', 2);
        nlapiSubmitRecord(scan_json_record);
    }



    // var scanDetails = JSON.parse(response.body);


}

function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);

    return date;
}

function formatDate(inputDate) {

    var date = inputDate.getDate();
    var month = inputDate.getMonth() + 1;
    var year = inputDate.getFullYear();

    if (date < 10) {
        date = '0' + date;
    }

    if (month < 10) {
        month = '0' + month;
    }

    return date + '/' + month + '/' + year;
}
