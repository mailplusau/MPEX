/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/format', 'N/http'],
	function(task, email, runtime, search, record, format, http) {
		function execute(context) {

			var todayDate = new Date('dd-mm-yyyy');

			log.audit({
				title: 'today',
				details: today
			});

			//To get todays date
			var today = format.format({
				value: new Date('dd-mm-yyyy'),
				type: format.Type.DATE
			});

			var tempTodayDate = todayDate.split('T');

			var temp = tempTodayDate.split('-');
			var today = temp[2] + '-' + temp[1] + '-' + temp[0];

			log.audit({
				title: 'today',
				details: today
			});

			log.audit({
				title: 'today',
				details: today
			});

			// var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=21-04-2020';
			var mainURL = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=' + today;

			var response = http.get({
				method: http.Method.GET,
				url: mainURL
			});

			log.audit({
				title: 'response',
				details: response
			});

			// var response = nlapiRequestURL(url, null, null);
			// var body = response.getBody();

			log.audit({
				title: 'Body length',
				details: body.length
			});

			//Parse the body to JSON
			var todays_scans = JSON.parse(body);
			var scans = todays_scans.scans;
			var scans_length = scans.length;

			if (body.length > 999999) {
				var nb_records = parseInt(scans_length / 3500) + 1; // Number of records to create
				for (var y = 0; y < nb_records; y++) {
					nlapiLogExecution('AUDIT', 'y value', y);

					var nb_scans_in_record = 3500; // Number of barcodes in each page except the last one.
					if (y == nb_records - 1) {
						var upper_bound = scans_length;
					} else {
						var upper_bound = nb_scans_in_record * (y + 1);
					}

					var scans_1 = '';
					for (var x = nb_scans_in_record * y; x < upper_bound; x++) {

						if (x == nb_scans_in_record * y) {
							scans_1 += '[';
						}
						scans_1 += '{';
						scans_1 += '"id" : "' + scans[x].id + '",';
						scans_1 += '"barcode" : "' + scans[x].barcode + '",';
						scans_1 += '"invoiceable" : "' + scans[x].invoiceable + '",';
						scans_1 += '"zee_ns_id" : "' + scans[x].zee_ns_id + '",';
						scans_1 += '"customer_ns_id" : "' + scans[x].customer_ns_id + '",';
						scans_1 += '"operator_ns_id" : "' + scans[x].operator_ns_id + '",';
						scans_1 += '"scan_type" : "' + scans[x].scan_type + '",';
						scans_1 += '"deleted" : "' + scans[x].deleted + '",';
						scans_1 += '"updated_at" : "' + scans[x].updated_at + '",';
						scans_1 += '"last_ns_synced" : "' + scans[x].last_ns_synced + '"},';
					}
					scans_1 = scans_1.substring(0, scans_1.length - 1);
					scans_1 += ']';

					var scan_json_3 = '{ "scans": ' + scans_1 + '}';

					var scanJSONRecord = record.create({
						type: 'customrecord_scan_json',
						isDynamic: true
					});

					if (y == 0) {
						scanJSONRecord.setValue({
							fieldId: 'name',
							value: today
						});
					} else {
						scanJSONRecord.setValue({
							fieldId: 'name',
							value: today + '_Part' + y
						});
					}

					scanJSONRecord.setValue({
						fieldId: 'custrecord_json',
						value: scan_json_3
					});

					scanJSONRecord.setValue({
						fieldId: 'custrecord_scan_josn_sync',
						value: 2
					});

					scanJSONRecord.save();
				}

			} else {
				var scanJSONRecord = record.create({
					type: 'customrecord_scan_json',
					isDynamic: true
				});

				scanJSONRecord.setValue({
					fieldId: 'name',
					value: today
				});

				scanJSONRecord.setValue({
					fieldId: 'custrecord_json',
					value: scan_json_3
				});

				scanJSONRecord.setValue({
					fieldId: 'custrecord_scan_josn_sync',
					value: 2
				});

				scanJSONRecord.save();

			}
		}
		return {
			execute: execute
		};
	}
);