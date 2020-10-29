/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/format', 'N/https'],
	function(task, email, runtime, search, record, format, https) {
		function execute(context) {

			var prepaidMPEXProdOrders = search.load({
				id: 'customsearch_mpex_prepaid_upd_line_item'
			});

			prepaidMPEXProdOrders.run().each(function(searchResult) {

				var prodOrderInternalID = searchResult.getValue({
					name: 'internalid'
				});

				var lineItemInternalID = searchResult.getValue({
					name: "internalid",
					join: "CUSTRECORD_AP_PRODUCT_ORDER",
				});

				var customerMPEX1kgPricePoint = searchResult.getValue({
					name: "custentity_mpex_1kg_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var customerMPEX3kgPricePoint = searchResult.getValue({
					name: "custentity_mpex_3kg_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var customerMPEX500gPricePoint = searchResult.getValue({
					name: "custentity_mpex_500g_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var customerMPEX5kgPricePoint = searchResult.getValue({
					name: "custentity_mpex_5kg_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});
				var customerMPEXB4PricePoint = searchResult.getValue({
					name: "custentity_mpex_b4_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var customerMPEXC5PricePoint = searchResult.getValue({
					name: "custentity_mpex_c5_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var customerMPEXDLPricePoint = searchResult.getValue({
					name: "custentity_mpex_dl_price_point",
					join: "CUSTRECORD_AP_ORDER_CUSTOMER"
				});

				var lineItemRecord = record.load({
					type: 'customrecord_ap_stock_line_item'
				});

				if (customerMPEX5kgPricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 642
					});
				}

				if (customerMPEX3kgPricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 640
					});
				}

				if (customerMPEX1kgPricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 639
					});
				}

				if (customerMPEX500gPricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 641
					});
				}

				if (customerMPEXB4PricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 643
					});
				}

				if (customerMPEXC5PricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 644
					});
				}

				if (customerMPEXDLPricePoint == 2) {
					lineItemRecord.setValue({
						fieldId: 'custrecord_ap_stock_line_item',
						value: 645
					});

				}

				lineItemRecord.save();

				return true;
			})

		}
		return {
			execute: execute
		};
	}
);