var ctx = nlapiGetContext();
var zee = ctx.getUser();
var role = ctx.getRole();


//User Event to calculate AP Line Item Expected Price as well as Expected Franchisee Commission on create/ edit/ delete of AP Line Item

function beforeSubmit(type, form){

	//On create of AP Line Item
	// if(type == 'create'){

	// 	var price_total = 0.0
	// 	var franch_comm_total = 0.0;


	// 	//Get the values
 //        var apItemId = nlapiGetFieldValue('custrecord_ap_stock_line_item');
 //        var actQty = nlapiGetFieldValue('custrecord_ap_stock_line_actual_qty');
 //        var productOrderId = nlapiGetFieldValue('custrecord_ap_product_order');
 //        var stockReceiptId = nlapiGetFieldValue('custrecord_ap_stock_line_stock_receipt');

 //        nlapiLogExecution('DEBUG', 'Prod ', isNullorEmpty(productOrderId));
 //        nlapiLogExecution('DEBUG', 'Stock ', isNullorEmpty(stockReceiptId));

 //        if(!isNullorEmpty(productOrderId) && isNullorEmpty(stockReceiptId)){

 //        	nlapiLogExecution('DEBUG', 'Prod1 ', 1);
 //       		 nlapiLogExecution('DEBUG', 'Stock ', stockReceiptId);

	//         var results = [];

	//         //Calculate the values for the AP Line Item as well as the franchisee commission
	//         results = productCalculations(apItemId, actQty);

	//         var item_price = results[0];
	//         var franchisee_com = results[1];

	//         //Set the two fields in the AP Line Item record
	//         nlapiSetFieldValue('custrecord_ap_line_item_exp_revenue', item_price);
	//         nlapiSetFieldValue('custrecord_ap_line_item_zee_comm', franchisee_com);
	//         // nlapiSubmitRecord(apLineItemRecord); NO NEED TO SUBMIT THE RECORD ON WHICH THE USER EVENT HAS BEEN DEPLOYED

	       
	//         //Search AP LIne Items that has the same Product ID
	//         var fil_po = [];
		    
	// 	    fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', productOrderId);


	// 	    var col_po = [];
	// 	    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_item');
	// 	    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_actual_qty');

	// 	    var poSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil_po, col_po);



	// 	    var apProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);

	// 	   //Set the expected price and franchisee commission for the Product Order as the above calculated prices.   	
	// 		price_total = item_price;
	// 		franch_comm_total = franchisee_com;

	// 		//As long as there are other AP Line Items associated with the Product ID
	// 		if(!isNullorEmpty(poSearch)){

	// 			nlapiLogExecution('DEBUG', 'Product_length ', poSearch.length);
	// 			//If its not the first AP LIne Item being created for the Product Order
	// 			if(poSearch.length != null){
	// 		    	for(var x = 0; x < poSearch.length; x++){


	// 				 	var itemId = poSearch[x].getValue('custrecord_ap_stock_line_item');
	// 				 	var itemQty = poSearch[x].getValue('custrecord_ap_stock_line_actual_qty');

	// 				 	var resultSet = [];

	// 				 	resultSet = productCalculations(itemId, itemQty);

	// 			        var item_price = resultSet[0];
	// 			        var franchisee_com = resultSet[1];

	// 			        price_total = price_total + item_price;
	// 			        franch_comm_total = franch_comm_total + franchisee_com;

	// 				}

	// 		    }

	// 		    apProductOrder.setFieldValue('custrecord_ap_order_exprevenue', price_total);
	// 			apProductOrder.setFieldValue('custrecord_ap_order_zee_comm', franch_comm_total);
	// 			nlapiSubmitRecord(apProductOrder);

	// 		} 
		    
	// 		//Set the two fields for the AP Product Order.
		   
	// 	} else if(isNullorEmpty(productOrderId) && !isNullorEmpty(stockReceiptId)){
	// 			nlapiLogExecution('DEBUG', 'Prod2 ', 2);

	// 	} else {
	// 			nlapiLogExecution('DEBUG', 'Prod3 ', 3);

	// 			var body = 'Only one of AP Product or AP Stock Reciept can be populated. Please review the information in the AP Line Item ';

	//             nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au', 'Willian.Suryadharma@mailplus.com.au'], 'Missing Required Fields', body, null);

	//               throw nlapiCreateError('RECORD_LOCKED', 'Record Locked: \n\nOnly one of AP Product or AP Stock Reciept can be populated. Please review the information in the AP Line Item', true);
	// 		}
		
	// } else 
	if(type == 'edit' || type == 'xedit'){

		//Update the expected item price and the expected franchisee commission in the AP Product Order record on edit of AP Line Item
		
		var price_total = 0.0
		var franch_comm_total = 0.0;
		var flag = false;

		//Get the old record before Edit
		var recOld = nlapiGetOldRecord();
		//Get the new record after the edit
        var recUpd = nlapiGetNewRecord();

        //Get the old and new values for the Item and actual quantity
        var old_item = recOld.getFieldValue('custrecord_ap_stock_line_item');
        var old_qty = recOld.getFieldValue('custrecord_ap_stock_line_actual_qty');
        var new_item = recUpd.getFieldValue('custrecord_ap_stock_line_item');
        var new_qty = recUpd.getFieldValue('custrecord_ap_stock_line_actual_qty');
        var old_item_price = recOld.getFieldValue('custrecord_ap_line_item_exp_revenue');
        var old_franch_comm = recOld.getFieldValue('custrecord_ap_line_item_zee_comm');
			        nlapiLogExecution('DEBUG', 'NEW ITEM ID', new_item);
		        nlapiLogExecution('DEBUG', 'OLD ITEM ID', old_item);

        //If the old item does not match with the edited item and thew old quantity does not match with the new quantity, the new prices needs to be calculated.
       		// if(((old_item != new_item || old_qty != new_qty) || (isNullorEmpty(old_item_price) || isNullorEmpty(old_franch_comm))) && (!isNullorEmpty(recUpd.getFieldValue('custrecord_ap_product_order')) && isNullorEmpty(recUpd.getFieldValue('custrecord_ap_stock_line_stock_receipt')))) {
	       		var productOrderId =  recUpd.getFieldValue('custrecord_ap_product_order');
	       		if(isNullorEmpty(productOrderId)){
	       			productOrderId =  recOld.getFieldValue('custrecord_ap_product_order');
	       		}
	       		if(!isNullorEmpty(productOrderId)){
		       		var apProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);
		       		var apItemRecord = nlapiLoadRecord('customrecord_ap_item', new_item);
		       		var price_increase_date = apItemRecord.getFieldValue('custrecord_ap_date_price_inc');
		        	var orderDate = apProductOrder.getFieldValue('custrecord_mp_ap_order_date');
		        	price_increase_date = nlapiStringToDate(price_increase_date);
			        orderDate = nlapiStringToDate(orderDate);


			        nlapiLogExecution('DEBUG', 'price increase date', price_increase_date);
			        nlapiLogExecution('DEBUG', 'orderDate', orderDate);
			        
			        //If the order date is after the price increase, then the new calculation should take place.
			        if(price_increase_date <= orderDate){

			        	var actQty = recUpd.getFieldValue('custrecord_ap_stock_line_actual_qty');

				        var results = [];

				        //Price calculation for the Item price and the franchisee commission
				        results = productCalculations(new_item, actQty);

				        var item_price = results[0];
				        var franchisee_com = results[1];

				        

			        	recUpd.setFieldValue('custrecord_ap_line_item_exp_revenue', item_price);
				        recUpd.setFieldValue('custrecord_ap_line_item_zee_comm', franchisee_com);
				        // nlapiSubmitRecord(recUpd);
					        

				        var invoiceNumber = apProductOrder.getFieldValue('custrecord_mp_ap_order_invoicenum');
				        var creditNumber = apProductOrder.getFieldValue('custrecord_mp_ap_order_creditnum');

				        //In the product order record, the invoice or credit fields have not been set

				        if(isNullorEmpty(invoiceNumber) && isNullorEmpty(creditNumber)){

				        	if(isNullorEmpty(apProductOrder.getFieldValue('custrecord_ap_order_exprevenue'))){

				        		//Search AP LIne Items that has the same Product ID
				        		var fil_po = [];
							    fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', productOrderId);

							    var col_po = [];
							    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_item');
							    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_actual_qty');

							    var poSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil_po, col_po);

								for(var x = 0; x < poSearch.length; x++){


								 	var itemId = poSearch[x].getValue('custrecord_ap_stock_line_item');
								 	var itemQty = poSearch[x].getValue('custrecord_ap_stock_line_actual_qty');

								 	var resultSet = [];

								 	resultSet = productCalculations(itemId, itemQty);

							        var item_price = resultSet[0];
							        var franchisee_com = resultSet[1];

							        price_total = price_total + item_price;
							        franch_comm_total = franch_comm_total + franchisee_com;

								}

								var apProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);

								apProductOrder.setFieldValue('custrecord_ap_order_exprevenue', price_total);
								apProductOrder.setFieldValue('custrecord_ap_order_zee_comm', franch_comm_total);
								

				        	} else {
				        		var old_price_total = apProductOrder.getFieldValue('custrecord_ap_order_exprevenue');
					        	var old_franch_comm_total = apProductOrder.getFieldValue('custrecord_ap_order_zee_comm');

					        	price_total = (old_price_total - old_item_price) + item_price;
					        	franch_comm_total = (old_franch_comm_total - old_franch_comm) + franchisee_com;

					        	apProductOrder.setFieldValue('custrecord_ap_order_exprevenue', price_total);
					        	apProductOrder.setFieldValue('custrecord_ap_order_zee_comm', franch_comm_total);

				        	}

							nlapiSubmitRecord(apProductOrder);
			        	}

			        }
			        else {
				    	var body = 'Old Price needs to be calculated for the following AP Item ' + new_item + ' AP Line Item ID ' + nlapiGetRecordId() + ' by user ' + zee + ' price increase date ' + price_increase_date + ' order date ' + orderDate;

			            // nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au', 'Willian.Suryadharma@mailplus.com.au'], 'Old Prices', body, null);
				    }
				}

       	// }
	}
	else if(type == 'delete'){

		//Update the expected item price and the expected franchisee commission in the AP Product Order record on delete of AP Line Item

		//Access the record using nlapiGetOldRecord()
		var recUpd = nlapiGetOldRecord();	

		var productOrderId =  recUpd.getFieldValue('custrecord_ap_product_order');

		if(!isNullorEmpty(productOrderId)){

			//Search AP LIne Items that has the same Product ID
			var fil_po = [];
		    fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', productOrderId);

		    var col_po = [];
		    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_item');
		    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_actual_qty');

		    var poSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil_po, col_po);

		    if(poSearch.length == 1){

		    	//nlapiDeleteRecord('customrecord_mp_ap_product_order',)

		    	//On delete of the only line item, make the fields set at 0

		    	var apProductOrder_delete = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);

		    	apProductOrder_delete.setFieldValue('custrecord_ap_order_exprevenue', 0);
	        	apProductOrder_delete.setFieldValue('custrecord_ap_order_zee_comm', 0);

	        	nlapiSubmitRecord(apProductOrder_delete);	

		    } else {

		    	//Update the prices 
		    	var apProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);
				var new_price_total = 0;
				var new_franch_comm = 0;

				var old_price_total = apProductOrder.getFieldValue('custrecord_ap_order_exprevenue');
				var old_franch_comm_total = apProductOrder.getFieldValue('custrecord_ap_order_zee_comm');

				var old_line_item_price = recUpd.getFieldValue('custrecord_ap_line_item_exp_revenue');
		        var old_line_franch_comm = recUpd.getFieldValue('custrecord_ap_line_item_zee_comm');


				new_price_total = old_price_total - old_line_item_price;
				new_franch_comm = old_franch_comm_total - old_line_franch_comm;


	        	apProductOrder.setFieldValue('custrecord_ap_order_exprevenue', new_price_total);
	        	apProductOrder.setFieldValue('custrecord_ap_order_zee_comm', new_franch_comm);

	        	 nlapiSubmitRecord(apProductOrder);	
		    }
		}

	   
	}
}

function afterSubmit(type, form){
	if(type == 'create'){

		var price_total = 0.0
		var franch_comm_total = 0.0;


		//Get the values
        var apItemId = nlapiGetFieldValue('custrecord_ap_stock_line_item');
        var actQty = nlapiGetFieldValue('custrecord_ap_stock_line_actual_qty');
        var productOrderId = nlapiGetFieldValue('custrecord_ap_product_order');
        var stockReceiptId = nlapiGetFieldValue('custrecord_ap_stock_line_stock_receipt');

        nlapiLogExecution('DEBUG', 'Prod ', isNullorEmpty(productOrderId));
        nlapiLogExecution('DEBUG', 'Stock ', isNullorEmpty(stockReceiptId));

        if(!isNullorEmpty(productOrderId) && isNullorEmpty(stockReceiptId)){

        	nlapiLogExecution('DEBUG', 'Prod1 ', 1);
       		 nlapiLogExecution('DEBUG', 'Stock ', stockReceiptId);

	        var results = [];

	        //Calculate the values for the AP Line Item as well as the franchisee commission
	        results = productCalculations(apItemId, actQty);

	        var item_price = results[0];
	        var franchisee_com = results[1];

	        //Set the two fields in the AP Line Item record
	        var apLineItemRecord = nlapiLoadRecord('customrecord_ap_stock_line_item', nlapiGetRecordId());
	        apLineItemRecord.setFieldValue('custrecord_ap_line_item_exp_revenue', item_price);
	        apLineItemRecord.setFieldValue('custrecord_ap_line_item_zee_comm', franchisee_com);
	        nlapiSubmitRecord(apLineItemRecord); //NO NEED TO SUBMIT THE RECORD ON WHICH THE USER EVENT HAS BEEN DEPLOYED

	       
	        //Search AP LIne Items that has the same Product ID
	        var fil_po = [];
		    
		    fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', productOrderId);


		    var col_po = [];
		    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_item');
		    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_actual_qty');

		    var poSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil_po, col_po);



		    var apProductOrder = nlapiLoadRecord('customrecord_mp_ap_product_order', productOrderId);

		   //Set the expected price and franchisee commission for the Product Order as the above calculated prices.   	
			// price_total = item_price;
			// franch_comm_total = franchisee_com;

			nlapiLogExecution('DEBUG', 'Pice Total', price_total);
			//As long as there are other AP Line Items associated with the Product ID
			if(!isNullorEmpty(poSearch)){

				nlapiLogExecution('DEBUG', 'Product_length ', poSearch.length);
				//If its not the first AP LIne Item being created for the Product Order
				if(poSearch.length != null){
			    	for(var x = 0; x < poSearch.length; x++){


					 	var itemId = poSearch[x].getValue('custrecord_ap_stock_line_item');
					 	var itemQty = poSearch[x].getValue('custrecord_ap_stock_line_actual_qty');

					 	var resultSet = [];

					 	resultSet = productCalculations(itemId, itemQty);

				        var item_price = resultSet[0];
				        var franchisee_com = resultSet[1];

				        price_total = price_total + item_price;
				        franch_comm_total = franch_comm_total + franchisee_com;

					}

			    }



        	 	var invoiceNumber = apProductOrder.getFieldValue('custrecord_mp_ap_order_invoicenum');
				var creditNumber = apProductOrder.getFieldValue('custrecord_mp_ap_order_creditnum');
				 if(isNullorEmpty(invoiceNumber) && isNullorEmpty(creditNumber)){
				 	apProductOrder.setFieldValue('custrecord_ap_order_exprevenue', price_total);
					apProductOrder.setFieldValue('custrecord_ap_order_zee_comm', franch_comm_total);
					nlapiSubmitRecord(apProductOrder);
				 }
			    

			} 
		    
			//Set the two fields for the AP Product Order.
		   
		} else if(isNullorEmpty(productOrderId) && !isNullorEmpty(stockReceiptId)){
				nlapiLogExecution('DEBUG', 'Prod2 ', 2);

		} else {
				nlapiLogExecution('DEBUG', 'Prod3 ', 3);

				var body = 'Only one of AP Product or AP Stock Reciept can be populated. Please review the information in the AP Line Item ';

	            nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au', 'Willian.Suryadharma@mailplus.com.au'], 'Missing Required Fields', body, null);

	              throw nlapiCreateError('RECORD_LOCKED', 'Record Locked: \n\nOnly one of AP Product or AP Stock Reciept can be populated. Please review the information in the AP Line Item', true);
			}
		
	}
}
