function getCheckedItems(containerId, type) {
  var checkedItems = [];
  $('.' + type + '-check-' + containerId + ':checked').each(function() {
     checkedItems.push($(this).val());
  });
  return checkedItems;
};

function validateFilters(containerId, metadata) {
  var chartType = getSelectedItem(containerId, 'chart_types');
  var selectedCountries = getCheckedItems(containerId, 'country');
  var selectedDates = getCheckedItems(containerId, 'year');

  disablePieOption(containerId, selectedCountries, selectedDates);
  disableDates(containerId, selectedCountries, metadata);
};

function disableDates(containerId, countries, metadata) {
  var keys = Object.keys(metadata);
  keys.forEach(function(key) {
    var dates = metadata[key];
    if(countries.indexOf(key) >= 0) {
      dates.forEach(function(date) {
        $(".year-check-" + containerId + ":checkbox[value='" + date + "']").prop('disabled', '');
      });
    } else {
      dates.forEach(function(date) {
        $(".year-check-" + containerId + ":checkbox[value='" + date + "']").prop('disabled', 'disabled');
      });
    }
  });
};

function disablePieOption(containerId, countries, dates) {
  var chartSelect = $("#dataset_chart_types_" + containerId + " option[value='pie']");
  var disablePieForCountry = false;
  var disablePieForDate = false;

  // Add or remove pie option based on country
  if(countries.length > 1) { disablePieForCountry = true; }
  // Add or remove pie option based on country
  if(dates.length > 1) { disablePieForDate = true; }

  if(disablePieForCountry || disablePieForDate) {
    chartSelect.prop("disabled", "disabled");
  } else {
    chartSelect.prop("disabled", "");
  }
};

function getSelectedItem(containerId, type) {
  var selector = $('#dataset_' + type + '_' + containerId);
  return selector.val();
};

function filterData(dataSet, type, value) {
  var items = dataSet.filter(function(hsh) {
    return hsh[type] === value;
  });
  return items
};

function dataIntersection(arrays) {
  var result = arrays.shift().filter(function(v) {
    return arrays.every(function(a) {
      return a.indexOf(v) !== -1;
    });
  });
  return result;
};

function reduceDataSet(data, filters, filterType) {
  var result = [];
  if (isArray(filters) == true) {
    filters.forEach(function(filter) {
      result.push(filterData(data, filterType, filter));
    })
  } else {
    result.push(filterData(data, filterType, filters));
  }
  result = [].concat.apply([], result);
  return result;
};

function scopeDataSet(data, scope) {
  var scopedData = {};

  data.forEach(function(row) {
    var scopeKey = row[scope];

    if (scopedData[scopeKey] == null) {
      scopedData[scopeKey] = [row];
    } else {
      scopedData[scopeKey].push(row)
    }
  });

  return scopedData;
};

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

function reduceDataBasedOnSelection(countries, grouping, dates) {
  var countryFilter = [];
  var dateFilter = [];
  var groupingFilter = [];
  var reducedDataSet;

  countryFilter = reduceDataSet(data, countries, 'Country');
  dateFilter = reduceDataSet(data, dates, 'Date');
  groupingFilter = reduceDataSet(data, grouping, 'Grouping');

  reducedDataSet = dataIntersection([countryFilter, dateFilter, groupingFilter]);

  return scopeDataSet(reducedDataSet, 'Country');
};

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
};

function generateTitle(countries, indicator, grouping) {
  var titleResult;
  if (grouping == 'None') {
    titleResult = indicator + ' for ' + countries.join();
  } else {
    titleResult = indicator + ' by ' + grouping + ' for ' + countries.join();
  }
  return titleResult;
};

function generateChart(containerId, type, title, xAxis, yAxis, seriesData) {
  $('#chart-container-' + containerId).highcharts({
      chart: { type: type },
      title: { text: title },
      xAxis: { categories: xAxis },
      yAxis: { title: { text: yAxis } },
      series: seriesData
  });
};
