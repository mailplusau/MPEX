/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2017-08-03 16:59:04 Ankith 
 *
 * Remarks: Page to show the list of all the customers based on the franchisee. To convert all the items listed in the financial tab into service records. Ability for the franchisee to cancel a customer as well.        
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-07-16 15:46:28
 *
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
  //Franchisee
  zee = ctx.getUser();
} else  { 
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

    var inlineQty = '';
    var inlinehtml2 = '';

    inlineQty += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392606&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><script src="https://cdn.datatables.net/fixedheader/3.1.2/js/dataTables.fixedHeader.min.js" type="text/javascript"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.2/css/fixedHeader.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

    // inlineQty += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
    // inlineQty += '<li>Run Scheduler</li>';
    // inlineQty += '<li class="active">Customer List</li>';
    // inlineQty += '</ol>';


    inlineQty += '<style>.dataTables_filter {float: left !important;}.dataTables_length {float: right !important;}</style><div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;;position:absolute" class=""><b><u>IMPORTANT INSTRUCTIONS:</u></b></br>The purpose of this page is for you to nominate customer MPEX pricing that will apply from the next billing period (next month). For example, pricing nominations made below before 1 Aug 2020 will apply to all MPEX customer usage for the 30 August 2020 invoice.</br></br><b>How to use this page</b></br>Select the pricing you want to apply to the customer by product type and save your selection once finished<ul><li><b style="color:#7abcf5">Standard</b> = Highest price and highest franchisee margin</li><li><b style="color:#a7a6a1">Platinum</b> = Lowest price and lowest franchisee margin</li><li><b style="color:#ecc60b">Gold</b> = Cheaper than Express Post and default franchisee margin</li></ul></br>If you do not make any selection, the default selection is <b style="color:#ecc60b">GOLD</b></br></br><b>How to Find Customers:</b></br><ul><li>Customers are listed by customer number</li><li>Use the search box to find a specific customer</li></ul></br>Make sure you click the SAVE button once you are finished with your pricing selections.</div>';



    //If role is Admin or System Support, dropdown to select zee
    if (role != 1000) {

      inlineQty += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

      //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
      //Search: SMC - Franchisees
      var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

      var resultSet_zee = searched_zee.runSearch();

      var count_zee = 0;

      var zee_id;

      inlineQty += '<option value=""></option>'

      resultSet_zee.forEachResult(function(searchResult_zee) {
        zee_id = searchResult_zee.getValue('internalid');
        // WS Edit: Updated entityid to companyname
        zee_name = searchResult_zee.getValue('companyname');

        if (request.getParameter('zee') == zee_id) {
          inlineQty += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
        } else {
          inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>';
        }

        return true;
      });

      inlineQty += '</select></div>';
    }

    if (!isNullorEmpty(request.getParameter('zee'))) {
      zee = request.getParameter('zee');
    }

    form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(parseInt(zee));

    // form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

    inlineQty += '<br><br><table border="0" cellpadding="15" id="customer" class="display tablesorter table table-striped table-bordered table-responsive" cellspacing="0"><thead style="color: white;background-color: #607799;"><tr><th class="text-center">ID</th><th class="text-center">Customer</th><th class="text-center">5Kg </th><th class="text-center">3Kg</th><th  class="text-center">1Kg</th><th class="text-center">500g</th><th class="text-center">B4</th><th class="text-center">C5</th><th class="text-center">DL</th></tr></thead>';



    /**
     * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
     */


    // inlineQty += '</tbody>';
    inlineQty += '</table><br/>';

    form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);

    form.addSubmitButton("Save");
    form.setScript('customscript_cl_mpex_price_point_custome');
    response.writePage(form);

  } else {

    var params = {};
    nlapiSetRedirectURL('SUITELET', 'customscript_mp_mpex_price_point_custome', 'customdeploy_sl_mpex_price_point_custome', null, params);

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