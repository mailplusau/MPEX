/**
 * Module Description
 *
 * NSVersion    Date                Author
 * 1.00         2017-08-03 16:59:04 Ankith
 *
 * Remarks: Page to show the list of all the customers based on the franchisee. To convert all the items listed in the financial tab into service records. Ability for the franchisee to cancel a customer as well.
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2021-11-05T07:03:14+11:00
 *
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
  //Franchisee
  zee = ctx.getUser();
} else {
  zee = 626428; //TEST VIC
}

var ctx = nlapiGetContext();

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
  baseURL = 'https://system.sandbox.netsuite.com';
}



function main(request, response) {


  if (request.getMethod() == "GET") {

    var form = nlapiCreateForm('MPEX Pricing Nomination - Customer Level');

    var inlineHtml = '';
    var inlinehtml2 = '';

    inlineHtml +=
      '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392606&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><script src="https://cdn.datatables.net/fixedheader/3.1.2/js/dataTables.fixedHeader.min.js" type="text/javascript"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.2/css/fixedHeader.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style type="text/css">.tg  {border-collapse:collapse;border-spacing:0;}.tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:10px;overflow:hidden;word-break:normal;}.tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:10px;font-weight:normal;overflow:hidden;padding:5px 5px;word-break:normal;.tg .tg-netp{background-color:#036400;text-align:left;vertical-align:top}.tg .tg-0lax{text-align:left;vertical-align:top}</style>';

    // inlineHtml += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
    // inlineHtml += '<li>Run Scheduler</li>';
    // inlineHtml += '<li class="active">Customer List</li>';
    // inlineHtml += '</ol>';


    // inlineHtml += '<style>.dataTables_filter {float: left !important;}.dataTables_length {float: right !important;} #customer{width: 100% !important;}</style><div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;;position:absolute" class=""><b><u>IMPORTANT INSTRUCTIONS:</u></b></br>Use this page to set customer MPEX pricing. Changes made will apply from the next billing period (next month). For example, pricing nominations made below before 1 Nov 2021 will apply to all MPEX customer usage for the 30 Nov 2021 invoice.</br></br><b>How to use this page</b></br>Select the pricing plan you want to apply to the customer by product type and save your selection once finished<ul><li><b style="color:#7ABCF5">PRO Standard</b> = Highest price and highest franchisee margin</li><li><b style="color:#FFFF00">PRO Gold</b> = Cheaper than prepaid Express Post (2.5% discount on AP)</li><li><b style="color:#287587">PRO Platinum</b> = Cheaper than prepaid Express Post (15% discount on PRO Gold)</li><li><b style="color:#379E8F">PRO Plus</b> = Lowest price and lowest franchisee margin – (19% discount on PRO Gold)</li><li><b style="color:##f1f1f1">Manual Platinum</b> = Transition price for high volume customers (Only on 500g & 1kg range)</li></ul></br>If you do not make any selection, the default selection is </br><table class="tg"><thead><tr><th class="tg-netp"><b>Current Price Points</b></th><th class="tg-netp"><b>Default Price Change</b></th></tr></thead><tbody><tr><td class="tg-0lax">Standard</td><td class="tg-0lax">Pro Standard</td></tr><tr><td class="tg-0lax">Gold</td><td class="tg-0lax">Pro Gold</td></tr><tr><td class="tg-0lax">Platinum</td><td class="tg-0lax">Pro Platinum</td></tr><tr><td class="tg-0lax">Pro Gold (Old)</td><td class="tg-0lax">Pro Platinum</td></tr><tr><td class="tg-0lax">Pro Platinum (Old)</td><td class="tg-0lax">Pro Plus</td></tr></tbody></table>'

    // inlineHtml += '</br><b>Link: <a href="https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=3550&saverun=T&whence=">MPEX Item Pricing & Commissions</a></b></br></br><b>How to Find Customers:</b></br><ul><li>Customers are listed by customer number</li><li>Use the search box to find a specific customer</li></ul></br>Make sure you click the SAVE button once you are finished with your pricing selections.</div>';

    inlineHtml +=
      '<style>.dataTables_filter {float: left !important;}.dataTables_length {float: right !important;} #customer{width: 100% !important;}</style><div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;;position:absolute" class=""><b><u>IMPORTANT INSTRUCTIONS:</u></b></br>The MPEX PRO pricing changes will apply to all customers from Nov 1 2021. Would you please review the new rate by product scheduled to apply in the Scheduled column? You can override the scheduled new rate by selecting a different rate and saving your changes. If you choose to change a rate, you must make and save your changes before midnight Oct 4 2021. Otherwise, the new rate scheduled below will automatically apply.</br></br><b><u>How to use this page</u></b></br><b>To Find Customers: </b>Customers are listed by customer number. Use the search box to find a specific customer.</br></br><b>To Set a Rate</b></br>Select the drop-down menu box in the Scheduled column of the product you want to change. Select the new rate and save your selection once finished. </br></br><b>Refer to this link for: <a href="https://1048144.app.netsuite.com/app/common/search/searchresults.nl?searchid=3550&saverun=T&whence=">MPEX Item Pricing & Commissions</a></b></br><ul><li><b style="color:#7ABCF5">PRO Standard</b> = Highest price and highest franchisee margin</li><li><b style="color:#FFFF00">PRO Gold</b> = Cheaper than prepaid Express Post (2.5% discount on AP)</li><li><b style="color:#287587">PRO Platinum</b> = Cheaper than prepaid Express Post (15% discount on PRO Gold)</li><li><b style="color:#379E8F">PRO Plus</b> = Lowest price and lowest franchisee margin – (19% discount on PRO Gold)</li><li><b style="color:##f1f1f1">Manual Platinum</b> = Transition price for high volume customers (Only on 500g & 1kg range)</li></ul></br>The new scheduled rate has been set to the "PRO" of the current rate for all customers. For example, a current Gold product rate will be scheduled to PRO GOLD for Nov 1; a Platinum to PRO PLATINUM, and a Standard to PRO STANDARD. The new PROPLUS rate is the most heavily discounted rate with the lowest margin for you. PROPLUS is typically only offered to customers sending >250 a week. If you have any questions about applying a special pricing plan to a customer, please consult your account manager. </br>'

    inlineHtml +=
      '</br>If you choose to change a rate, you must make and save your changes before <b>midnight Oct 4 2021</b>. Otherwise, the new rate scheduled below will automatically apply - no further action required.</div>';



    //If role is Admin or System Support, dropdown to select zee
    if (role != 1000) {

      inlineHtml +=
        '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

      //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
      //Search: SMC - Franchisees
      var searched_zee = nlapiLoadSearch('partner',
        'customsearch_smc_franchisee');

      var resultSet_zee = searched_zee.runSearch();

      var count_zee = 0;

      var zee_id;

      inlineHtml += '<option value=""></option>'

      resultSet_zee.forEachResult(function(searchResult_zee) {
        zee_id = searchResult_zee.getValue('internalid');
        // WS Edit: Updated entityid to companyname
        zee_name = searchResult_zee.getValue('companyname');

        if (request.getParameter('zee') == zee_id) {
          inlineHtml += '<option value="' + zee_id +
            '" selected="selected">' + zee_name + '</option>';
        } else {
          inlineHtml += '<option value="' + zee_id + '">' + zee_name +
            '</option>';
        }

        return true;
      });

      inlineHtml += '</select></div>';
    }

    if (!isNullorEmpty(request.getParameter('zee'))) {
      zee = request.getParameter('zee');
    }

    form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(
      parseInt(zee));

    // form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

    inlineHtml +=
      '<br><br><table border="0" cellpadding="15" id="customer" class="display tablesorter table table-striped table-bordered table-responsive" cellspacing="0" style="width: 100% !important;"><thead style="color: white;background-color: #607799;"><tr><th class="text-center">Customer</th><th class="text-center">New Rates - Date Scheduled</th><th class="text-center" colspan=2>5Kg </th><th class="text-center" colspan=2>3Kg</th><th  class="text-center" colspan=2>1Kg</th><th class="text-center" colspan=2>500g</th><th class="text-center" colspan=2>B4</th><th class="text-center" colspan=2>C5</th><th class="text-center" colspan=2>DL</th></tr><tr><th class="text-center"></th><th class="text-center"></th><th class="text-center">Current</th><th class="text-center">Scheduled</th><th class="text-center">Current</th><th class="text-center">Scheduled</th><th class="text-center">Current</th><th class="text-center">Scheduled</th><th class="text-center">Cuurent</th></th><th class="text-center">Scheduled</th><th class="text-center">Current</th><th  class="text-center">Scheduled</th><th class="text-center">Current</th><th class="text-center">Scheduled</th><th class="text-center">Current</th><th class="text-center">Scheduled</th></tr></thead>';



    /**
     * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
     */


    // inlineHtml += '</tbody>';
    inlineHtml += '</table><br/>';

    form.addField('preview_table', 'inlinehtml', '').setLayoutType(
      'outsidebelow', 'startrow').setDefaultValue(inlineHtml);

    form.addSubmitButton("Save");
    form.setScript('customscript_cl_mpex_price_point_custome');
    response.writePage(form);

  } else {

    var params = {};
    nlapiSetRedirectURL('SUITELET', 'customscript_mp_mpex_price_point_custome',
      'customdeploy_sl_mpex_price_point_custome', null, params);

  }
}

/**
 * [getDate description] - Function to get the current date
 * @return {[String]} [description] - Return the current date
 */
function getDate() {
  var date = new Date();
  if (date.getHours() > 6) {
    date = nlapiAddDays(date, 1);
  }
  date = nlapiDateToString(date);
  return date;
}

function getStartDate() {
  var today = nlapiStringToDate(getDate());
  var startdate = nlapiAddDays(today, 2);
  if (startdate.getDay() == 0) {
    startdate = nlapiAddDays(startdate, 1)
  } else if (startdate.getDay() == 6) {
    startdate = nlapiAddDays(startdate, 2)
  }
  return nlapiDateToString(startdate);
}
