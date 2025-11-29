/**
 * @author davetowey
 */

/* Simple redirection suitelet to get around Netsuite's inability to resolve a URL to a saved search */

function getItems(recordType, searchId, filters, columns) {
  var savedSearch = nlapiLoadSearch(recordType, searchId);
  if (filters) savedSearch.addFilters(filters);
  if (columns) addColumns(columns);
  var resultset = savedSearch.runSearch();
  var returnSearchResults = [];
  var searchid = 0;
  do {
    var resultslice = resultset.getResults(searchid, searchid + 1000);
    for (var rs in resultslice) {
      returnSearchResults.push(resultslice[rs]);
      searchid++;
    }
  } while (resultslice && resultslice.length >= 1000);

  return returnSearchResults;
}

function listCustomerUsage(request, response) {
  if (request.getMethod() == "GET") {
    var zee = request.getParameter("zee");

    // var daysMin = request.getParameter("daysmax");
    // var daysMax = request.getParameter("daysmax");

    var criteria = new Array();

    criteria.push(
      new nlobjSearchFilter(
        "custrecord_mp_ap_order_franchisee",
        null,
        "anyof",
        zee
      )
    );

    var cols = new Array();
    cols.push(new nlobjSearchColumn("customer", null, "group"));

    // var searchresults = nlapiSearchRecord(
    //   "customrecord_mp_ap_product_order",
    //   "customsearch_ap_order_all_list_2_3",
    //   criteria,
    //   null
    // );

    var searchresults = getItems("customrecord_mp_ap_product_order", "customsearch_ap_order_all_list_2_3", criteria, null);

    // var form = nlapiCreateForm('Customer Usage');
    // var df = form.addField("date_from", "date", "From");
    // var dt = form.addField("date_to", "date", "To");

    var list = nlapiCreateList("Customer Product Usage", false);
    list.addColumn("customer", "text", "Customer", "left");
    list.addColumn("mpen", "text", "1kg", "right");
    list.addColumn("mpet", "text", "3kg", "right");
    list.addColumn("mpef", "text", "5kg", "right");
    list.addColumn("mpeg", "text", "500g", "right");
    list.addColumn("mpeb", "text", "B4", "right");
    list.addColumn("mpec", "text", "C5", "right");
    list.addColumn("mped", "text", "DL", "right");

    list.addColumn("revenue", "text", "Revenue", "right");
    list.addColumn("commission", "text", "Commission", "right");

    var rowData = new Array();

    for (var i = 0; i < searchresults.length; i++) {
      var res = searchresults[i];
      var cols = res.getAllColumns();

      var cRow = new Object();
      cRow["mpen"] = 0;
      cRow["mpet"] = 0;
      cRow["mpef"] = 0;
      cRow["mpeg"] = 0;
      cRow["mpeb"] = 0;
      cRow["mpec"] = 0;
      cRow["mped"] = 0;
      cRow["revenue"] = 0;
      cRow["commission"] = 0;

      var found = false;
      for (var r = 0; r < rowData.length; r++) {
        var o = rowData[r];

        if (o["customer"] == res.getText(cols[6])) {
          // increment this
          cRow = o;
          found = true;
        }
      }

      cRow["customer"] = res.getText(cols[6]);

      if (res.getValue(cols[10]) == 561 || res.getValue(cols[10]) == 555 || res.getValue(cols[10]) == 608 || res.getValue(cols[10]) == 609 || res.getValue(cols[10]) == 607 || res.getValue(cols[10]) == 606 || res.getValue(cols[10]) == 584 || res.getValue(cols[10]) == 585 || res.getValue(cols[10]) == 569 || res.getValue(cols[10]) == 570 || res.getValue(cols[10]) == 582 || res.getValue(cols[10]) == 583)
        cRow["mpen"] += 1;
      if (res.getValue(cols[10]) == 566 || res.getValue(cols[10]) == 556 || res.getValue(cols[10]) == 612 || res.getValue(cols[10]) == 613 || res.getValue(cols[10]) == 611 || res.getValue(cols[10]) == 610 || res.getValue(cols[10]) == 589 || res.getValue(cols[10]) == 588 || res.getValue(cols[10]) == 572 || res.getValue(cols[10]) == 571 || res.getValue(cols[10]) == 586 || res.getValue(cols[10]) == 587)
        cRow["mpet"] += 1;
      if (res.getValue(cols[10]) == 557 || res.getValue(cols[10]) == 617 || res.getValue(cols[10]) == 616 || res.getValue(cols[10]) == 562 || res.getValue(cols[10]) == 615 || res.getValue(cols[10]) == 614 || res.getValue(cols[10]) == 592 || res.getValue(cols[10]) == 593 || res.getValue(cols[10]) == 573 || res.getValue(cols[10]) == 574 || res.getValue(cols[10]) == 590 || res.getValue(cols[10]) == 591)
        cRow["mpef"] += 1;
      if (res.getValue(cols[10]) == 630 || res.getValue(cols[10]) == 631 || res.getValue(cols[10]) == 632 || res.getValue(cols[10]) == 633 || res.getValue(cols[10]) == 634 || res.getValue(cols[10]) == 635 || res.getValue(cols[10]) == 636 || res.getValue(cols[10]) == 637)
        cRow["mpeg"] += 1;
      if (res.getValue(cols[10]) == 560 || res.getValue(cols[10]) == 620 || res.getValue(cols[10]) == 621 || res.getValue(cols[10]) == 563 || res.getValue(cols[10]) == 619 || res.getValue(cols[10]) == 618 || res.getValue(cols[10]) == 596 || res.getValue(cols[10]) == 597 || res.getValue(cols[10]) == 576 || res.getValue(cols[10]) == 575 || res.getValue(cols[10]) == 594 || res.getValue(cols[10]) == 595)
        cRow["mpeb"] += 1;
      if (res.getValue(cols[10]) == 564 || res.getValue(cols[10]) == 559 || res.getValue(cols[10]) == 625 || res.getValue(cols[10]) == 624 || res.getValue(cols[10]) == 623 || res.getValue(cols[10]) == 622 || res.getValue(cols[10]) == 600 || res.getValue(cols[10]) == 601 || res.getValue(cols[10]) == 577 || res.getValue(cols[10]) == 578 || res.getValue(cols[10]) == 598 || res.getValue(cols[10]) == 599)
        cRow["mpec"] += 1;
      if (res.getValue(cols[10]) == 565 || res.getValue(cols[10]) == 558 || res.getValue(cols[10]) == 629 || res.getValue(cols[10]) == 628 || res.getValue(cols[10]) == 627 || res.getValue(cols[10]) == 626 || res.getValue(cols[10]) == 604 || res.getValue(cols[10]) == 605 || res.getValue(cols[10]) == 568 || res.getValue(cols[10]) == 567 || res.getValue(cols[10]) == 602 || res.getValue(cols[10]) == 603)
        cRow["mped"] += 1;

      cRow["revenue"] += parseFloat(res.getValue(cols[13]));
      cRow["commission"] += parseFloat(res.getValue(cols[14]));

      if (!found) rowData.push(cRow);

      // add to array
    }

    for (var r = 0; r < rowData.length; r++) {
      var row = new Object();
      var cRow = rowData[r];

      row["customer"] = cRow["customer"];
      row["mpen"] = cRow["mpen"] > 0 ? "" + parseInt(cRow["mpen"]) : " ";
      row["mpet"] = cRow["mpet"] > 0 ? "" + parseInt(cRow["mpet"]) : " ";
      row["mpef"] = cRow["mpef"] > 0 ? "" + parseInt(cRow["mpef"]) : " ";
      row["mpeg"] = cRow["mpeg"] > 0 ? "" + parseInt(cRow["mpe"]) : " ";
      row["mpeb"] = cRow["mpeb"] > 0 ? "" + parseInt(cRow["mpeb"]) : " ";
      row["mpec"] = cRow["mpec"] > 0 ? "" + parseInt(cRow["mpec"]) : " ";
      row["mped"] = cRow["mped"] > 0 ? "" + parseInt(cRow["mped"]) : " ";
      row["revenue"] = "$" + cRow["revenue"].toFixed(2);
      row["commission"] = "$" + cRow["commission"].toFixed(2);

      list.addRow(row);
    }

    response.writePage(list);
  }
}