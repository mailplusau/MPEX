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
			// var today = tempTodayDate[0] + '/' + tempTodayDate[1] + '/' + tempTodayDate[2];
			var today = '22/3/2021';

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

				var usage_loopstart_cust = runtime.getRemainingUsage();

				log.audit({
					title: 'Start of SCAN JSON Loop',
					details: usage_loopstart_cust
				});

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
					var barcodes = todays_scans.scans; //No. of barcodes
				} else {
					var todays_scans = JSON.parse(body_2);
					var barcodes = todays_scans.scans; //No. of barcodes
				}

				for (var x = 0; x < barcodes.length; x++) {

					log.audit({
						title: 'Start of Barcode Loop',
						details: runtime.getRemainingUsage()
					});

					var scans = barcodes[x].scans;

					for (var y = 0; y < scans.length; y++) {

						log.audit({
							title: 'Start of Scans Loop per barcode',
							details: runtime.getRemainingUsage()
						});

						log.audit({
							title: 'Scans for barcode: ' + barcodes[x],
							details: scans[y]
						});

						var barcode = scans[y].barcode.toUpperCase();
						var customer_id = scans[y].customer_ns_id;
						var zee_id = scans[y].zee_ns_id;
						var rta_id = scans[y].id;
						var invoiceable = scans[y].invoiceable;
						var scan_type = scans[y].scan_type.toLowerCase();
						var operator_id = scans[y].operator_ns_id;
						var updated_at = scans[y].updated_at;
						var deleted = scans[y].deleted;
						var external_barcode = scans[y].external_barcode;
						var source = scans[y].source;
						var receiver_suburb = scans[y].receiver_suburb;
						var receiver_postcode = scans[y].post_code;
						var receiver_state = scans[y].state;
						var receiver_addr1 = scans[y].address1;
						var receiver_addr2 = scans[y].address1;


						updated_at = updated_at.split("T");
						var time_updated_at = updated_at[1];
						time_updated_at = time_updated_at.split(".");
						time_updated_at = onTimeChange(time_updated_at[0]);
						var updated_at = updated_at[0];
						var save_barcode = true;
					}
				}



				return true;
			});
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

/**
 * Is Null or Empty.
 * 
 * @param {Object} strVal
 */
function isNullorEmpty(strVal) {
	return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
}