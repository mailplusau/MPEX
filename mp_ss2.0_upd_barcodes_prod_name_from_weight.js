/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-12-24T08:26:00+11:00
 * @Description: Update Barcodes with ther product name if the weight field is filled. 
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record'],
    function (task, email, runtime, search, record) {
        function execute(context) {

            //Search: Barcodes - No Product
            var barcodesNoProdNameSearch = search.load({
                id: 'customsearch_barcodes_no_product',
                type: 'customrecord_customer_product_stock'
            });

            var oldCustomerInternalID = null;
            var count = 0;
            var reschedule = false;

            /*
                552	Prepaid MailPlus Express - 1Kg (10-pack)	
                553	Prepaid MailPlus Express - 3Kg (10-pack)	
                638	Prepaid MailPlus Express - 500g (10-pack)	
                554	Prepaid MailPlus Express - 5Kg (10-pack)	
                550	Prepaid MailPlus Express - B4 (10-pack)
                551	Prepaid MailPlus Express - C5 (10-pack)
                549	Prepaid MailPlus Express - DL (10-pack)
             */

            barcodesNoProdNameSearch.run().each(function (result) {

                var barcodeInternalId = result.getValue({
                    name: 'internalid'
                });

                var prodWeight = parseInt(result.getValue({
                    name: 'custrecord_weight'
                }));

                var barcodeRecord = record.load({
                    type: 'customrecord_customer_product_stock',
                    id: barcodeInternalId
                });

                if (prodWeight == 500) {
                    barcodeRecord.setValue({
                        fieldId: 'custrecord_cust_stock_prod_name',
                        value: 638
                    });
                } else if (prodWeight == 1000) {
                    barcodeRecord.setValue({
                        fieldId: 'custrecord_cust_stock_prod_name',
                        value: 552
                    });
                } else if (prodWeight == 3000) {
                    barcodeRecord.setValue({
                        fieldId: 'custrecord_cust_stock_prod_name',
                        value: 553
                    });
                } else if (prodWeight == 5000) {
                    barcodeRecord.setValue({
                        fieldId: 'custrecord_cust_stock_prod_name',
                        value: 554
                    });
                }

                barcodeRecord.save({
                    enableSourcing: true,
                });

                count++;
                return true;

            });

        }
        /*
         * PURPOSE : CHECK IF PARAM IS NULL OR EMPTY BASED ON BELOW CRITERIAS
         *  PARAMS :  -
         * RETURNS :  BOOL
         *   NOTES :
         */

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
                undefined || strVal == 'undefined' || strVal == '- None -' ||
                strVal ==
                '0');
        }

        return {
            execute: execute
        };
    }
);