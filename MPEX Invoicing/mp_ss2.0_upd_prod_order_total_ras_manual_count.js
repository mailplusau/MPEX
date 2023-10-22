/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2023-09-20 10:15:02
 * @Last modified by:   ankithravindran
 * @Last modified time 2023-09-20 10:14:23
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

            //NetSuite Search: MP Product Order - Calculate Total RAS & Manual Count
            var prodOrdersUpdateTotalRASManualCountSearch = search.load({
                id: 'customsearch_pord_order_upd_ras_manual',
                type: 'customrecord_mp_ap_product_order'
            });
            var prodOrdersUpdateTotalRASManualCountSearchReseultSet = prodOrdersUpdateTotalRASManualCountSearch.run();

            var prodOrderInternalIdList = [];
            var oldCustomerInternalId = null;
            var count = 0;
            var totalManualBarcodeCount = 0;
            var totalRAS1Count = 0;
            var totalRAS2Count = 0;
            var totalRAS3Count = 0;

            prodOrdersUpdateTotalRASManualCountSearchReseultSet.each(function (searchResult) {

                var prodOrderInternalId = searchResult.getValue('internalid');
                var customerInternalId = searchResult.getValue('custrecord_ap_order_customer');

                var ras1Count = (searchResult.getValue('custrecord_ras_teir1_barcode_count'));
                var ras2Count = (searchResult.getValue('custrecord_ras_teir2_barcode_count'));
                var ras3Count = (searchResult.getValue('custrecord_ras_teir3_barcode_count'));
                var manualCount = (searchResult.getValue('custrecord_manual_barcode_count'));

                if (isNullorEmpty(ras1Count)) {
                    ras1Count = 0
                } else {
                    ras1Count = parseInt(ras1Count);
                }

                if (isNullorEmpty(ras2Count)) {
                    ras2Count = 0
                } else {
                    ras2Count = parseInt(ras2Count);
                }

                if (isNullorEmpty(ras3Count)) {
                    ras3Count = 0
                } else {
                    ras3Count = parseInt(ras3Count);
                }

                if (isNullorEmpty(manualCount)) {
                    manualCount = 0
                } else {
                    manualCount = parseInt(manualCount);
                }

                if (oldCustomerInternalId != null && oldCustomerInternalId != customerInternalId) {

                    log.debug({
                        title: 'prodOrderInternalIdList.length',
                        details: prodOrderInternalIdList.length
                    })

                    for (var x = 0; x < prodOrderInternalIdList.length; x++) {

                        log.debug({
                            title: 'prodOrderInternalIdList[' + x + ']',
                            details: prodOrderInternalIdList[x]
                        })

                        var productOrderRecord = record.load({
                            type: 'customrecord_mp_ap_product_order',
                            id: prodOrderInternalIdList[x]
                        });

                        productOrderRecord.setValue({
                            fieldId: 'custrecord_total_ras_manual_count_calc',
                            value: 1
                        });
                        productOrderRecord.setValue({
                            fieldId: 'custrecord_total_manual_barcode_count',
                            value: totalManualBarcodeCount
                        });
                        productOrderRecord.setValue({
                            fieldId: 'custrecord_total_ras_teir1_barcode_count',
                            value: totalRAS1Count
                        });
                        productOrderRecord.setValue({
                            fieldId: 'custrecord_total_ras_teir2_barcode_count',
                            value: totalRAS2Count
                        });
                        productOrderRecord.setValue({
                            fieldId: 'custrecord_total_ras_teir3_barcode_count',
                            value: totalRAS3Count
                        });

                        productOrderRecord.save();
                    }

                    totalManualBarcodeCount = 0;
                    totalRAS1Count = 0;
                    totalRAS2Count = 0;
                    totalRAS3Count = 0;

                    prodOrderInternalIdList = [];
                }

                prodOrderInternalIdList.push(prodOrderInternalId);
                totalManualBarcodeCount = totalManualBarcodeCount + manualCount;
                totalRAS1Count = totalRAS1Count + ras1Count;
                totalRAS2Count = totalRAS2Count + ras2Count;
                totalRAS3Count = totalRAS3Count + ras3Count;

                count++;
                oldCustomerInternalId = customerInternalId
                return true;
            });

            if (count > 0) {
                for (var x = 0; x < prodOrderInternalIdList.length; x++) {
                    var productOrderRecord = record.load({
                        type: 'customrecord_mp_ap_product_order',
                        id: prodOrderInternalIdList[x]
                    });

                    productOrderRecord.setValue({
                        fieldId: 'custrecord_total_ras_manual_count_calc',
                        value: 1
                    });
                    productOrderRecord.setValue({
                        fieldId: 'custrecord_total_manual_barcode_count',
                        value: totalManualBarcodeCount
                    });
                    productOrderRecord.setValue({
                        fieldId: 'custrecord_total_ras_teir1_barcode_count',
                        value: totalRAS1Count
                    });
                    productOrderRecord.setValue({
                        fieldId: 'custrecord_total_ras_teir2_barcode_count',
                        value: totalRAS2Count
                    });
                    productOrderRecord.setValue({
                        fieldId: 'custrecord_total_ras_teir3_barcode_count',
                        value: totalRAS3Count
                    });

                    productOrderRecord.save();
                }
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
