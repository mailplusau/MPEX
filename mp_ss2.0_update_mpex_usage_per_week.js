/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record'],
	function(task, email, runtime, search, record) {
		function execute(context) {


			//Search: MPEX Usage - Per Week (Update Customer)
			var mpexUsagePerWeek = search.load({
				id: 'customsearch_mpex_usage_per_week_2'
			});

			var oldCustomerInternalID = null;
			var count = 0;
			var reschedule = false;
			var data = '{';

			mpexUsagePerWeek.run().each(function(result) {


				var customerInternalID = result.getValue({
					name: 'internalid',
					join: 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER',
					summary: "GROUP"
				});

				var customerName = result.getValue({
					name: 'companyname',
					join: 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER',
					summary: "GROUP"
				});

				var customerID = result.getValue({
					name: 'entityid',
					join: 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER',
					summary: "GROUP"
				});

				var zeeName = result.getValue({
					name: 'custrecord_cust_prod_stock_zee',
					join: null,
					summary: "GROUP"
				});

				var dateStockUsedWeek = result.getValue({
					name: 'custrecord_cust_date_stock_used',
					join: null,
					summary: "GROUP"
				});

				var usageCount = result.getValue({
					name: 'name',
					join: null,
					summary: "COUNT"
				});

				if (count == 0) {
					data += '"Customer ID" : "' + customerID + '",';
					data += '"Customer Name" : "' + customerName + '",';
					data += '"Franchisee" : "' + zeeName + '",';
					data += '"Usage": [';
				}

				if (oldCustomerInternalID != null && oldCustomerInternalID != customerInternalID) {
					data = data.substring(0, data.length - 1);
					data += ']}';

					log.audit({
						title: 'data',
						details: data
					});

					var customerRecord = record.load({
						type: record.Type.CUSTOMER,
						id: oldCustomerInternalID
					});

					customerRecord.setValue({
						fieldId: 'custentity_actual_mpex_weekly_usage',
						value: data
					});

					customerRecord.setValue({
						fieldId: 'custentity_mpex_weekly_usage_calculated',
						value: 1
					});

					customerRecord.save();

					// reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
					var scriptTask = task.create({
						taskType: task.TaskType.SCHEDULED_SCRIPT,
						scriptId: 'customscript_ss2_mpex_weekly_usage_',
						deploymentId: 'customdeploy2',
						params: null
					});
					var scriptTaskId = scriptTask.submit();

					oldCustomerInternalID = null;

					return false;

				} else {
					data += '{';
					data += '"Week Used" : "' + dateStockUsedWeek + '",';
					data += '"Count" : "' + usageCount + '"';
					data += '},';
				}


				oldCustomerInternalID = customerInternalID;
				count++;
				return true;

			});


			if (count > 0 && oldCustomerInternalID != null) {
				data = data.substring(0, data.length - 1);
				data += ']}';
				var customerRecord = record.load({
					type: record.Type.CUSTOMER,
					id: oldCustomerInternalID
				});

				customerRecord.setValue({
					fieldId: 'custentity_actual_mpex_weekly_usage',
					value: data
				});

				customerRecord.setValue({
					fieldId: 'custentity_mpex_weekly_usage_calculated',
					value: 1
				});

				customerRecord.save();
			} else {
				data += ']}';
			}

		}
		return {
			execute: execute
		};
	}
);