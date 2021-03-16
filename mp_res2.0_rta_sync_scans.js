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
			var today = '24/3/2021';

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

			scanJSONSearch.run().each(function(searchResult) {

				var scriptObj = runtime.getCurrentScript()
				var usage_loopstart_cust = scriptObj.getRemainingUsage();

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

				log.audit({
					title: 'Scna JSON Record Name ',
					details: scan_json_record_name
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

				log.audit({
					title: 'barcodes',
					details: barcodes
				});

				log.audit({
					title: 'barcodes length',
					details: barcodes.length
				});

				if (barcodes.length > 0) {

					//Iterate through each barcode
					for (var x = 0; x < barcodes.length; x++) {

						var scriptObj = runtime.getCurrentScript()
						var usage_loopstart_cust = scriptObj.getRemainingUsage();

						//Usage at the start of each barcode
						log.audit({
							title: 'Start of Barcode Loop',
							details: scriptObj.getRemainingUsage()
						});

						log.audit({
							title: 'Scans for barcode: ' + barcodes[x].code,
							details: barcodes[x].scans
						});


						var scans = barcodes[x].scans;

						log.audit({
							title: 'Scans Length for barcode: ' + barcodes[x].code,
							details: scans.length
						});

						//Iterate through the differenct scans for each barcode
						for (var y = 0; y < scans.length; y++) {

							var scriptObj = runtime.getCurrentScript()
							var usage_loopstart_cust = scriptObj.getRemainingUsage();

							//Usage at the start of each scan type
							log.audit({
								title: 'Start of Scans Loop per barcode',
								details: scriptObj.getRemainingUsage()
							});

							log.audit({
								title: 'Scans for barcode: ' + barcodes[x].code,
								details: scans[y]
							});

							log.audit({
								title: 'Scans for barcode: ' + barcodes[x].code,
								details: scans[y].scan_type
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

							time_updated_at = format.parse({
								value: time_updated_at,
								type: format.Type.TIMEOFDAY
							});

							log.audit({
								title: 'TIME OF DAY',
								details: time_updated_at
							});

							var updated_at = updated_at[0];
							var save_barcode = true;

							var barcode_beg = barcode.slice(0, 4);

							updated_at = updated_at.split("-");

							updated_at = format.parse({
								value: updated_at[2] + '/' + updated_at[1] + '/' + updated_at[0],
								type: format.Type.DATE
							})

							log.audit({
								title: 'DATE',
								details: updated_at
							});

							// updated_at = nlapiStringToDate(updated_at[2] + '/' + updated_at[1] + '/' + updated_at[0]);

							//Load Search: RTA - Product Stock
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

							var count = 0;
							var prod_id;

							productStockSearch.run().each(function(searchResult) {

								log.audit({
									title: 'Barcode does exist',
									details: scans[y].scan_type
								});


								var customer_prod_stock_id = searchResult.getValue({
									name: 'internalid'
								});

								//Load the customer product stock record
								var customerProdStockRecord = record.load({
									type: 'customrecord_customer_product_stock',
									id: customer_prod_stock_id
								});

								//Get the current status of the record.
								var stock_status = customerProdStockRecord.getValue({
									fieldId: 'custrecord_cust_prod_stock_status'
								});

								//Status is Product Order Created or Invoiced
								if (stock_status != 6 && stock_status != 7) {
									//If the scan has the deleted field
									if (!isNullorEmpty(deleted)) {

										//Status is Allocated to custoemer
										if (stock_status == 1) {

											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: null
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_used',
												value: null
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_used',
												value: null
											});

											//Change status to Zee Stock
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 8
											});

											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_zee',
												value: zee_id
											});

										} else if (stock_status == 8) { // Status is Zee Stock

											//Inactivate the record
											customerProdStockRecord.setValue({
												fieldId: 'isinactive',
												value: true
											});

											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_deleted',
												value: time_updated_at
											});

										} else if (stock_status == 4 || stock_status == 5) { // Status is Delivered to receiver / Lodged at TOLL

											//Change status to Allocated to customer
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 1
											});
										}

									} else if (scan_type == 'stockzee') {
										if (!isNullorEmpty(zee_id)) {
											//Set status as Zee stock
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 8
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: null
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_zee',
												value: zee_id
											});

										} else {
											//Send email if no Zee ID
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Zee ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == 'allocate') {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 1
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}

									} else if (scan_type == 'pickup') {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 2
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == "delivery") {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 4
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_final_del',
												value: 4
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == "lodgement") {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 5
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_final_del',
												value: 5
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									}

									if (save_barcode == true) {
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_source',
											value: 6
										});
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_operator',
											value: operator_id
										});
										//Invoiceable field is set to false
										if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
											//Set invoiceable as NO
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_invoiceable',
												value: 2
											});
											//Set Prepaid as YES
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_prepaid',
												value: 1
											});
										}
										if (barcode_beg == 'MPEN' ||
											barcode_beg == 'MPET' ||
											barcode_beg == 'MPEF' ||
											barcode_beg == 'MPEB' ||
											barcode_beg == 'MPEC' ||
											barcode_beg == 'MPED' ||
											barcode_beg == 'MPEG') {
											if (barcode_beg == 'MPEN') {
												prod_id = 552;
											} else if (barcode_beg == 'MPET') {
												prod_id = 553;
											} else if (barcode_beg == 'MPEF') {
												prod_id = 554;
											} else if (barcode_beg == 'MPEB') {
												prod_id = 550;
											} else if (barcode_beg == 'MPEC') {
												prod_id = 551;
											} else if (barcode_beg == 'MPED') {
												prod_id = 549;
											} else if (barcode_beg == 'MPEG') {
												prod_id = 638;
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_stock_prod_name',
												value: prod_id
											});
										}
										customer_prod_stock_id = customerProdStockRecord.save();
									}

								}

								count++;
								return true;

							});

							if (count == 0) {

								log.audit({
									title: 'Barcode does not exist',
									details: scans[y].scan_type
								});

								var save_barcode = true;
								if (isNullorEmpty(deleted)) {

									var customerProdStockRecord = record.create({
										type: 'customrecord_customer_product_stock',
										isDynamic: true
									});

									customerProdStockRecord.setValue({
										fieldId: 'custrecord_cust_date_stock_given',
										value: updated_at
									});
									customerProdStockRecord.setValue({
										fieldId: 'custrecord_cust_time_stock_given',
										value: time_updated_at
									});

									//Invoiceable field is set to false
									if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
										//Set invoiceable as NO
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_invoiceable',
											value: 2
										});
										//Set Prepaid as YES
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_prepaid',
											value: 1
										});
									}

									customerProdStockRecord.setValue({
										fieldId: 'name',
										value: barcode
									});

									if (scan_type == 'stockzee') {
										if (!isNullorEmpty(zee_id)) {
											//Set status as Zee stock
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 8
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: null
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_zee',
												value: zee_id
											});

										} else {
											//Send email if no Zee ID
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Zee ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == 'allocate') {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 1
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}

									} else if (scan_type == 'pickup') {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 2
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == "delivery") {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 4
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_final_del',
												value: 4
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									} else if (scan_type == "lodgement") {
										if (!isNullorEmpty(customer_id)) {
											//Invoiceable field is set to false
											if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
												//Set invoiceable as NO
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_invoiceable',
													value: 2
												});
												//Set Prepaid as YES
												customerProdStockRecord.setValue({
													fieldId: 'custrecord_cust_prod_stock_prepaid',
													value: 1
												});
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_customer',
												value: customer_id
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_status',
												value: 5
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_final_del',
												value: 5
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_date_stock_given',
												value: updated_at
											});
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_time_stock_given',
												value: time_updated_at
											});
										} else {
											email.send({
												author: 409635,
												recipients: 'ankith.ravindran@mailplus.comau',
												subject: 'MPEX Scan Sync - Error',
												body: 'Barcode: ' + barcode + ' has empty Customer ID'
											});
											save_barcode = false;
										}
									}

									if (save_barcode == true) {
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_source',
											value: 6
										});
										customerProdStockRecord.setValue({
											fieldId: 'custrecord_cust_prod_stock_operator',
											value: operator_id
										});
										//Invoiceable field is set to false
										if (invoiceable === false || invoiceable == 'false' || invoiceable === 'false' || invoiceable == false) {
											//Set invoiceable as NO
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_invoiceable',
												value: 2
											});
											//Set Prepaid as YES
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_prod_stock_prepaid',
												value: 1
											});
										}
										if (barcode_beg == 'MPEN' ||
											barcode_beg == 'MPET' ||
											barcode_beg == 'MPEF' ||
											barcode_beg == 'MPEB' ||
											barcode_beg == 'MPEC' ||
											barcode_beg == 'MPED' ||
											barcode_beg == 'MPEG') {
											if (barcode_beg == 'MPEN') {
												prod_id = 552;
											} else if (barcode_beg == 'MPET') {
												prod_id = 553;
											} else if (barcode_beg == 'MPEF') {
												prod_id = 554;
											} else if (barcode_beg == 'MPEB') {
												prod_id = 550;
											} else if (barcode_beg == 'MPEC') {
												prod_id = 551;
											} else if (barcode_beg == 'MPED') {
												prod_id = 549;
											} else if (barcode_beg == 'MPEG') {
												prod_id = 638;
											}
											customerProdStockRecord.setValue({
												fieldId: 'custrecord_cust_stock_prod_name',
												value: prod_id
											});
										}
										customer_prod_stock_id = customerProdStockRecord.save();
									}
								}
							}
						}
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