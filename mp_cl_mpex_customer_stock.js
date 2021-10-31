/**
 * Module Description
 TEST
 *
 * NSVersion    Date            			Author
 * 1.00       	2019-11-16 08:09:51   		Ankith
 *
 * Description:
 *
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-10-06 11:05:13
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



var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

//To show loader while the page is laoding
$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");;
});

var table;

/**
 * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page.
 */
function pageInit() {

    console.log(nlapiGetFieldValue('zee'));

    //Search: Product Stock - Customer Level
    var prodStockSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch_prod_stock_refill_custome_2');

    var addFilterExpression = new nlobjSearchFilter('partner', 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER', 'anyof', parseInt(nlapiGetFieldValue('zee')));
    prodStockSearch.addFilter(addFilterExpression);

    var resultSetCustomer = prodStockSearch.runSearch();
    var old_customer_id;
    var old_company_name;

    var old_mpen_total_stock;
    var old_mpen_min_float;
    var old_mpet_total_stock;
    var old_mpet_min_float;
    var old_mpef_total_stock;
    var old_mpef_min_float;
    var old_mpeb_total_stock;
    var old_mpeb_min_float;
    var old_mpec_total_stock;
    var old_mpec_min_float;
    var old_mped_total_stock;
    var old_mped_min_float;
    var old_mpeg_min_float;
    var old_mpeg_total_stock;

    var count = 0;
    var customer_count = 0;



    var dataSet = '{"data":[';

    resultSetCustomer.forEachResult(function(searchResult) {

        var custid = searchResult.getValue("custrecord_cust_prod_stock_customer", null, "GROUP");
        var zee_id = searchResult.getValue("partner", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        var companyname = searchResult.getText("custrecord_cust_prod_stock_customer", null, "GROUP");
        var companyname_text = searchResult.getValue("companyname", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");

        var mpen_total_stock = searchResult.getValue("custentity_mpen", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpen_total_stock)) {
            mpen_total_stock = 0;
        }
        var mpen_min_float = searchResult.getValue("custentity_mpex_1kg_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpen_min_float)) {
            mpen_min_float = 0;
        }

        var mpet_total_stock = searchResult.getValue("custentity_mpet", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpet_total_stock)) {
            mpet_total_stock = 0;
        }
        var mpet_min_float = searchResult.getValue("custentity_mpex_3kg_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpet_min_float)) {
            mpet_min_float = 0;
        }

        var mpef_total_stock = searchResult.getValue("custentity_mpef", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpef_total_stock)) {
            mpef_total_stock = 0;
        }
        var mpef_min_float = searchResult.getValue("custentity_mpex_5kg_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpef_min_float)) {
            mpef_min_float = 0;
        }

        var mpeb_total_stock = searchResult.getValue("custentity_mpeb", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpeb_total_stock)) {
            mpeb_total_stock = 0;
        }
        var mpeb_min_float = searchResult.getValue("custentity_mpex_b4_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpeb_min_float)) {
            mpeb_min_float = 0;
        }

        var mpec_total_stock = searchResult.getValue("custentity_mpec", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpec_total_stock)) {
            mpec_total_stock = 0;
        }
        var mpec_min_float = searchResult.getValue("custentity_mpex_c5_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpec_min_float)) {
            mpec_min_float = 0;
        }

        var mped_total_stock = searchResult.getValue("custentity_mped", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mped_total_stock)) {
            mped_total_stock = 0;
        }
        var mped_min_float = searchResult.getValue("custentity_mpex_dl_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mped_min_float)) {
            mped_min_float = 0;
        }

        var mpeg_total_stock = searchResult.getValue("custentity_mpeg", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpeg_total_stock)) {
            mpeg_total_stock = 0;
        }
        var mpeg_min_float = searchResult.getValue("custentity_mpex_500g_float", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        if (isNullorEmpty(mpeg_min_float)) {
            mpeg_min_float = 0;
        }


        dataSet += '{"cust_id":"' + custid + '","companyname_text":"' + companyname_text + '", "company_name":"' + companyname + '","mpen_stock": "' + mpen_total_stock + '","mpen_min": "' + mpen_min_float + '","mpet_stock": "' + mpet_total_stock + '","mpet_min": "' + mpet_min_float + '","mpef_stock": "' + mpef_total_stock + '","mpef_min": "' + mpef_min_float + '","mpeb_stock": "' + mpeb_total_stock + '","mpeb_min": "' + mpeb_min_float + '","mpec_stock": "' + mpec_total_stock + '","mpec_min": "' + mpec_min_float + '","mped_stock": "' + mped_total_stock + '","mped_min": "' + mped_min_float + '","mpeg_stock": "' + mpeg_total_stock + '","mpeg_min": "' + mpeg_min_float + '"},';



        count++;
        return true;
    });



    if (count > 0) {
        dataSet = dataSet.substring(0, dataSet.length - 1);
        console.log(dataSet);
        dataSet += ']}';



    } else {

        dataSet += ']}';
    }

    console.log(dataSet);
    var parsedData = JSON.parse(dataSet);
    console.log(parsedData.data);

    // AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

    //JQuery to sort table based on click of header. Attached library
    $(document).ready(function() {
        table = $("#customer").DataTable({
            "data": parsedData.data,
            "columns": [
                // {
                // 	"data": null,
                // 	"render": function(data, type, row) {
                // 		return '<button type="button" data-custid="' + data.cust_id + '" class="edit_customer form-control btn-xs btn-warning " ><span class="span_class glyphicon glyphicon-pencil"></span></button>';
                // 	}
                // },
                {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<p><b>' + data.companyname_text + '</b><p><input type="hidden" class="form-control customer_id text-center" value="' + data.cust_id + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control 5kg_min text-center " value="' + data.mpef_min + '" old_value="' + data.mpef_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpef_min) > parseInt(data.mpef_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpef_stock + '" readonly>';
                        } else if (parseInt(data.mpef_min) == parseInt(data.mpef_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpef_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpef_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control 3kg_min text-center" value="' + data.mpet_min + '" old_value="' + data.mpet_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpet_min) > parseInt(data.mpet_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpet_stock + '" readonly>';
                        } else if (parseInt(data.mpet_min) == parseInt(data.mpet_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpet_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpet_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control 1kg_min text-center" value="' + data.mpen_min + '" old_value="' + data.mpen_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpen_min) > parseInt(data.mpen_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpen_stock + '" readonly>';
                        } else if (parseInt(data.mpen_min) == parseInt(data.mpen_stock) && parseInt(data.mpen_min) != 0 && parseInt(data.mpen_stock) != 0) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpen_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpen_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control 500g_min text-center " value="' + data.mpeg_min + '" old_value="' + data.mpeg_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpeg_min) > parseInt(data.mpeg_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpeg_stock + '" readonly>';
                        } else if (parseInt(data.mpeg_min) == parseInt(data.mpeg_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpeg_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpeg_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control b4_min text-center" value="' + data.mpeb_min + '" old_value="' + data.mpeb_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpeb_min) > parseInt(data.mpeb_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpeb_stock + '" readonly>';
                        } else if (parseInt(data.mpeb_min) == parseInt(data.mpeb_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpeb_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpeb_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control c5_min text-center" value="' + data.mpec_min + '" old_value="' + data.mpec_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mpec_min) > parseInt(data.mpec_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mpec_stock + '" readonly>';
                        } else if (parseInt(data.mpec_min) == parseInt(data.mpec_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mpec_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mpec_stock + '" readonly>';
                        }

                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        return '<input type="number" class="form-control dl_min text-center" value="' + data.mped_min + '" old_value="' + data.mped_min + '">';
                    }
                }, {
                    "data": null,
                    "render": function(data, type, row) {
                        if (parseInt(data.mped_min) > parseInt(data.mped_stock)) {
                            return '<input type="number" class="form-control text-center has-error" style="color:red; border: solid !important;" value="' + data.mped_stock + '" readonly>';
                        } else if (parseInt(data.mped_min) == parseInt(data.mped_stock)) {
                            return '<input type="number" class="form-control text-center has-warning" style="color:orange; border: solid !important;" value="' + data.mped_stock + '" readonly>';
                        } else {
                            return '<input type="number" class="form-control text-center" style="color:green;" value="' + data.mped_stock + '" readonly>';
                        }

                    }
                }
            ],
            "order": [
                [1, 'asc']
            ],
            "pageLength": 100,
            "scrollY": "1000px",
            "fixedHeader": {
                "header": true
            }
        });
    });
    console.log('after')

    var main_table = document.getElementsByClassName("uir-outside-fields-table");
    var main_table2 = document.getElementsByClassName("uir-inline-tag");

    console.log(main_table)
    console.log(main_table2)


    for (var i = 0; i < main_table.length; i++) {
        // main_table[i].style.width = "50%";
    }

    for (var i = 0; i < main_table2.length; i++) {
        // main_table2[i].style.position = "absolute";
        // main_table2[i].style.width = "75%";
        main_table2[i].style.top = "275px";
        main_table2[i].style.left = "13%";
    }

    if (role == 1000) {
        $("#customer_wrapper").css({
            "padding-top": "300px"
        });
    } else {
        // $("#customer_wrapper").css({
        // 	"padding-top": "300px"
        // });
        $(".admin_section").css({
            "padding-top": "300px"
        });
    }

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
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T&zee=' + parseInt(nlapiGetFieldValue('zee')) + '&custparam_params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}


//On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function(e) {

    var zee = $(this).val();

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=881&deploy=1";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

function saveRecord() {

    var customer_id_elem = document.getElementsByClassName("customer_id");
    var mpen_elem = document.getElementsByClassName("1kg_min");
    var mpet_elem = document.getElementsByClassName("3kg_min");
    var mpef_elem = document.getElementsByClassName("5kg_min");
    var mpeb_elem = document.getElementsByClassName("b4_min");
    var mpec_elem = document.getElementsByClassName("c5_min");
    var mped_elem = document.getElementsByClassName("dl_min");
    var mpeg_elem = document.getElementsByClassName("500g_min");


    for (var x = 0; x < customer_id_elem.length; x++) {

        var update = false;

        if (mpen_elem[x].value != mpen_elem[x].getAttribute('old_value') || mpet_elem[x].value != mpet_elem[x].getAttribute('old_value') || mpef_elem[x].value != mpef_elem[x].getAttribute('old_value') || mpeb_elem[x].value != mpeb_elem[x].getAttribute('old_value') || mpec_elem[x].value != mpec_elem[x].getAttribute('old_value') || mped_elem[x].value != mped_elem[x].getAttribute('old_value') || mpeg_elem[x].value != mpeg_elem[x].getAttribute('old_value')) {

            var customer_record = nlapiLoadRecord('customer', customer_id_elem[x].value);

            customer_record.setFieldValue('custentity_mpex_1kg_float', mpen_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_3kg_float', mpet_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_5kg_float', mpef_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_b4_float', mpeb_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_c5_float', mpec_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_dl_float', mped_elem[x].value);
            customer_record.setFieldValue('custentity_mpex_500g_float', mpeg_elem[x].value);

            nlapiSubmitRecord(customer_record)
        }

    }

    return true;

}


/**
 * [AddJavascript description] - Add the JS to the postion specified in the page.
 * @param {[type]} jsname [description]
 * @param {[type]} pos    [description]
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
 * @param {[type]} cssLink [description]
 * @param {[type]} pos     [description]
 */
function AddStyle(cssLink, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addLink = document.createElement('link');
    addLink.setAttribute('type', 'text/css');
    addLink.setAttribute('rel', 'stylesheet');
    addLink.setAttribute('href', cssLink);
    tag.appendChild(addLink);
}
