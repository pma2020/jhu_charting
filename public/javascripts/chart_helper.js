var DEFAULTCOLORS = {
  "uganda": "#B40404",
  "kenya": "#DF7401",
  "ethiopia": "#D7DF01",
  "ghana": "#5FB404",
  "other": "#088A85"
}

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
    alert(translate(error, labelText));
    return false;
  }
};

function generateSeriesData(chartType, countries, indicator, grouping, dates, overTime, colors) {
  var dataSet = reduceDataBasedOnSelection(countries, grouping, dates, overTime);
  var series = [];
  var xAxis = [];
  colors = colors || DEFAULTCOLORS;

  if(overTime) {
    dates.sort(function(a,b){ return Date.parse(a) - Date.parse(b); });

    for(var key in dataSet) {
      var countryData = dataSet[key];

      for(var countryKey in countryData) {
        var data = countryData[countryKey];
        xAxis = dates;
        var newRow = {};
        newRow['name'] = key + ' ' + translate(countryKey, labelText);
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
        var round;
        var nullKeys = Object.keys(tmpHsh).filter(function(key) { return tmpHsh[key] == null });
        var nullIndexes = [];

        nullKeys.forEach(function(date) {
          nullIndexes.push(dates.indexOf(date));
        });

        data.forEach(function(row) {
          var dataElement = {};

          country = translate(row['Country'], labelText);
          category = row['Category'];
          round = row['Round'];

          dataElement['name'] = country + ' ' + category + ' ' + round;
          dataElement['y'] = parseFloat(checkValue(tmpHsh[row['Date']]));

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
    var index = 0;

    for(var key in dataSet) {
      var data = dataSet[key];

      data.forEach(function(row) {
        key = dateRoundLabel(row['Country'], row['Date'], row['Round']);
        appendToHash(tmpHsh, key, checkValue(row[indicator]));
      });
    };

    for(var key in dataSet) { xAxis.push(translate(key, labelText)); }

    for(var countryDate in tmpHsh) {
      currentCountry = keyify(countryDate.split(" ")[0]);

      var newRow = {};
      var dataPoints = tmpHsh[countryDate];
      var color = colors[currentCountry];

      newRow['data'] = [];
      newRow['name'] = countryDate;

      if (keyify(chartType) == "line") {
        curColor = shadeColor(color, (10*index));
        newRow['color'] = curColor;
        index++;
      }

      var itemIndex = 0;
      dataPoints.forEach(function(dataPoint) {
        var dataElement = {};
        if (keyify(chartType) != 'line') {
          curColor = shadeColor(color, (10*itemIndex));
          dataElement['color'] = curColor;
          newRow['color'] = curColor;
        }
        dataElement['y'] = parseFloat(checkValue(dataPoint));
        newRow['data'].push(dataElement);
        itemIndex++;
      });

      series.push(newRow);
    };

  } else {
    var countryIndex = 0;
    for(var key in dataSet) {
      var data = dataSet[key];
      var newRow = {};
      if (colors) { var color = colors[key] } else {  var color = DEFAULTCOLORS[countryIndex] };
      newRow['name'] = dateRoundLabel(countries[0], dates[0], data[0]['Round']);
      newRow['data'] = [];

      var itemIndex = 0;
      data.forEach(function(row) {
        var dataElement = {};
        xAxis.push(translate(row['Category'], labelText))
        dataElement['name'] = row['Category'];
        dataElement['color'] = shadeColor(color, (8*itemIndex));
        dataElement['y'] = parseFloat(checkValue(row[indicator]));
        newRow['data'].push(dataElement);
        itemIndex++;
      });

      countryIndex++;
      series.push(newRow);
    }
  };

  chartComponents = [xAxis, series];
  return chartComponents;
};

function dateRoundLabel(country, date, round) {
  return translate(country, labelText) + ' ' + date.split("-")[0] + ' ' + round;
};

function translateCountries(countries) {
  var translated = [];
  countries.forEach(function(country) {
    translated.push(translate(country, labelText));
  });
  return translated;
};

function generateTitle(countries, indicator, grouping) {
  var titleResult =  indicator;
  var byArticle = translate('by', labelText);
  var forArticle = translate('for', labelText);
  if (grouping != 'None') { titleResult += ' ' + byArticle + ' ' + grouping; }
  titleResult += ' ' + forArticle + ' ' + translateCountries(countries).join(', ');
  return titleResult;
};

function generateCitation(partners) {
  if (partners) {
    return "Performance Monitoring and Accountability 2020. Johns Hopkins University; " + partners + " " + new Date().toJSON().slice(0,10);
  } else {
    return "Performance Monitoring and Accountability 2020. Johns Hopkins University;  " + new Date().toJSON().slice(0,10);
  }
};

function generateChart(containerId) {
  var chartType = getSelectedChartType(containerId, 'chart_types');
  var selectedCountries = getCountries(containerId);
  var selectedDates = getCheckedItems(containerId, 'year');
  var selectedIndicator = getSelectedItemValue(containerId, 'nested_indicators');
  var selectedGrouping = getSelectedItemValue(containerId, 'group_filters');
  var overTime = $('.overtime-check-' + containerId).prop('checked');
  $(".citation-viewport .panel .panel-body").text(generateCitation());

  if(validateFilters(containerId)) {
    var title = generateTitle(
      selectedCountries,
      getSelectedItemDisplayText(containerId, 'nested_indicators'),
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
    var yAxis = getSelectedItemDisplayText(containerId, 'nested_indicators');
    var seriesData = chartComponents[1]

    if(seriesData != false) {
      $('#chart-container-' + containerId).highcharts({
        plotOptions: {
          series: { connectNulls: true, },
          bar: { dataLabels: { enabled: true } },
          column: { dataLabels: { enabled: true } },
          line: { dataLabels: { enabled: true } },
          pie: { dataLabels: { enabled: true } }
        },
        chart: { type: chartType.toLowerCase() },
        title: { text: title },
        subtitle: { text: "PMA 2020" },
        xAxis: { categories: xAxis },
        yAxis: { min: 0, title: { text: yAxis } },
        series: seriesData
      });

      scrollToAnchor('#chart-container-' + containerId);
    }
  }
};
