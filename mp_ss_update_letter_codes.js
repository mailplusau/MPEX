/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-07-22 09:31:20         Ankith
 *
 * Description: Schedule Script to update the Letter Code based on the Price Point selected for each product skew        
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-07-23 10:37:33
 *
 */

var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

/**
 * [setLetterType description]
 */
function setLetterType() {


    var mpexPricingCustomerList = nlapiLoadSearch('customer', 'customsearch_mpex_price_point_customer_5');
    var resultSetMpexPricing = mpexPricingCustomerList.runSearch();

    resultSetMpexPricing.forEachResult(function(searchResult) {

        var custid = searchResult.getValue("internalid");
        var entityid = searchResult.getValue("entityid");
        var zee_id = searchResult.getValue("partner");
        var companyname = searchResult.getValue("companyname");
        var mpex_1kg = searchResult.getValue("custentity_mpex_1kg_price_point");
        var mpex_3kg = searchResult.getValue("custentity_mpex_3kg_price_point");
        var mpex_5kg = searchResult.getValue("custentity_mpex_5kg_price_point");
        var mpex_500g = searchResult.getValue("custentity_mpex_500g_price_point");
        var mpex_b4 = searchResult.getValue("custentity_mpex_b4_price_point");
        var mpex_c5 = searchResult.getValue("custentity_mpex_c5_price_point");
        var mpex_dl = searchResult.getValue("custentity_mpex_dl_price_point");

        var letter_code = letterCodes(mpex_5kg, mpex_3kg, mpex_1kg, mpex_500g, mpex_b4, mpex_c5, mpex_dl);

        var recCustomer = nlapiLoadRecord('customer', custid);
        recCustomer.setFieldValue('custentity_mpex_price_letter_types', letter_code);
        recCustomer.setFieldValue('custentity_mpex_letter_code_updated', 1);
        nlapiSubmitRecord(recCustomer);

        reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
        nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
        if (reschedule == false) {
            return false;
        }
        return true;
    });

}



/**
 * [Calculate the letter code associated with the customer based on the price points selected for each product type]
 * @param  {[Pricing Point Internal ID]} mpex_5kg  [description]
 * @param  {[Pricing Point Internal ID]} mpex_3kg  [description]
 * @param  {[Pricing Point Internal ID]} mpex_1kg  [description]
 * @param  {[Pricing Point Internal ID]} mpex_500g [description]
 * @param  {[Pricing Point Internal ID]} mpex_b4   [description]
 * @param  {[Pricing Point Internal ID]} mpex_c5   [description]
 * @param  {[Pricing Point Internal ID]} mpex_dl   [description]
 * @return {[Letter Type Internal ID]} letter_code [description]
 */
function letterCodes(mpex_5kg, mpex_3kg, mpex_1kg, mpex_500g, mpex_b4, mpex_c5, mpex_dl) {
    var letter_code;

    /*
        Pricing Points:
            Gold - Internal ID (1)
            Platinum - Internal ID (2)
            Standard - Internal ID (4)

        Letter Codes:
            Letter Code 0 - Internal ID (1)
            Letter Code 1 - Internal ID (2)
            Letter Code 2 - Internal ID (3)
            Letter Code 3 - Internal ID (4)
            Letter Code 4 - Internal ID (5)
            Letter Code 5 - Internal ID (6)
            Letter Code 6 - Internal ID (7)
            Letter Code 7 - Internal ID (8)
            Letter Code 8 - Internal ID (9)
            Letter Code 9 - Internal ID (10)
            Letter Code 10 - Internal ID (11)
            Letter Code 11 - Internal ID (12)
            Letter Code 12 - Internal ID (13)
            Letter Code 13 - Internal ID (14)
            Letter Code 14 - Internal ID (15)
            Letter Code 15 - Internal ID (16)
            Letter Code 16 - Internal ID (17)
    */


    if ((mpex_5kg == 1 && mpex_3kg == 1 && mpex_1kg == 1 && mpex_500g == 1 && mpex_b4 == 1 && mpex_c5 == 1 && mpex_dl == 1) || (isNullorEmpty(mpex_5kg) && isNullorEmpty(mpex_3kg) && isNullorEmpty(mpex_1kg) && isNullorEmpty(mpex_500g) && isNullorEmpty(mpex_b4) && isNullorEmpty(mpex_c5) && isNullorEmpty(mpex_dl))) {
        letter_code = 1;
    } else if ((mpex_5kg == 1 || isNullorEmpty(mpex_5kg)) && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 4 && (mpex_c5 == 1 || isNullorEmpty(mpex_c5)) && (mpex_dl == 1 || isNullorEmpty(mpex_dl))) {
        letter_code = 2;
    } else if ((mpex_5kg == 1 || isNullorEmpty(mpex_5kg)) && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 3;
    } else if ((mpex_5kg == 1 || isNullorEmpty(mpex_5kg)) && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && (mpex_b4 == 1 || isNullorEmpty(mpex_b4)) && (mpex_c5 == 1 || isNullorEmpty(mpex_c5)) && mpex_dl == 4) {
        letter_code = 4;
    } else if (mpex_5kg == 2 && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 2 && mpex_c5 == 2 && mpex_dl == 2) {
        letter_code = 5;
    } else if (mpex_5kg == 4 && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && (mpex_b4 == 1 || isNullorEmpty(mpex_b4)) && (mpex_c5 == 1 || isNullorEmpty(mpex_c5)) && (mpex_dl == 1 || isNullorEmpty(mpex_dl))) {
        letter_code = 6;
    } else if (mpex_5kg == 2 && mpex_3kg == 2 && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 2 && mpex_c5 == 2 && mpex_dl == 2) {
        letter_code = 7;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && (mpex_b4 == 1 || isNullorEmpty(mpex_b4)) && (mpex_c5 == 1 || isNullorEmpty(mpex_c5)) && (mpex_dl == 1 || isNullorEmpty(mpex_dl))) {
        letter_code = 8;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && mpex_500g == 4 && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 9;
    } else if (mpex_5kg == 2 && mpex_3kg == 2 && mpex_1kg == 2 && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 10;
    } else if (mpex_5kg == 2 && mpex_3kg == 2 && mpex_1kg == 2 && mpex_500g == 2 && mpex_b4 == 2 && mpex_c5 == 2 && mpex_dl == 2) {
        letter_code = 11;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && mpex_1kg == 2 && mpex_500g == 4 && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 12
    } else if ((mpex_5kg == 1 || isNullorEmpty(mpex_5kg)) && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && mpex_1kg == 4 && mpex_500g == 4 && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 13;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && mpex_1kg == 4 && mpex_500g == 4 && mpex_b4 == 4 && mpex_c5 == 4 && (mpex_dl == 1 || isNullorEmpty(mpex_dl))) {
        letter_code = 14;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && mpex_1kg == 4 && mpex_500g == 4 && mpex_b4 == 4 && mpex_c5 == 4 && mpex_dl == 4) {
        letter_code = 15;
    } else if (mpex_5kg == 4 && mpex_3kg == 4 && mpex_1kg == 4 && mpex_500g == 4 && (mpex_b4 == 1 || isNullorEmpty(mpex_b4)) && (mpex_c5 == 1 || isNullorEmpty(mpex_c5)) && (mpex_dl == 1 || isNullorEmpty(mpex_dl))) {
        letter_code = 16
    } else if ((mpex_5kg == 1 || isNullorEmpty(mpex_5kg)) && (mpex_3kg == 1 || isNullorEmpty(mpex_3kg)) && (mpex_1kg == 1 || isNullorEmpty(mpex_1kg)) && (mpex_500g == 1 || isNullorEmpty(mpex_500g)) && mpex_b4 == 2 && mpex_c5 == 2 && mpex_dl == 2) {
        letter_code = 17
    } else {
        letter_code = 18
    }

    return letter_code;
}

/**
 * [Return today's date]
 * @return {[string]} date [description]
 */
function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);

    return date;
}