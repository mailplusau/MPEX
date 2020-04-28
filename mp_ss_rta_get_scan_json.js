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
	var today = nlapiDateToString(new Date(), 'dd-mm-yyyy');

	// var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=21-04-2020';
	var url = 'https://app.mailplus.com.au:8003/api/v1/admin/scans/sync?date=' + today;
	var response = nlapiRequestURL(url, null, null);
	var body = response.getBody();

	nlapiLogExecution('DEBUG', 'Body length', body.length);

	//Parse the body to JSON
	var todays_scans = JSON.parse(body);
    var scans = todays_scans.scans;
    var scans_length = scans.length;

	nlapiLogExecution('DEBUG', 'Scans length', scans_length);

	if (body.length > 999999) {
        var nb_records = parseInt(scans_length / 3500) + 1; // Number of records to create
		for(var y = 0 ; y < nb_records; y++){
            nlapiLogExecution('AUDIT', 'y value', y);

            var nb_scans_in_record = 3500; // Number of barcodes in each page except the last one.
            if (y == nb_records - 1) {
                var upper_bound = scans_length;
            } else {
                var upper_bound = nb_scans_in_record*(y+1);
            }

			var scans_1 = '';
			for (var x = nb_scans_in_record*y; x < upper_bound; x++) {
				nlapiLogExecution('DEBUG', 'y value', y);
				nlapiLogExecution('DEBUG', 'x value', x);
				if(x == nb_scans_in_record*y){
					scans_1 += '[' ;
				}
				scans_1 += '{' ;
				scans_1 += '"id" : "'+ scans[x].id + '",';
				scans_1 += '"barcode" : "'+ scans[x].barcode + '",';
				scans_1 += '"invoiceable" : "'+ scans[x].invoiceable + '",';
				scans_1 += '"zee_ns_id" : "'+ scans[x].zee_ns_id + '",';
				scans_1 += '"customer_ns_id" : "'+ scans[x].customer_ns_id + '",';
				scans_1 += '"operator_ns_id" : "'+ scans[x].operator_ns_id + '",';
				scans_1 += '"scan_type" : "'+ scans[x].scan_type + '",';
				scans_1 += '"deleted" : "'+ scans[x].deleted + '",';
				scans_1 += '"updated_at" : "'+ scans[x].updated_at + '",';
				scans_1 += '"last_ns_synced" : "'+ scans[x].last_ns_synced + '"},';
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
}