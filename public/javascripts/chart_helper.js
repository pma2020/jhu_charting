// Function to retrieve the selected items in a checkbox group
function getCheckedItems(container_id, type) {
  var checkedItems = [];
  $('.' + type + '-check-' + container_id + ':checked').each(function() {
     checkedItems.push($(this).val());
  });
  return checkedItems;
}

// Function to retrieve the selected item in a select group
function getSelectedItem(container_id, type) {
  var selector = $('#dataset_' + type + '_' + container_id);
  return selector.val();
}

function filterData(dataSet, type, value) {
  var items = dataSet.filter(function(hsh) {
    return hsh[type] === value;
  });
  return items
}

function dataIntersection(arrays) {
  var result = arrays.shift().filter(function(v) {
    return arrays.every(function(a) {
      return a.indexOf(v) !== -1;
    });
  });
  return result;
}

function reduceDataBasedOnSelection(countries, grouping, dates) {
  var countryFilter = [];
  var dateFilter = [];
  var groupingFilter = [];

  // filter countries
  countries.forEach(function(country) {
    countryFilter.push(filterData(data, 'Country', country));
  })
  countryFilter = [].concat.apply([], countryFilter);

  dates.forEach(function(date) {
    dateFilter.push(filterData(data, 'Date', date));
  });
  dateFilter = [].concat.apply([], dateFilter);

  groupingFilter.push(filterData(data, 'Grouping', grouping));
  groupingFilter = [].concat.apply([], groupingFilter);

  var reducedDataSet = dataIntersection([countryFilter, dateFilter, groupingFilter]);
  var scopedData = {};

  reducedDataSet.forEach(function(row) {
    var country = row['Country'];

    if (scopedData[country] == null) {
      scopedData[country] = [row];
    } else {
      scopedData[country].push(row)
    }
  });

  return scopedData;
}

function generateSeriesData(chartType, countries, indicator, grouping, dates) {
  var dataSet = reduceDataBasedOnSelection(countries, grouping, dates);
  var series = [];
  var xAxis = [];

  if (chartType == "pie") {
    for(var key in dataSet) {
      var data = dataSet[key];
      var newRow = {};
      newRow['name'] = key;
      newRow['data'] = [];

      data.forEach(function(row) {
        var dataElement = {};
        xAxis.push(row['Category'])
        dataElement['name'] = row['Category'];
        dataElement['y'] = row[indicator];
        newRow['data'].push(dataElement);
      });

      series.push(newRow);
    };
  } else {
    for(var key in dataSet) {
      var data = dataSet[key];
      var newRow = {};
      newRow['name'] = key;
      newRow['data'] = [];

      data.forEach(function(row) {
        var dataElement = {};
        xAxis.push(row['Category'])
        dataElement['name'] = row['Country'];
        dataElement['y'] = row[indicator];
        newRow['data'].push(dataElement);
      });

      series.push(newRow);
    };
  }

  chartComponents = [xAxis, series];
  return chartComponents;
}

function generateTitle(countries, indicator, grouping) {
  var titleResult;
  if (grouping == 'None') {
    titleResult = indicator + ' for ' + countries.join();
  } else {
    titleResult = indicator + ' by ' + grouping + ' for ' + countries.join();
  }
  return titleResult;
}

function generateChart(container_id, type, title, xAxis, yAxis, seriesData) {
  $('#chart-container-' + container_id).highcharts({
      chart: { type: type },
      title: { text: title },
      xAxis: { categories: xAxis },
      yAxis: { title: { text: yAxis } },
      series: seriesData
  });
}
