/*
 * Module Description
 * NSVersion    Date            		Author         
 * 1.00         2019-07-09 07:26:52 		ankith.ravindran  
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-07-16 14:24:31
 *
 * @Description:
 *
 */
function getLatestFiles() {

	//To get todays date
	//var today = '22/8/2019';
	 var today = nlapiDateToString(new Date(), 'dd-mm-yyyy');

	//Get todays scans based on updated_at date
	// var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=01-08-2019';
	 var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=' + today;
	//var url = 'http://mp.protechly.com/scans/?date=22-08-2019';
	var response = nlapiRequestURL(url, null, null);
	var body = response.getBody();
	var headers = response.getAllHeaders();

	nlapiLogExecution('DEBUG', 'Body length', body.length);

	//Parse the body to JSON
	var todays_scans = JSON.parse(body);
	var scans = todays_scans.scans;

	var scans_1 = '';
	var scans_2 = '';
	var scans_temp = [];
	var scans_temp2 = [];

	nlapiLogExecution('DEBUG', 'Scans length', scans.length);

	if (scans.length > 3000) {
		var new_length = (scans.length / 5);
		for(var y =0 ; y < 5; y++){
			nlapiLogExecution('AUDIT', 'y value', y);
			var scans_1 = '';
			var scans_temp = [];
			for (var  x = parseInt(new_length*y); x < parseInt(new_length*(y+1)); x++) {
				nlapiLogExecution('DEBUG', 'y value', y);
				nlapiLogExecution('DEBUG', 'x value', x);
				// nlapiLogExecution('DEBUG', 'Scans value', JSON.stringify(scans[x]));
				if(x == parseInt(new_length*y)){
					scans_1 += '[' ;
				}
				scans_1 += '{' ;
				scans_1 += '"id" : "'+ scans[x].id + '",';
				scans_1 += '"barcode" : "'+ scans[x].barcode + '",';
				scans_1 += '"zee_ns_id" : "'+ scans[x].zee_ns_id + '",';
				scans_1 += '"customer_ns_id" : "'+ scans[x].customer_ns_id + '",';
				scans_1 += '"operator_ns_id" : "'+ scans[x].operator_ns_id + '",';
				scans_1 += '"scan_type" : "'+ scans[x].scan_type + '",';
				scans_1 += '"deleted" : "'+ scans[x].deleted + '",';
				scans_1 += '"updated_at" : "'+ scans[x].updated_at + '",';
				scans_1 += '"last_ns_synced" : "'+ scans[x].last_ns_synced + '"},';
				// scans_temp[x] = scans.splice(x, 1);
			}
			scans_1 = scans_1.substring(0, scans_1.length - 1);
			scans_1 += ']';


			var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
			if(y == 0){
				scan_json_record.setFieldValue('name', today);
			} else {
				scan_json_record.setFieldValue('name', today + '_Part' + y);
			}
			
			var scan_json_3 = '{ "scans": ' + scans_1 + '}';
			scan_json_record.setFieldValue('custrecord_json', scan_json_3);
          scan_json_record.setFieldValue('custrecord_scan_josn_sync', 2);


			nlapiSubmitRecord(scan_json_record);
		}

	} else {
			var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
			scan_json_record.setFieldValue('name', today);
			var scan_json_2 = '{ "scans": ' + JSON.stringify(scans) + '}';
			scan_json_record.setFieldValue('custrecord_json', scan_json_2);
      scan_json_record.setFieldValue('custrecord_scan_josn_sync', 2);

			nlapiSubmitRecord(scan_json_record);

	}


	// if (!isNullorEmpty(scans_1)) {
	// 	scans_1 = scans_1.substring(0, scans_1.length - 1);
	// 	scans_1 += ']';
	// 	// scans_1 =JSON.stringify(scans_1);
	// 	nlapiLogExecution('DEBUG', 'After Scans_1 value', scans_1);

	// 	scans_1 = JSON.parse(scans_1);

	// 	if (scans_1.length > 4000) {
	// 	var new_length_2 = scans_1.length / 2;
	// 		for (var x = 0; x < new_length_2; x++) {
	// 			if(x == 0){
	// 				scans_2 += '[' ;
	// 			}
	// 			scans_2 += '{' ;
	// 			scans_2 += '"id" : "'+ scans_1[x].id + '",';
	// 			scans_2 += '"barcode" : "'+ scans_1[x].barcode + '",';
	// 			scans_2 += '"zee_ns_id" : "'+ scans_1[x].zee_ns_id + '",';
	// 			scans_2 += '"customer_ns_id" : "'+ scans_1[x].customer_ns_id + '",';
	// 			scans_2 += '"operator_ns_id" : "'+ scans_1[x].operator_ns_id + '",';
	// 			scans_2 += '"scan_type" : "'+ scans_1[x].scan_type + '",';
	// 			scans_2 += '"deleted" : "'+ scans_1[x].deleted + '",';
	// 			scans_2 += '"updated_at" : "'+ scans_1[x].updated_at + '",';
	// 			scans_2 += '"last_ns_synced" : "'+ scans_1[x].last_ns_synced + '"},';
	// 			scans_temp2[x] = scans_1.splice(x, 1);
	// 		}
	// 	}

	// 	if (!isNullorEmpty(scans_2)) {
	// 		scans_2 = scans_2.substring(0, scans_2.length - 1);
	// 		scans_2 += ']';
	// 		// scans_2 =JSON.stringify(scans_2);
	// 		nlapiLogExecution('DEBUG', 'After Scans_2 value', scans_2);

	// 		var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
	// 		scan_json_record.setFieldValue('name', today + '_Part3');
	// 		var scan_json_3 = '{ "scans": ' + scans_2 + '}';
	// 		scan_json_record.setFieldValue('custrecord_json', scan_json_3);

	// 		nlapiSubmitRecord(scan_json_record);
	// 	}

	// 	var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
	// 	scan_json_record.setFieldValue('name', today + '_Part2');
	// 	var scan_json_2 = '{ "scans": ' + JSON.stringify(scans_1) + '}';
	// 	scan_json_record.setFieldValue('custrecord_json', scan_json_2);

	// 	nlapiSubmitRecord(scan_json_record);
	// }

	// var scan_json_record = nlapiCreateRecord('customrecord_scan_json');
	// scan_json_record.setFieldValue('name', today);
	// var scan_json_2 = '{ "scans": ' + JSON.stringify(scans) + '}';
	// scan_json_record.setFieldValue('custrecord_json', scan_json_2);

	// nlapiSubmitRecord(scan_json_record);
}