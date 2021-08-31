/**
 * Module Description
 * 
 * NSVersion Date Author 1.00 2019-11-16 08:09:51 Ankith
 * 
 * Description:
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2021-08-31 14:57:51
 * 
 */

/*
Old MPEX Pricing - 1st Nov 2021 Onwards
	Gold	1	 
	Platinum	2	 
	Same as AP	3	
	Standard	4	 
	AP Match	5	 
	Pro Platinum (Old)	6	 
	Pro Gold (Old)	7
 */

/*
New MPEX Price Points - 1st Sept 2021 Onwards
	Pro Standard	8	 
	Pro Plus	9	 
	Manual Platinum	10	 
	Pro Platinum	11	 
	Pro Gold	12
 */

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
	// Franchisee
	zee = ctx.getUser();
} else {
	zee = 626428; // TEST VIC
}

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

// To show loader while the page is laoding
$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

var table;


/**
 * [pageInit description] - On page initialization, load the Dynatable CSS and
 * sort the table based on the customer name and align the table to the center
 * of the page.
 */
function pageInit() {

	console.log(nlapiGetFieldValue('zee'));

	// Search: Product Stock - Customer Level
	var mpexPriceSearch = nlapiLoadSearch('customer',
		'customsearch_mpex_price_point_customer');

	var addFilterExpression = new nlobjSearchFilter('partner', null, 'anyof',
		parseInt(nlapiGetFieldValue('zee')));
	mpexPriceSearch.addFilter(addFilterExpression);

	var resultSetCustomer = mpexPriceSearch.runSearch();

	var count = 0;
	var customer_count = 0;

	var dataSet = '{"data":[';

	resultSetCustomer.forEachResult(function(searchResult) {

			var custid = searchResult.getValue("internalid");
			var entityid = searchResult.getValue("entityid");
			var zee_id = searchResult.getValue("partner");
			var companyname = searchResult.getValue("companyname");
			var mpex_1kg = searchResult
				.getValue("custentity_mpex_1kg_price_point");
			var mpex_3kg = searchResult
				.getValue("custentity_mpex_3kg_price_point");
			var mpex_5kg = searchResult
				.getValue("custentity_mpex_5kg_price_point");
			var mpex_500g = searchResult
				.getValue("custentity_mpex_500g_price_point");
			var mpex_b4 = searchResult
				.getValue("custentity_mpex_b4_price_point");
			var mpex_c5 = searchResult
				.getValue("custentity_mpex_c5_price_point");
			var mpex_dl = searchResult
				.getValue("custentity_mpex_dl_price_point");
			var mpex_1kg_new = searchResult
				.getValue("custentity_mpex_1kg_price_point_new");
			var mpex_3kg_new = searchResult
				.getValue("custentity_mpex_3kg_price_point_new");
			var mpex_5kg_new = searchResult
				.getValue("custentity_mpex_5kg_price_point_new");
			var mpex_500g_new = searchResult
				.getValue("custentity_mpex_500g_price_point_new");
			var mpex_b4_new = searchResult
				.getValue("custentity_mpex_b4_price_point_new");
			var mpex_c5_new = searchResult
				.getValue("custentity_mpex_c5_price_point_new");
			var mpex_dl_new = searchResult
				.getValue("custentity_mpex_dl_price_point_new");
			var mpex_start_date = searchResult
				.getValue("custentity_mpex_price_point_start_date");

			if (isNullorEmpty(mpex_1kg)) {
				mpex_1kg = '0';
			}
			if (isNullorEmpty(mpex_3kg)) {
				mpex_3kg = '0';
			}
			if (isNullorEmpty(mpex_5kg)) {
				mpex_5kg = '0';
			}
			if (isNullorEmpty(mpex_500g)) {
				mpex_500g = '0';
			}
			if (isNullorEmpty(mpex_b4)) {
				mpex_b4 = '0';
			}
			if (isNullorEmpty(mpex_c5)) {
				mpex_c5 = '0';
			}
			if (isNullorEmpty(mpex_dl)) {
				mpex_dl = '0';
			}

			if (isNullorEmpty(mpex_1kg_new)) {
				mpex_1kg_new = '0';
			}
			if (isNullorEmpty(mpex_3kg_new)) {
				mpex_3kg_new = '0';
			}
			if (isNullorEmpty(mpex_5kg_new)) {
				mpex_5kg_new = '0';
			}
			if (isNullorEmpty(mpex_500g_new)) {
				mpex_500g_new = '0';
			}
			if (isNullorEmpty(mpex_b4_new)) {
				mpex_b4_new = '0';
			}
			if (isNullorEmpty(mpex_c5_new)) {
				mpex_c5_new = '0';
			}
			if (isNullorEmpty(mpex_dl_new)) {
				mpex_dl_new = '0';
			}

			if (isNullorEmpty(mpex_start_date)) {
				mpex_start_date = '';
			}

			console.log(mpex_1kg)

			dataSet += '{"cust_id":"' + custid + '", "entityid":"' +
				entityid + '", "companyname_text":"' + companyname +
				'", "company_name":"' + companyname +
				'","mpex_1kg": "' + mpex_1kg + '","mpex_3kg": "' +
				mpex_3kg + '","mpex_5kg": "' + mpex_5kg +
				'","mpex_500g": "' + mpex_500g + '","mpex_b4": "' +
				mpex_b4 + '","mpex_c5": "' + mpex_c5 +
				'","mpex_dl": "' + mpex_dl + '","mpex_1kg_new": "' +
				mpex_1kg_new + '","mpex_3kg_new": "' + mpex_3kg_new +
				'","mpex_5kg_new": "' + mpex_5kg_new +
				'","mpex_500g_new": "' + mpex_500g_new +
				'","mpex_b4_new": "' + mpex_b4_new +
				'","mpex_c5_new": "' + mpex_c5_new +
				'","mpex_dl_new": "' + mpex_dl_new +
				'", "mpex_start_date": "' + mpex_start_date + '"},';

			count++;
			return true;
		});

	if (count > 0) {
		dataSet = dataSet.substring(0, dataSet.length - "1");
		console.log(dataSet);
		dataSet += ']}';
	} else {

		dataSet += ']}';
	}

	console.log(dataSet);
	var parsedData = JSON.parse(dataSet);
	console.log(parsedData.data);

	// AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css',
	// 'head');

	// JQuery to sort table based on click of header. Attached library
	$(document)
		.ready(
			function() {
				table = $("#customer")
					.DataTable({
						"data": parsedData.data,
						"columns": [{
							"data": null,
							"render": function(
								data, type, row) {
								return '<p><b>' +
									data.entityid +
									'</b><p>';
							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								return '<p><b>' +
									data.companyname_text +
									'</b><p><input type="hidden" class="form-control customer_id text-center" value="' +
									data.cust_id +
									'">';
							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								return '<p><b>' +
									data.mpex_start_date +
									'</b><p>';
							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_5kg text-center" value="' +
									data.mpex_5kg +
									'"><select class="form-control 5kg text-center" disabled>';
								if (data.mpex_5kg == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_5kg == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;
							},

						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_5kg_new text-center" value="' +
									data.mpex_5kg_new +
									'"><select class="form-control 5kg_new text-center" >';
								if (data.mpex_5kg_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_5kg == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_3kg text-center" value="' +
									data.mpex_3kg +
									'"><select class="form-control 3kg text-center" disabled>';
								if (data.mpex_3kg == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_3kg == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_3kg_new text-center" value="' +
									data.mpex_3kg_new +
									'"><select class="form-control 3kg_new text-center">';
								if (data.mpex_3kg_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_3kg_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_1kg text-center" value="' +
									data.mpex_1kg +
									'"><select class="form-control 1kg text-center" disabled>';
								if (data.mpex_1kg == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_1kg == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_1kg_new text-center" value="' +
									data.mpex_1kg_new +
									'"><select class="form-control 1kg_new text-center">';
								if (data.mpex_1kg_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_1kg_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_500g text-center" value="' +
									data.mpex_500g +
									'"><select class="form-control 500g text-center" disabled>';
								if (data.mpex_500g == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_500g == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_5kg == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;

							},
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_500g_new text-center" value="' +
									data.mpex_500g_new +
									'"><select class="form-control 500g_new text-center">';
								if (data.mpex_500g_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_500g_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;
							},

						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_b4 text-center" value="' +
									data.mpex_b4 +
									'"><select class="form-control b4 text-center" disabled>';
								if (data.mpex_b4 == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_b4 == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4 == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_b4_new text-center" value="' +
									data.mpex_b4_new +
									'"><select class="form-control b4_new text-center">';
								if (data.mpex_b4_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_b4_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_c5 text-center" value="' +
									data.mpex_c5 +
									'"><select class="form-control c5 text-center" disabled>';
								if (data.mpex_c5 == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_c5 == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5 == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_c5_new text-center" value="' +
									data.mpex_c5_new +
									'"><select class="form-control c5_new text-center">';
								if (data.mpex_c5_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_c5_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_dl text-center" value="' +
									data.mpex_dl +
									'"><select class="form-control dl text-center" disabled>';
								if (data.mpex_dl == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_dl == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}
								column_data += '</select>';
								return column_data;

							}
						}, {
							"data": null,
							"render": function(
								data, type, row) {
								var column_data = '<input type="hidden" class="form-control old_dl_new text-center" value="' +
									data.mpex_dl_new +
									'"><select class="form-control dl_new text-center">';
								if (data.mpex_dl_new == '1') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" selected>Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '2') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2" selected>Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '4') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4" selected>Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '5') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5" selected>AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '6') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" selected>MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '7') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7" selected>MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '8') {
									column_data += '<option value="0"></option><option value="8" selected>MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '9') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9" selected>MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '10') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" selected>MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '11') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11" selected>MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="8">MPEX Pro Standard</option><option value="12">MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else if (data.mpex_dl_new == '12') {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10" >MPEX Manual Platinum</option><option value="1">Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6" >MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								} else {
									column_data += '<option value="0"></option><option value="8">MPEX Pro Standard</option><option value="12" selected>MPEX Pro Gold</option><option value="11">MPEX Pro Platinum</option><option value="9">MPEX Pro Plus</option><option value="10">MPEX Manual Platinum</option><option value="1" >Gold (Old)</option><option value="2">Platinum (Old)</option><option value="4">Standard (Old)</option><option value="6">MPEX Pro Platinum (Old)</option><option value="7">MPEX Pro Gold (Old)</option><option value="5">AP Match (Old)</option>'
								}

								column_data += '</select>';
								return column_data;

							},
						}],
						"order": [
							[1, 'asc']
						],
						"pageLength": 400,
						"scrollY": "1000px",
						"fixedHeader": {
							"header": true
						},
						"createdRow": function(row, data,
							index) {
							console.log(row);
							console.log(index);

							//Current Price - 5Kg
							if (data.mpex_5kg == 1) {
								$('td', row).eq(3).css('background-color', '#999999');
							} else if (data.mpex_5kg == 2) {
								$('td', row).eq(3).css('background-color', '#999999');
							} else if (data.mpex_5kg == 4) {
								$('td', row).eq(3).css('background-color', '#999999');
							} else if (data.mpex_5kg == 6) {
								$('td', row).eq(3).css('background-color', '#999999');
							} else if (data.mpex_5kg == 7) {
								$('td', row).eq(3).css('background-color', '#999999');
							} else if (data.mpex_5kg == 8) { //Pro Standard
								$('td', row).eq(3).css('background-color', '#7ABCF5');
							} else if (data.mpex_5kg == 9) { //Pro Plus
								$('td', row).eq(3).css('background-color', '#379E8F');
							} else if (data.mpex_5kg == 10) { //Manual Platinum
								$('td', row).eq(3).css('background-color', '#a7a6a100');
							} else if (data.mpex_5kg == 11) { //Pro Platinum
								$('td', row).eq(3).css('background-color', '#287587');
							} else if (data.mpex_5kg == 12) { //Pro Gold
								$('td', row).eq(3).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(3).removeAttr("style");
							}

							//Scheduled Price Change - 5Kg
							if (data.mpex_5kg_new == 1) {
								$('td', row).eq(4).css('background-color', '#999999');
							} else if (data.mpex_5kg_new == 2) {
								$('td', row).eq(4).css('background-color', '#999999');
							} else if (data.mpex_5kg_new == 4) {
								$('td', row).eq(4).css('background-color', '#999999');
							} else if (data.mpex_5kg_new == 6) {
								$('td', row).eq(4).css('background-color', '#999999');
							} else if (data.mpex_5kg_new == 7) {
								$('td', row).eq(4).css('background-color', '#999999');
							} else if (data.mpex_5kg_new == 8) { //Pro Standard
								$('td', row).eq(4).css('background-color', '#7ABCF5');
							} else if (data.mpex_5kg_new == 9) { //Pro Plus
								$('td', row).eq(4).css('background-color', '#379E8F');
							} else if (data.mpex_5kg_new == 10) { //Manual Platinum
								$('td', row).eq(4).css('background-color', '#a7a6a100');
							} else if (data.mpex_5kg_new == 11) { //Pro Platinum
								$('td', row).eq(4).css('background-color', '#287587');
							} else if (data.mpex_5kg_new == 12) { //Pro Gold
								$('td', row).eq(4).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(4).removeAttr("style");
							}

							//Current Price - 3Kg
							if (data.mpex_3kg == 1) {
								$('td', row).eq(5).css('background-color', '#999999');
							} else if (data.mpex_3kg == 2) {
								$('td', row).eq(5).css('background-color', '#999999');
							} else if (data.mpex_3kg == 4) {
								$('td', row).eq(5).css('background-color', '#999999');
							} else if (data.mpex_3kg == 6) {
								$('td', row).eq(5).css('background-color', '#999999');
							} else if (data.mpex_3kg == 7) {
								$('td', row).eq(5).css('background-color', '#999999');
							} else if (data.mpex_3kg == 8) { //Pro Standard
								$('td', row).eq(5).css('background-color', '#7ABCF5');
							} else if (data.mpex_3kg == 9) { //Pro Plus
								$('td', row).eq(5).css('background-color', '#379E8F');
							} else if (data.mpex_3kg == 10) { //Manual Platinum
								$('td', row).eq(5).css('background-color', '#a7a6a100');
							} else if (data.mpex_3kg == 11) { //Pro Platinum
								$('td', row).eq(5).css('background-color', '#287587');
							} else if (data.mpex_3kg == 12) { //Pro Gold
								$('td', row).eq(5).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(5).removeAttr("style");
							}

							//Scheduled Price Change - 3Kg
							if (data.mpex_3kg_new == 1) {
								$('td', row).eq(6).css('background-color', '#999999');
							} else if (data.mpex_3kg_new == 2) {
								$('td', row).eq(6).css('background-color', '#999999');
							} else if (data.mpex_3kg_new == 4) {
								$('td', row).eq(6).css('background-color', '#999999');
							} else if (data.mpex_3kg_new == 6) {
								$('td', row).eq(6).css('background-color', '#999999');
							} else if (data.mpex_3kg_new == 7) {
								$('td', row).eq(6).css('background-color', '#999999');
							} else if (data.mpex_3kg_new == 8) { //Pro Standard
								$('td', row).eq(6).css('background-color', '#7ABCF5');
							} else if (data.mpex_3kg_new == 9) { //Pro Plus
								$('td', row).eq(6).css('background-color', '#379E8F');
							} else if (data.mpex_3kg_new == 10) { //Manual Platinum
								$('td', row).eq(6).css('background-color', '#a7a6a100');
							} else if (data.mpex_3kg_new == 11) { //Pro Platinum
								$('td', row).eq(6).css('background-color', '#287587');
							} else if (data.mpex_3kg_new == 12) { //Pro Gold
								$('td', row).eq(6).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(6).removeAttr("style");
							}

							//Current Price - 1Kg
							if (data.mpex_1kg == 1) {
								$('td', row).eq(7).css('background-color', '#999999');
							} else if (data.mpex_1kg == 2) {
								$('td', row).eq(7).css('background-color', '#999999');
							} else if (data.mpex_1kg == 4) {
								$('td', row).eq(7).css('background-color', '#999999');
							} else if (data.mpex_1kg == 6) {
								$('td', row).eq(7).css('background-color', '#999999');
							} else if (data.mpex_1kg == 7) {
								$('td', row).eq(7).css('background-color', '#999999');
							} else if (data.mpex_1kg == 8) { //Pro Standard
								$('td', row).eq(7).css('background-color', '#7ABCF5');
							} else if (data.mpex_1kg == 9) { //Pro Plus
								$('td', row).eq(7).css('background-color', '#379E8F');
							} else if (data.mpex_1kg == 10) { //Manual Platinum
								$('td', row).eq(7).css('background-color', '#a7a6a100');
							} else if (data.mpex_1kg == 11) { //Pro Platinum
								$('td', row).eq(7).css('background-color', '#287587');
							} else if (data.mpex_1kg == 12) { //Pro Gold
								$('td', row).eq(7).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(7).removeAttr("style");
							}

							//Scheduled Price Change - 1Kg
							if (data.mpex_1kg_mew == 1) {
								$('td', row).eq(8).css('background-color', '#999999');
							} else if (data.mpex_1kg_mew == 2) {
								$('td', row).eq(8).css('background-color', '#999999');
							} else if (data.mpex_1kg_mew == 4) {
								$('td', row).eq(8).css('background-color', '#999999');
							} else if (data.mpex_1kg_mew == 6) {
								$('td', row).eq(8).css('background-color', '#999999');
							} else if (data.mpex_1kg_mew == 7) {
								$('td', row).eq(8).css('background-color', '#999999');
							} else if (data.mpex_1kg_mew == 8) { //Pro Standard
								$('td', row).eq(8).css('background-color', '#7ABCF5');
							} else if (data.mpex_1kg_mew == 9) { //Pro Plus
								$('td', row).eq(8).css('background-color', '#379E8F');
							} else if (data.mpex_1kg_mew == 10) { //Manual Platinum
								$('td', row).eq(8).css('background-color', '#a7a6a100');
							} else if (data.mpex_1kg_mew == 11) { //Pro Platinum
								$('td', row).eq(8).css('background-color', '#287587');
							} else if (data.mpex_1kg_mew == 12) { //Pro Gold
								$('td', row).eq(8).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(8).removeAttr("style");
							}

							//Current Price - 500g
							if (data.mpex_500g == 1) {
								$('td', row).eq(9).css('background-color', '#999999');
							} else if (data.mpex_500g == 2) {
								$('td', row).eq(9).css('background-color', '#999999');
							} else if (data.mpex_500g == 4) {
								$('td', row).eq(9).css('background-color', '#999999');
							} else if (data.mpex_500g == 6) {
								$('td', row).eq(9).css('background-color', '#999999');
							} else if (data.mpex_500g == 7) {
								$('td', row).eq(9).css('background-color', '#999999');
							} else if (data.mpex_500g == 8) { //Pro Standard
								$('td', row).eq(9).css('background-color', '#7ABCF5');
							} else if (data.mpex_500g == 9) { //Pro Plus
								$('td', row).eq(9).css('background-color', '#379E8F');
							} else if (data.mpex_500g == 10) { //Manual Platinum
								$('td', row).eq(9).css('background-color', '#a7a6a100');
							} else if (data.mpex_500g == 11) { //Pro Platinum
								$('td', row).eq(9).css('background-color', '#287587');
							} else if (data.mpex_500g == 12) { //Pro Gold
								$('td', row).eq(9).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(9).removeAttr("style");
							}

							//Scheduled Price Change - 500g
							if (data.mpex_500g_new == 1) {
								$('td', row).eq(10).css('background-color', '#999999');
							} else if (data.mpex_500g_new == 2) {
								$('td', row).eq(10).css('background-color', '#999999');
							} else if (data.mpex_500g_new == 4) {
								$('td', row).eq(10).css('background-color', '#999999');
							} else if (data.mpex_500g_new == 6) {
								$('td', row).eq(10).css('background-color', '#999999');
							} else if (data.mpex_500g_new == 7) {
								$('td', row).eq(10).css('background-color', '#999999');
							} else if (data.mpex_500g_new == 8) { //Pro Standard
								$('td', row).eq(10).css('background-color', '#7ABCF5');
							} else if (data.mpex_500g_new == 9) { //Pro Plus
								$('td', row).eq(10).css('background-color', '#379E8F');
							} else if (data.mpex_500g_new == 10) { //Manual Platinum
								$('td', row).eq(10).css('background-color', '#a7a6a100');
							} else if (data.mpex_500g_new == 11) { //Pro Platinum
								$('td', row).eq(10).css('background-color', '#287587');
							} else if (data.mpex_500g_new == 12) { //Pro Gold
								$('td', row).eq(10).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(10).removeAttr("style");
							}

							//Current Price - B4
							if (data.mpex_b4 == 1) {
								$('td', row).eq(11).css('background-color', '#999999');
							} else if (data.mpex_b4 == 2) {
								$('td', row).eq(11).css('background-color', '#999999');
							} else if (data.mpex_b4 == 4) {
								$('td', row).eq(11).css('background-color', '#999999');
							} else if (data.mpex_b4 == 6) {
								$('td', row).eq(11).css('background-color', '#999999');
							} else if (data.mpex_b4 == 7) {
								$('td', row).eq(11).css('background-color', '#999999');
							} else if (data.mpex_b4 == 8) { //Pro Standard
								$('td', row).eq(11).css('background-color', '#7ABCF5');
							} else if (data.mpex_b4 == 9) { //Pro Plus
								$('td', row).eq(11).css('background-color', '#379E8F');
							} else if (data.mpex_b4 == 10) { //Manual Platinum
								$('td', row).eq(11).css('background-color', '#a7a6a100');
							} else if (data.mpex_b4 == 11) { //Pro Platinum
								$('td', row).eq(11).css('background-color', '#287587');
							} else if (data.mpex_b4 == 12) { //Pro Gold
								$('td', row).eq(11).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(11).removeAttr("style");
							}

							//Scheduled Price Change - B4
							if (data.mpex_b4_new == 1) {
								$('td', row).eq(12).css('background-color', '#999999');
							} else if (data.mpex_b4_new == 2) {
								$('td', row).eq(12).css('background-color', '#999999');
							} else if (data.mpex_b4_new == 4) {
								$('td', row).eq(12).css('background-color', '#999999');
							} else if (data.mpex_b4_new == 6) {
								$('td', row).eq(12).css('background-color', '#999999');
							} else if (data.mpex_b4_new == 7) {
								$('td', row).eq(12).css('background-color', '#999999');
							} else if (data.mpex_b4_new == 8) { //Pro Standard
								$('td', row).eq(12).css('background-color', '#7ABCF5');
							} else if (data.mpex_b4_new == 9) { //Pro Plus
								$('td', row).eq(12).css('background-color', '#379E8F');
							} else if (data.mpex_b4_new == 10) { //Manual Platinum
								$('td', row).eq(12).css('background-color', '#a7a6a100');
							} else if (data.mpex_b4_new == 11) { //Pro Platinum
								$('td', row).eq(12).css('background-color', '#287587');
							} else if (data.mpex_b4_new == 12) { //Pro Gold
								$('td', row).eq(12).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(12).removeAttr("style");
							}

							//Current Price - C5
							if (data.mpex_c5 == 1) {
								$('td', row).eq(13).css('background-color', '#999999');
							} else if (data.mpex_c5 == 2) {
								$('td', row).eq(13).css('background-color', '#999999');
							} else if (data.mpex_c5 == 4) {
								$('td', row).eq(13).css('background-color', '#999999');
							} else if (data.mpex_c5 == 6) {
								$('td', row).eq(13).css('background-color', '#999999');
							} else if (data.mpex_c5 == 7) {
								$('td', row).eq(13).css('background-color', '#999999');
							} else if (data.mpex_c5 == 8) { //Pro Standard
								$('td', row).eq(13).css('background-color', '#7ABCF5');
							} else if (data.mpex_c5 == 9) { //Pro Plus
								$('td', row).eq(13).css('background-color', '#379E8F');
							} else if (data.mpex_c5 == 10) { //Manual Platinum
								$('td', row).eq(13).css('background-color', '#a7a6a100');
							} else if (data.mpex_c5 == 11) { //Pro Platinum
								$('td', row).eq(13).css('background-color', '#287587');
							} else if (data.mpex_c5 == 12) { //Pro Gold
								$('td', row).eq(13).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(13).removeAttr("style");
							}

							//Scheduled Price Change - C5
							if (data.mpex_c5_new == 1) {
								$('td', row).eq(14).css('background-color', '#999999');
							} else if (data.mpex_c5_new == 2) {
								$('td', row).eq(14).css('background-color', '#999999');
							} else if (data.mpex_c5_new == 4) {
								$('td', row).eq(14).css('background-color', '#999999');
							} else if (data.mpex_c5_new == 6) {
								$('td', row).eq(14).css('background-color', '#999999');
							} else if (data.mpex_c5_new == 7) {
								$('td', row).eq(14).css('background-color', '#999999');
							} else if (data.mpex_c5_new == 8) { //Pro Standard
								$('td', row).eq(14).css('background-color', '#7ABCF5');
							} else if (data.mpex_c5_new == 9) { //Pro Plus
								$('td', row).eq(14).css('background-color', '#379E8F');
							} else if (data.mpex_c5_new == 10) { //Manual Platinum
								$('td', row).eq(14).css('background-color', '#a7a6a100');
							} else if (data.mpex_c5_new == 11) { //Pro Platinum
								$('td', row).eq(14).css('background-color', '#287587');
							} else if (data.mpex_c5_new == 12) { //Pro Gold
								$('td', row).eq(14).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(14).removeAttr("style");
							}

							//Current Price - DL
							if (data.mpex_dl == 1) {
								$('td', row).eq(15).css('background-color', '#999999');
							} else if (data.mpex_dl == 2) {
								$('td', row).eq(15).css('background-color', '#999999');
							} else if (data.mpex_dl == 4) {
								$('td', row).eq(15).css('background-color', '#999999');
							} else if (data.mpex_dl == 6) {
								$('td', row).eq(15).css('background-color', '#999999');
							} else if (data.mpex_dl == 7) {
								$('td', row).eq(15).css('background-color', '#999999');
							} else if (data.mpex_dl == 8) { //Pro Standard
								$('td', row).eq(15).css('background-color', '#7ABCF5');
							} else if (data.mpex_dl == 9) { //Pro Plus
								$('td', row).eq(15).css('background-color', '#379E8F');
							} else if (data.mpex_dl == 10) { //Manual Platinum
								$('td', row).eq(15).css('background-color', '#a7a6a100');
							} else if (data.mpex_dl == 11) { //Pro Platinum
								$('td', row).eq(15).css('background-color', '#287587');
							} else if (data.mpex_dl == 12) { //Pro Gold
								$('td', row).eq(15).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(15).removeAttr("style");
							}

							//Scheduled Price Change - DL
							if (data.mpex_dl_new == 1) {
								$('td', row).eq(16).css('background-color', '#999999');
							} else if (data.mpex_dl_new == 2) {
								$('td', row).eq(16).css('background-color', '#999999');
							} else if (data.mpex_dl_new == 4) {
								$('td', row).eq(16).css('background-color', '#999999');
							} else if (data.mpex_dl_new == 6) {
								$('td', row).eq(16).css('background-color', '#999999');
							} else if (data.mpex_dl_new == 7) {
								$('td', row).eq(16).css('background-color', '#999999');
							} else if (data.mpex_dl_new == 8) { //Pro Standard
								$('td', row).eq(16).css('background-color', '#7ABCF5');
							} else if (data.mpex_dl_new == 9) { //Pro Plus
								$('td', row).eq(16).css('background-color', '#379E8F');
							} else if (data.mpex_dl_new == 10) { //Manual Platinum
								$('td', row).eq(16).css('background-color', '#a7a6a100');
							} else if (data.mpex_dl_new == 11) { //Pro Platinum
								$('td', row).eq(16).css('background-color', '#287587');
							} else if (data.mpex_dl_new == 12) { //Pro Gold
								$('td', row).eq(16).css('background-color', '#FFFF00');
							} else {
								$('td', row).eq(16).removeAttr("style");
							}

						}
					});
			});
	console.log('after')

	var main_table = document
		.getElementsByClassName("uir-outside-fields-table");
	var main_table2 = document.getElementsByClassName("uir-inline-tag");
	var main_table3 = document.getElementsByClassName("dataTables_scrollHead");
	var main_table4 = document
		.getElementsByClassName("dataTables_scrollHeadInner");

	for (var i = 0; i < main_table.length; i++) {
		main_table[i].style.width = "100%";
	}

	for (var i = 0; i < main_table3.length; i++) {
		main_table3[i].style.width = "100%";
	}

	for (var i = 0; i < main_table4.length; i++) {
		main_table4[i].style.width = "100%";
	}

	for (var i = 0; i < main_table2.length; i++) {
		// main_table2[i].style.position = "absolute";
		main_table2[i].style.width = "100%";
		main_table2[i].style.top = "275px";
		main_table2[i].style.left = "13%";
	}

	if (role == 1000) {
		$("#customer_wrapper").css({
			"padding-top": "300px"
		});
	} else {
		// $("#customer_wrapper").css({
		// "padding-top": "300px"
		// });
		$(".admin_section").css({
			"padding-top": "300px"
		});
	}

	$('#customer').css({
		"width": "100% !important"
	});

	$('.tablesorter ').css({
		"width": "100% !important"
	});

	$("#customer_length").css({
		"float": "right !important"
	});

	$("#customer_filter").css({
		"float": "left !important"
	});

}

$(document).on('click', '.instruction_button', function() {
	$("#customer_wrapper").css({
		"padding-top": "400px"
	});
	$(".admin_section").css({
		"padding-top": "400px"
	});
});

function onclick_back() {
	var params = {

	}
	params = JSON.stringify(params);
	var upload_url = baseURL +
		nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar',
			'customdeploy_sl_full_calender') + '&unlayered=T&zee=' +
		parseInt(nlapiGetFieldValue('zee')) + '&custparam_params=' +
		params;
	window.open(upload_url, "_self",
		"height=750,width=650,modal=yes,alwaysRaised=yes");
}

// On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function(e) {

	var zee = $(this).val();

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=995&deploy=1";

	url += "&zee=" + zee + "";

	window.location.href = url;
});

//On Change of Scheduled 1Kg Price
$(document).on("change", ".1kg_new", function(e) {
	
	var mpex_1kg = $(this).val();

	if (mpex_1kg == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_1kg == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_1kg == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_1kg == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_1kg == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_1kg == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_1kg == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_1kg == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_1kg == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_1kg == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled 3Kg Price
$(document).on("change", ".3kg_new", function(e) {

	var mpex_3kg = $(this).val();

	if (mpex_3kg == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_3kg == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_3kg == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_3kg == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_3kg == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_3kg == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_3kg == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_3kg == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_3kg == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_3kg == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled 5Kg Price
$(document).on("change", ".5kg_new", function(e) {

	var mpex_5kg = $(this).val();

	if (mpex_5kg == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_5kg == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_5kg == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_5kg == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_5kg == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_5kg == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_5kg == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_5kg == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_5kg == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_5kg == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled 500g Price
$(document).on("change", ".500g_new", function(e) {

	var mpex_500g = $(this).val();

	if (mpex_500g == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_500g == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_500g == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_500g == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_500g == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_500g == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_500g == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_500g == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_500g == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_500g == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled B4 price
$(document).on("change", ".b4_new", function(e) {

	var mpex_b4 = $(this).val();

	if (mpex_b4 == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_b4 == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_b4 == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_b4 == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_b4 == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_b4 == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_b4 == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_b4 == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_b4 == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_b4 == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled C5 Price
$(document).on("change", ".c5_new", function(e) {

	var mpex_c5 = $(this).val();

	if (mpex_c5 == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_c5 == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_c5 == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_c5 == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_c5 == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_c5 == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_c5 == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_c5 == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_c5 == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_c5 == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

//On Change of scheduled DL Price
$(document).on("change", ".dl_new", function(e) {

	var mpex_dl = $(this).val();

	if (mpex_dl == 1) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_dl == 2) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_dl == 4) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_dl == 6) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_dl == 7) {
		$(this).closest('td').css('background-color', '#999999');
	} else if (mpex_dl == 8) { //Pro Standard
		$(this).closest('td').css('background-color', '#7ABCF5');
	} else if (mpex_dl == 9) { //Pro Plus
		$(this).closest('td').css('background-color', '#379E8F');
	} else if (mpex_dl == 10) { //Manual Platinum
		$(this).closest('td').css('background-color', '#a7a6a100');
	} else if (mpex_dl == 11) { //Pro Platinum
		$(this).closest('td').css('background-color', '#287587');
	} else if (mpex_dl == 12) { //Pro Gold
		$(this).closest('td').css('background-color', '#FFFF00');
	} else {
		$(this).closest('td').removeAttr("style");
	}
});

function saveRecord() {

	var customer_id_elem = document.getElementsByClassName("customer_id");
	var mpex_1kg_elem = document.getElementsByClassName("1kg_new");
	var mpex_old_1kg_elem = document.getElementsByClassName("old_1kg_new");
	var mpex_3kg_elem = document.getElementsByClassName("3kg_new");
	var mpex_old_3kg_elem = document.getElementsByClassName("old_3kg_new");
	var mpex_5kg_elem = document.getElementsByClassName("5kg_new");
	var mpex_old_5kg_elem = document.getElementsByClassName("old_5kg_new");
	var mpex_500g_elem = document.getElementsByClassName("500g_new");
	var mpex_old_500g_elem = document.getElementsByClassName("old_500g_new");
	var mpex_b4_elem = document.getElementsByClassName("b4_new");
	var mpex_old_b4_elem = document.getElementsByClassName("old_b4_new");
	var mpex_c5_elem = document.getElementsByClassName("c5_new");
	var mpex_old_c5_elem = document.getElementsByClassName("old_c5_new");
	var mpex_dl_elem = document.getElementsByClassName("dl_new");
	var mpex_old_dl_elem = document.getElementsByClassName("old_dl_new");

	for (var x = 0; x < customer_id_elem.length; x++) {

		var update = false;

		if (mpex_1kg_elem[x].value != mpex_old_1kg_elem[x].value ||
			mpex_3kg_elem[x].value != mpex_old_3kg_elem[x].value ||
			mpex_5kg_elem[x].value != mpex_old_5kg_elem[x].value ||
			mpex_500g_elem[x].value != mpex_old_500g_elem[x].value ||
			mpex_b4_elem[x].value != mpex_old_b4_elem[x].value ||
			mpex_c5_elem[x].value != mpex_old_c5_elem[x].value ||
			mpex_dl_elem[x].value != mpex_old_dl_elem[x].value) {

			var customer_record = nlapiLoadRecord('customer',
				customer_id_elem[x].value);
			var mpex_invoicing = customer_record
				.getFieldValue('custentity_mpex_invoicing_cycle')

			if (mpex_1kg_elem[x].value != mpex_old_1kg_elem[x].value) {
				if (mpex_1kg_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_1kg_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_1kg_price_point_new',
						mpex_1kg_elem[x].value);
				}

			}
			if (mpex_3kg_elem[x].value != mpex_old_3kg_elem[x].value) {
				if (mpex_3kg_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_3kg_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_3kg_price_point_new',
						mpex_3kg_elem[x].value);
				}

			}
			if (mpex_5kg_elem[x].value != mpex_old_5kg_elem[x].value) {
				if (mpex_5kg_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_5kg_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_5kg_price_point_new',
						mpex_5kg_elem[x].value);
				}

			}
			if (mpex_500g_elem[x].value != mpex_old_500g_elem[x].value) {
				if (mpex_500g_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_500g_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_500g_price_point_new',
						mpex_500g_elem[x].value);
				}

			}
			if (mpex_b4_elem[x].value != mpex_old_b4_elem[x].value) {
				if (mpex_b4_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_b4_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_b4_price_point_new',
						mpex_b4_elem[x].value);
				}

			}
			if (mpex_c5_elem[x].value != mpex_old_c5_elem[x].value) {
				if (mpex_c5_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_c5_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_c5_price_point_new',
						mpex_c5_elem[x].value);
				}

			}
			if (mpex_dl_elem[x].value != mpex_old_dl_elem[x].value) {
				if (mpex_dl_elem[x].value == '0') {
					customer_record.setFieldValue(
						'custentity_mpex_dl_price_point_new', null);
				} else {
					customer_record.setFieldValue(
						'custentity_mpex_dl_price_point_new',
						mpex_dl_elem[x].value);
				}

			}
			if (isNullorEmpty(mpex_invoicing) || mpex_invoicing == 1) {
				customer_record.setFieldValue(
					'custentity_mpex_price_point_start_date', nextMonth());
			} else if (mpex_invoicing == 2) {
				customer_record.setFieldValue(
					'custentity_mpex_price_point_start_date', nextWeek());
			}

			customer_record.setFieldValue('custentity_mpex_price_date_update',
				getDate());
			nlapiSubmitRecord(customer_record)
		}
	}

	return true;

}

/**
 * [AddJavascript description] - Add the JS to the postion specified in the
 * page.
 * 
 * @param {[type]}
 *            jsname [description]
 * @param {[type]}
 *            pos [description]
 */
function AddJavascript(jsname, pos) {
	var tag = document.getElementsByTagName(pos)[0];
	var addScript = document.createElement('script');
	addScript.setAttribute('type', 'text/javascript');
	addScript.setAttribute('src', jsname);
	tag.appendChild(addScript);
}

/**
 * [AddStyle description] - Add the CSS to the position specified in the page
 * 
 * @param {[type]}
 *            cssLink [description]
 * @param {[type]}
 *            pos [description]
 */
function AddStyle(cssLink, pos) {
	var tag = document.getElementsByTagName(pos)[0];
	var addLink = document.createElement('link');
	addLink.setAttribute('type', 'text/css');
	addLink.setAttribute('rel', 'stylesheet');
	addLink.setAttribute('href', cssLink);
	tag.appendChild(addLink);
}

function getDate() {
	var date = new Date();
	// if (date.getHours() > 6) {
	// date = nlapiAddDays(date, 1);
	// }
	date = nlapiDateToString(date);
	return date;
}

/**
 * 3rd day of next month
 * 
 * @return {String}
 */
function nextMonth() {
	var now = new Date();
	if (now.getMonth() == 11) {
		var current = new Date(now.getFullYear() + 1, 0, 3);
	} else {
		var current = new Date(now.getFullYear(), now.getMonth() + 1, 3);
	}

	var date = nlapiDateToString(current);
	return date;
}

/**
 * Start of next week
 * 
 * @return {String}
 */
function nextWeek() {
	var curr = new Date; // get current date
	var first = curr.getDate() - curr.getDay(); // First day is the day of the
	// month - the day of the week
	var last = first + 6; // last day is the first day + 6

	var firstday = new Date(curr.setDate(first));
	var lastday = new Date(curr.setDate(last));

	lastday = nlapiAddDays(lastday, 2);

	var date = nlapiDateToString(lastday);
	return date;
}