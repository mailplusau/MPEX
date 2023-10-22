/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2023-09-20 10:14:53
 * @Last modified by:   ankithravindran
 * @Last modified time: 2023-09-20 10:14:46
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task',
    'N/currentRecord', 'N/format', 'N/https', 'N/email', 'N/url'
],
    function (runtime, search, record, log, task, currentRecord, format, https,
        email, url) {
        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {

            //NetSuite Search: MP Barcodes - Product Order Update Manual Count
            var barcodesProdOrderUpdateManualCountSearch = search.load({
                id: 'customsearch_prod_order_upd_manual_count',
                type: 'customrecord_customer_product_stock'
            });
            var barcodesProdOrderUpdateManualCountSearchResultSet = barcodesProdOrderUpdateManualCountSearch.run();

            var oldProdOrderInternalId = null;
            var count = 0;
            var manualBarcodeCount = 0;

            barcodesProdOrderUpdateManualCountSearchResultSet.each(function (searchResult) {

                var prodOrderInternalId = searchResult.getValue('custrecord_prod_stock_prod_order');

                if (oldProdOrderInternalId != null && oldProdOrderInternalId != prodOrderInternalId) {
                    log.debug({
                        title: 'manualBarcodeCount',
                        details: manualBarcodeCount
                    })
                    var productOrderRecord = record.load({
                        type: 'customrecord_mp_ap_product_order',
                        id: oldProdOrderInternalId
                    });

                    productOrderRecord.setValue({
                        fieldId: 'custrecord_manual_barcode_count',
                        value: manualBarcodeCount
                    });

                    productOrderRecord.save();

                    manualBarcodeCount = 0;
                }


                manualBarcodeCount++;
                count++;
                oldProdOrderInternalId = prodOrderInternalId;
                return true;
            });

            if (count > 0) {
                log.debug({
                    title: 'manualBarcodeCount',
                    details: manualBarcodeCount
                })
                var productOrderRecord = record.load({
                    type: 'customrecord_mp_ap_product_order',
                    id: oldProdOrderInternalId
                });

                productOrderRecord.setValue({
                    fieldId: 'custrecord_manual_barcode_count',
                    value: manualBarcodeCount
                });

                productOrderRecord.save();
            }


        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
                undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    }
);
