/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 * @Author: Ankith Ravindran <ankithravindran>
 * @Date:   2021-12-24T08:26:00+11:00
 * @Description: Update barcodes product name field using the Product Pricing
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record'],
    function (task, email, runtime, search, record) {
        function execute(context) {

            //Search: Barcodes - Prepaid Product Name - Update
            var updateBarcodesProductName = search.load({
                id: 'customsearch_barcodes_prepaid_prod_nam',
                type: 'customrecord_customer_product_stock'
            });

            updateBarcodesProductName.run().each(function (result) {

                var custProdStockInternalId = result.getValue({
                    name: 'internalid'
                });

                var custProdStockCustomerInternalId = result.getValue({
                    name: 'custrecord_cust_prod_stock_customer'
                });

                var custProdStockProductNameText = result.getText({
                    name: 'custrecord_cust_stock_prod_name'
                });

                var productPricingInternalId = result.getValue({
                    name: 'custrecord_cust_prod_pricing'
                });

                log.debug({ title: 'custProdStockInternalId', details: custProdStockInternalId });
                log.debug({ title: 'custProdStockCustomerInternalId', details: custProdStockCustomerInternalId });
                log.debug({ title: 'custProdStockProductNameText', details: custProdStockProductNameText });
                log.debug({ title: 'productPricingInternalId', details: productPricingInternalId });

                var splitProductNameTextArray = custProdStockProductNameText.split(' - ');
                var productNameWeight = splitProductNameTextArray[1].split(' (');

                productNameWeight = productNameWeight[0].toLowerCase();

                var productPricingFieldIdText = 'custrecord_prod_pricing_';

                var productPricingFieldId = productPricingFieldIdText + productNameWeight;


                log.debug({ title: 'productNameWeight', details: productNameWeight });
                log.debug({ title: 'productPricingFieldId', details: productPricingFieldId });

                var prodPricingRecord = record.load({
                    type: 'customrecord_product_pricing',
                    id: productPricingInternalId
                });

                var productPricingItemText = prodPricingRecord.getText({
                    fieldId: productPricingFieldId
                });

                log.debug({ title: 'productPricingItemText', details: productPricingItemText });

                var searchAPItems = search.load({
                    type: 'customrecord_ap_item',
                    id: 'customsearch6413'
                });


                searchAPItems.filters.push(search.createFilter({
                    name: 'name',
                    join: null,
                    operator: 'is',
                    values: productPricingItemText,
                }));

                var result_set = searchAPItems.run().getRange({ start: 0, end: 1 });
                var apItemInternalID = null;

                log.debug({ title: 'result_set.length', details: result_set.length });

                if (result_set.length > 0) {
                    apItemInternalID = result_set[0].getValue('internalid');
                    
                }

                if (!isNullorEmpty(apItemInternalID)) {
                    var custProdStockRecord = record.load({
                        type: 'customrecord_customer_product_stock',
                        id: custProdStockInternalId
                    });
    
                    custProdStockRecord.setValue({
                        fieldId: 'custrecord_cust_stock_prod_name',
                        value: apItemInternalID
                    });
    
    
                    custProdStockRecord.save({
                        enableSourcing: true,
                    });
    
                }
                
                var reschedule = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss2_upd_prod_name',
                    deploymentId: 'customdeploy2',
                    params: null
                });

                log.debug({ title: 'Attempting: Rescheduling Script', details: reschedule });
                var reschedule_id = reschedule.submit();

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