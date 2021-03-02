/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/task', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/format', 'N/https'],
	function(task, email, runtime, search, record, format, https) {

		var main_JSON = '{"date":"2019-10-13","barcodes":[{"code":"MPED051329","scans":[{"id":617001,"barcode":"MPED051329","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":null,"operator_ns_id":"611","scan_type":"Stockzee","deleted":null,"updated_at":"2019-10-13T08:12:03.099+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123456","source":"shopify","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null},{"id":617000,"barcode":"MPED051329","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":"2892","operator_ns_id":"611","scan_type":"Allocate","deleted":"2019-10-13T08:13:17.335+11:00","updated_at":"2019-10-13T08:13:17.335+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123456","source":"shopify","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null},{"id":617000,"barcode":"MPED051329","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":"2892","operator_ns_id":"611","scan_type":"Allocate","deleted":"2019-10-13T08:13:17.335+11:00","updated_at":"2019-10-13T08:13:17.335+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123456","source":"shopify","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null},{"id":617000,"barcode":"MPED051329","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":"2892","operator_ns_id":"611","scan_type":"Allocate","deleted":"2019-10-13T08:13:17.335+11:00","updated_at":"2019-10-13T08:13:17.335+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123456","source":"shopify","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null},{"id":617000,"barcode":"MPED051329","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":"2892","operator_ns_id":"611","scan_type":"Allocate","deleted":"2019-10-13T08:13:17.335+11:00","updated_at":"2019-10-13T08:13:17.335+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123456","source":"shopify","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null}]},{"code":"MPED051328","scans":[{"id":617002,"barcode":"MPED051328","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":null,"operator_ns_id":"611","scan_type":"Stockzee","deleted":null,"updated_at":"2019-10-13T08:12:03.099+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123457","source":"bulk","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null},{"id":617003,"barcode":"MPED051328","invoiceable":true,"zee_ns_id":"174014","customer_ns_id":"2892","operator_ns_id":"611","scan_type":"Allocate","deleted":"2019-10-13T08:13:17.335+11:00","updated_at":"2019-10-13T08:13:17.335+11:00","last_ns_synced":"2021-02-22T23:18:53.073+11:00","external_barcode":"MPDL123457","source":"bulk","receiver_suburb":"Sydney","post_code":"2000","state":"NSW","address1":"222 Pitt Street","address2":null}]}]}';

		function execute(context) {

			var todayDate = new Date();
			var yesterdayDate = new Date(todayDate);

			yesterdayDate.setDate(yesterdayDate.getDate() - 1)

			log.audit({
				title: 'todayDate',
				details: todayDate
			});

			log.audit({
				title: 'yesterdayDate',
				details: yesterdayDate
			});

			//To get todays date
			var today = format.format({
				value: todayDate,
				type: format.Type.DATE
			});

			var yesterday = format.format({
				value: yesterdayDate,
				type: format.Type.DATE
			});

			log.audit({
				title: 'today',
				details: today
			});

			log.audit({
				title: 'yesterday',
				details: yesterday
			});

			var tempTodayDate = today.split('/');
			var tempYesterdayDate = yesterday.split('/');

			// var temp = tempYesterdayDate.split('');
			var yesterday = tempYesterdayDate[0] + '/' + tempYesterdayDate[1] + '/' + tempYesterdayDate[2];
			// var today = '12/1/2021'

			log.audit({
				title: 'yesterday',
				details: yesterday
			});


			// var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=21-04-2020';
			// var mainURL = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=' + today;

			// log.audit({
			// 	title: 'mainURL',
			// 	details: mainURL
			// });

			// var response = https.get({
			// 	url: mainURL
			// });

			// log.audit({
			// 	title: 'response',
			// 	details: response
			// });

			// var body = response.body;

			//Parse the body to JSON
			//
			var todays_scans = JSON.parse(main_JSON);

			log.audit({
				title: 'JSON Length',
				details: main_JSON.length
			});

			var barcodes = todays_scans.barcodes;
			var no_of_barcodes = barcodes.length; //No. of barcodes

			log.audit({
				title: 'No. of barcodes',
				details: no_of_barcodes
			});

			//300 barcodes per record created. 
			var nb_records = parseInt(no_of_barcodes / 300) + 1;

			for (var y = 0; y < nb_records; y++) {

				//Set the upper bound for loop based on number of barcodes
				if (no_of_barcodes > 300) {
					var nb_scans_in_record = 300; // Number of barcodes in each page except the last one.
					if (y == nb_records - 1) {
						var upper_bound = 300;
					} else {
						var upper_bound = nb_scans_in_record * (y + 1);
					}
				} else {
					var nb_scans_in_record = no_of_barcodes;
					var upper_bound = no_of_barcodes;
				}

				//Display record numbers being created
				log.audit({
					title: 'Record Number',
					details: y + 1
				});

				var scans_1 = '';

				//Iterate through each of the barcode
				for (var barcode_count = nb_scans_in_record * y; barcode_count < upper_bound; barcode_count++) {

					// var scans_length = JSON.parse(barcodes[barcode_count])
					var scans_string = JSON.stringify(barcodes[barcode_count]);
					var scans_string_length = scans_string.length;
					var barcode = barcodes[barcode_count].code;

					log.audit({
						title: 'Barcode Scans Length',
						details: scans_string_length
					});

					var barcodes_scans = barcodes[barcode_count].scans; //barcode scans

					scans_1 += scans_string + ',';

					log.audit({
						title: 'Barcode Scans',
						details: barcodes_scans
					});

					var scans_per_barcode = barcodes_scans.length; //No. of scans per barcode

					log.audit({
						title: 'No. of scans per barcode',
						details: scans_per_barcode
					});

					log.audit({
						title: 'Scan JSON created for loop ' + barcode_count,
						details: scans_1
					});
				}

				scans_1 = scans_1.substring(0, scans_1.length - 1);


				log.audit({
					title: 'Scan JSON to be stored',
					details: scans_1
				});

				//Create SCAN JSON record
				var scanJSONRecord = record.create({
					type: 'customrecord_scan_json',
					isDynamic: true
				});

				scanJSONRecord.setValue({
					fieldId: 'name',
					value: today + '_Part_' + (y + 1)
				});

				var scan_json_2 = '{ "scans": [' + scans_1 + ']}';

				scanJSONRecord.setValue({
					fieldId: 'custrecord_json',
					value: scan_json_2
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