function filterData(dataSet, type, value) {
  var items = dataSet.filter(function(hsh) { return hsh[type] === value; });
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

function scopeDataSet(data, scope, countries) {
  var scopedData = {};

  if(scope == 'OverTime') {
    scope = 'Category';
    countries.forEach(function(country) { scopedData[country] = {}; });
    data.forEach(function(row) {
      appendToHash(scopedData[row['Country']], row[scope], row);
    });
  } else {
    data.forEach(function(row) {
      appendToHash(scopedData, row[scope], row);
    });
  }
  return scopedData;
};

function reduceDataBasedOnSelection(countries, grouping, dates, overTime) {
  var reducedDataSet;

  reducedDataSet = dataIntersection([
    reduceDataSet(data, countries, 'Country'),
    reduceDataSet(data, dates, 'Date'),
    reduceDataSet(data, grouping, 'Grouping')
  ]);

  var dataTestResult = validateDataset(reducedDataSet, countries);
  var validData = dataTestResult[0];
  var error = dataTestResult[1];

  if(validData) {
    var scopedData;

    if(overTime) {
      scopedData = scopeDataSet(reducedDataSet, 'OverTime', countries);
    } else if(multiSeries(countries, dates)) {
      scopedData = scopeDataSet(reducedDataSet, 'Category', countries);
    } else {
      scopedData = scopeDataSet(reducedDataSet, 'Country');
    }

    return scopedData;
  } else {
    alert(error);
  }
};

function generateSeriesData(chartType, countries, indicator, grouping, dates, overTime) {
  var dataSet = reduceDataBasedOnSelection(countries, grouping, dates, overTime);
  var series = [];
  var xAxis = [];

  if(overTime) {
    dates.sort(function(a,b){ return Date.parse(a) - Date.parse(b); });

    for(var key in dataSet) {
      var countryData = dataSet[key];

      for(var countryKey in countryData) {
        var data = countryData[countryKey];
        xAxis = dates;
        var newRow = {};
        newRow['name'] = key + ' ' + countryKey;
        newRow['data'] = [];

        var tmpHsh = {};

        data.forEach(function(row) {
          dates.forEach(function(date) {
            if(date == row['Date']) {
              tmpHsh[date] = row[indicator];
            } else {
              if(tmpHsh[date] == null || tmpHsh[date] == undefined) {
                tmpHsh[date] = null;
              }
            }
          });
        });
        var country;
        var category;
        var nullKeys = Object.keys(tmpHsh).filter(function(key) { return tmpHsh[key] == null });
        var nullIndexes = [];

        nullKeys.forEach(function(date) {
          nullIndexes.push(dates.indexOf(date));
        });

        data.forEach(function(row) {
          var dataElement = {};

          country = row['Country'];
          category = row['Category'];

          dataElement['name'] = country + ' ' + category;
          dataElement['y'] = checkValue(tmpHsh[row['Date']]);

          newRow['data'].push(dataElement);
        });

        nullIndexes.forEach(function(index) {
          var dataElement = {};

          dataElement['name'] = country + ' ' + category;
          dataElement['y'] = null;

          newRow['data'].splice(index, 0, dataElement);
        });

        series.push(newRow);
      };
    }
  } else if(multiSeries(countries, dates)) {
    var tmpHsh = {};

    for(var key in dataSet) {
      var data = dataSet[key];

      data.forEach(function(row) {
        key = row['Country'] + ' ' + row['Date'];
        appendToHash(tmpHsh, key, checkValue(row[indicator]));
      });
    };

    for(var key in dataSet) {
      xAxis.push(translate(key, labelText));
    }

    for(var countryDate in tmpHsh) {
      var newRow = {};
      newRow['data'] = [];
      newRow['name'] = countryDate;
      var dataPoints = tmpHsh[countryDate];

      dataPoints.forEach(function(dataPoint) {
        var dataElement = {};
        dataElement['y'] = checkValue(dataPoint);
        newRow['data'].push(dataElement);
      });

      series.push(newRow);
    };
  } else {
    if (chartType == "Pie") {
      for(var key in dataSet) {
        var data = dataSet[key];
        var newRow = {};
        newRow['name'] = key;
        newRow['data'] = [];

        data.forEach(function(row) {
          var dataElement = {};
          xAxis.push(translate(row['Category'], labelText));
          dataElement['name'] = row['Category'];
          dataElement['y'] = checkValue(row[indicator]);
          newRow['data'].push(dataElement);
        });

        series.push(newRow);
      };
    } else {
      for(var key in dataSet) {
        var data = dataSet[key];
        var newRow = {};
        newRow['name'] = countries + ' ' + dates;
        newRow['data'] = [];

        data.forEach(function(row) {
          var dataElement = {};
          xAxis.push(translate(row['Category'], labelText))
          dataElement['name'] = row['Category'];
          dataElement['y'] = checkValue(row[indicator]);
          newRow['data'].push(dataElement);
        });

        series.push(newRow);
      };
    }
  };

  chartComponents = [xAxis, series];
  return chartComponents;
};

function generateTitle(countries, indicator, grouping) {
  var titleResult =  indicator;
  if (grouping != 'None') { titleResult += ' by ' + grouping; }
  titleResult += ' for ' + countries.join();
  return titleResult;
};

function generateChart(containerId) {
  var chartType = getSelectedItemValue(containerId, 'chart_types');
  var selectedCountries = getCountries(containerId);
  var selectedDates = getCheckedItems(containerId, 'year');
  var selectedIndicator = getSelectedItemValue(containerId, 'indicators');
  var selectedGrouping = getSelectedItemValue(containerId, 'group_filters');
  var overTime = $('.overtime-check-' + containerId).prop('checked');

  if(validateFilters(containerId)) {
    var title = generateTitle(
      selectedCountries,
      getSelectedItemDisplayText(containerId, 'indicators'),
      getSelectedItemDisplayText(containerId, 'group_filters')
    );

    var chartComponents = generateSeriesData(
      chartType,
      selectedCountries,
      selectedIndicator,
      selectedGrouping,
      selectedDates,
      overTime
    );

    var xAxis = chartComponents[0];
    var yAxis = getSelectedItemDisplayText(containerId, 'indicators');
    var seriesData = chartComponents[1]

    $('#chart-container-' + containerId).highcharts({
      exporting: { // specific options for the exported image
        chartOptions: {
          plotOptions: {
            series: {
              dataLabels: {
                enabled: true
              }
            }
          }
        },
        scale: 3,
        fallbackToExportServer: false
      },
      plotOptions: { series: { connectNulls: true, } },
      chart: { type: chartType.toLowerCase() },
      title: { text: title },
      subtitle: { text: "PMA 2020" },
      xAxis: { categories: xAxis },
      yAxis: { title: { text: yAxis } },
      series: seriesData
    });

    scrollToAnchor('#chart-container-' + containerId);
  }
};
