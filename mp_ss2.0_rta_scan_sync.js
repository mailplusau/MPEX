/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/format', 'N/https'],
	function(task, email, runtime, search, record, format, https) {
		function execute(context) {
			var todayDate = new Date();

			log.audit({
				title: 'todayDate',
				details: todayDate
			});

			//To get todays date
			var today = format.format({
				value: todayDate,
				type: format.Type.DATE
			});

			log.audit({
				title: 'today',
				details: today
			});

			var tempTodayDate = today.split('/');

			// var temp = tempTodayDate.split('-');
			var today = tempTodayDate[0] + '-' + tempTodayDate[1] + '-' + tempTodayDate[2];

			log.audit({
				title: 'today',
				details: today
			});

			var scanJSONSearch = search.load({
				id: 'customsearch_scan_json'
			});

			scanJSONSearch.filters.push(search.createFilter({
				name: 'name',
				join: null,
				operator: search.Operator.STARTSWITH,
				values: today
			}));
			scanJSONSearch.filters.push(search.createFilter({
				name: 'custrecord_scan_josn_sync',
				join: null,
				operator: search.Operator.IS,
				values: 2
			}));
			scanJSONSearch.filters.push(search.createFilter({
				name: 'isinactive',
				join: null,
				operator: search.Operator.IS,
				values: "F"
			}));

			var scan_json_record_id;

			savedNoteSearch.run().each(function(searchResult) {

				var scan_json_record_id = searchResult.getValue({
					name: 'internalid'
				});

				var scan_json_record_name = searchResult.getValue({
					name: "name"
				});

				var scan_json_record = record.load({
					type: 'customrecord_scan_json',
					id: scan_json_record_id
				});

				var body = scan_json_record.getValue({
					fieldId: 'custrecord_json'
				});

				var body_2 = scan_json_record.getValue({
					fieldId: 'custrecord_scan_json_2'
				});

				if (body_2 == "") {
					var todays_scans = JSON.parse(body);
					var scans = todays_scans.scans;
				} else {
					var todays_scans = JSON.parse(body_2);
					var scans = todays_scans.scans;
				}

				do {
					var x = (scans.length - 1);
					var usage_loopstart_cust = ctx.getRemainingUsage();

					if (usage_loopstart_cust < 500) {
						var scan_json_2 = '{ "scans": ' + JSON.stringify(scans) + '}';
						var scan_json_record = record.load({
							typr: 'customrecord_scan_json',
							id: scan_json_record_id
						});
						scan_json_record.setValue({
							fieldId: 'custrecord_scan_json_2',
							value: scan_json_2
						});
						scan_json_record.save();

						reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
						nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
						if (reschedule == 'false') {

							return false;
						}
					}
					var barcode = scans[x].barcode.toUpperCase();

					var customer_id = scans[x].customer_ns_id;
					// var zee_id = scans[x].zee_ns_id;
					var rta_id = scans[x].id;
					var invoiceable = scans[x].invoiceable;
					var scan_type = scans[x].scan_type.toLowerCase();
					var operator_id = scans[x].operator_ns_id;
					var operator_record = record.load({
						type: 'customrecord_operator',
						id: operator_id
					});
					var zee_id = operator_record.getValue({
						fieldId: 'custrecord_operator_franchisee'
					});

					var updated_at = scans[x].updated_at;
					var deleted = scans[x].deleted;
					updated_at = updated_at.split("T");
					var time_updated_at = updated_at[1];
					time_updated_at = time_updated_at.split(".");
					time_updated_at = onTimeChange(time_updated_at[0]);
					var updated_at = updated_at[0];
					var save_barcode = true;

					log.audit({
						title: 'barcode usage',
						details: barcode
					});

					var barcode_beg = barcode.slice(0, 4);

					updated_at = updated_at.split("-");

					updated_at = nlapiStringToDate(updated_at[2] + '/' + updated_at[1] + '/' + updated_at[0]);

					var productStockSearch = search.load({
						id: 'customsearch_rta_product_stock'
					});

					productStockSearch.filters.push(search.createFilter({
						name: 'name',
						join: null,
						operator: search.Operator.IS,
						values: barcode
					}));

					productStockSearch.filters.push(search.createFilter({
						name: 'isinactive',
						join: null,
						operator: search.Operator.IS,
						values: "F"
					}));

					productStockSearch.run().each(function(searchResult) {

						var customer_prod_stock_id = searchResult.getValue({
							name: 'internalid'
						});
						return true;
					});

				} while (scans.length > 0);


				if (scans.length == 0) {
					scan_json_record.setValue({
						fieldId: 'custrecord_scan_josn_sync',
						value: 1
					});
					scan_json_record.save();
				}

				return true;
			})
		}
		return {
			execute: execute
		};
	}
);

function onTimeChange(value) {

	if (value != "") {
		var timeSplit = value.split(':'),
			hours,
			minutes,
			meridian;
		hours = timeSplit[0];
		minutes = timeSplit[1];
		if (hours > 12) {
			meridian = 'PM';
			hours -= 12;
		} else if (hours < 12) {
			meridian = 'AM';
			if (hours == 0) {
				hours = 12;
			}
		} else {
			meridian = 'PM';
		}
		return (hours + ':' + minutes + ' ' + meridian);
	}
}

function convertTo24Hour(time) {
	var hours_string = (time.substr(0, 2));
	var hours = parseInt(time.substr(0, 2));
	if (time.indexOf('AM') != -1 && hours == 12) {
		time = time.replace('12', '0');
	}
	// if (time.indexOf('AM') != -1 && hours < 10) {
	// 	time = time.replace(hours, ('0' + hours));
	// }
	if (time.indexOf('PM') != -1 && hours < 12) {
		console.log(hours + 12)
		time = time.replace(hours_string, (hours + 12));
	}
	return time.replace(/( AM| PM)/, '');
}