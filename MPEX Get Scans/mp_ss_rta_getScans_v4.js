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
    headers['x-api-key'] = 'XAZkNK8dVs463EtP7WXWhcUQ0z8Xce47XklzpcBj';

    var todayDate = new Date();

    var jsonName = formatDate(todayDate);

    nlapiLogExecution("DEBUG", "todayDate", formatDate(todayDate));

    // var mainURL = 'http://app.mailplus.com.au/api/v1/admin/scans/sync?date=' + todayDate;

    // var response = nlapiRequestURL(mainURL, null, headers);

    // nlapiLogExecution('DEBUG', 'response2', response.body);

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
