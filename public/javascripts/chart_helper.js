function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };

function appendToHash(hsh, key, value) {
  if (hsh[key] == null || hsh[key] == {}) { hsh[key] = [value]; }
  else { hsh[key].push(value) }
  return hsh;
}

function multiSeries(countries, dates) {
  if (countries.length >= 1 && dates.length > 1) {
    return true
  } else {
    return false
  }
};

function checkValue(value) {
  if(value == null || (value.length == 1 && value.indexOf(".") >= 0)) { return null; }
  return value;
}

function getCheckedItems(containerId, type) {
  var checkedItems = [];
  $('.' + type + '-check-' + containerId + ':checked').each(function() {
    checkedItems.push($(this).val());
  });
  return checkedItems;
};

function getSelectedItem(containerId, type) {
  var selector = $('#dataset_' + type + '_' + containerId);
  return selector.val();
};

function getCountries(containerId) {
  var countries = [];
  $('.year-check-' + containerId + ':checked').each(function() {
    countries.push($(this).data('country'));
  });

  var uniqueCountries = [];
  $.each(countries, function(i, el){
    if($.inArray(el, uniqueCountries) === -1) uniqueCountries.push(el);
  });

  return uniqueCountries;
};

function keyify(text) {
  return text.toLowerCase().replace(/ /g, '_');
}

function getHelpText(containerId, type) {
  var indicator = $('#dataset_indicators_' + containerId);
  var grouping = $('#dataset_group_filters_' + containerId);

  var indicatorKey = keyify(indicator.val());
  var groupingKey = keyify(grouping.val());

  var indicatorHelp = helpText[indicatorKey];
  var groupingHelp = helpText[groupingKey];

  var groupingMessage;
  var indicatorMessage;
  var errorMessage = helpText['!error'];

  console.log(errorMessage)

  if(groupingHelp == null) {
    if(errorMessage) {
      groupingMessage =  grouping.val() + ": " + errorMessage;
    } else {
      groupingMessage =  grouping.val() + ": " + "Uh oh, looks ike we are missing a definition for this one.";
    }
  } else {
    if (groupingKey == 'none') {
      groupingMessage = "";
    } else {
      groupingMessage =  grouping.val() + ": " + marked(groupingHelp);
    }
  }

  if(indicatorHelp == null) {
    if(errorMessage) {
      indicatorMessage =  indicator.val() + ": " + errorMessage;
    } else {
      indicatorMessage =  indicator.val() + ": " + "Uh oh, looks ike we are missing a definition for this one.";
    }
  } else {
    if (indicatorKey == 'none') {
      indicatorMessage = "";
    } else {
      indicatorMessage =  indicator.val() + ": " + marked(indicatorHelp);
    }
  }

  return "Disaggregator description for " + groupingMessage + "\n\n Indicator description for " + indicatorMessage;
}

function displayHelpText(containerId) {
  $('.help-center .help-definition').html(getHelpText(containerId));
  $('.help-center').show();
}

function selectAll(containerId) {
  $('.year-check-' + containerId).each(function() {
    $(this).prop('checked', true);
  });
  validateFilters(containerId, metadata);
};

function selectLatest(containerId) {
  console.log('herh')
  $('.date-selection').each(function() {
    $(this).find('.year-check-' + containerId).last().prop('checked', true);
  });
  validateFilters(containerId, metadata);
};

function clearAll(containerId) {
  $('.year-check-' + containerId).each(function() {
    $(this).prop('checked', false);
  });
  validateFilters(containerId, metadata);
};

function enableCharting(containerId, dates) {
  if(dates.length > 0) { $('#submit-chart-filters-' + containerId).prop('disabled', '');}
  else {$('#submit-chart-filters-' + containerId).prop('disabled', 'disabled');}
};

function validateFilters(containerId, metadata) {
  var chartType = getSelectedItem(containerId, 'chart_types');
  var selectedDates = getCheckedItems(containerId, 'year');
  var selectedCountries = getCountries(containerId);

  enableCharting(containerId, selectedDates);
  disablePieOption(containerId, selectedCountries, selectedDates);
  toggleOverTimeOption(containerId, selectedDates, selectedCountries);
};


function validateDataset(dataSet, countries) {
   var tmpHsh = {};

   countries.forEach(function(country) {
     tmpHsh[country] = [];
   });

   dataSet.forEach(function(row) {
     tmpHsh[row['Country']].push(row['Category']);
   });

   countries.forEach(function(country) {
     var uniqueTmpHshItems = [];
     var items = tmpHsh[country];

     $.each(items, function(i, el){
       if($.inArray(el, uniqueTmpHshItems) === -1) uniqueTmpHshItems.push(el);
     });

     tmpHsh[country] = uniqueTmpHshItems;
   });

   var tmpArr = [];
   countries.forEach(function(country) {
     tmpArr.push(tmpHsh[country].length);
   });

  var uniqueLength = [];
  $.each(tmpArr, function(i, el){
    if($.inArray(el, uniqueLength) === -1) uniqueLength.push(el);
  });

  if (uniqueLength.length > 1) {
    return [false, 'Sorry, the disaggregator you have chosen can not be charted with multiple Countries. Please choose another one or reduce the countries chosen to 1.']
  } else {
    return [true, null]
  }
}

function disablePieOption(containerId, countries, dates) {
  var chartSelect = $("#dataset_chart_types_" + containerId + " option[value='pie']");
  var disablePieForCountry = false;
  var disablePieForDate = false;

  // Add or remove pie option based on country
  if(countries.length > 1) { disablePieForCountry = true; }
  // Add or remove pie option based on country
  if(dates.length > 1) { disablePieForDate = true; }

  if(disablePieForCountry || disablePieForDate) {
    chartSelect.remove();
  } else {
    if(chartSelect.length <= 0) {
      $('#dataset_chart_types_' + containerId)
      .append($("<option></option>")
              .attr("value", 'pie')
              .text('Pie'));
    }
  }
};

function toggleOverTimeOption(containerId, dates, countries) {
  var overTimeCheckbox = $(".overtime-check-" + containerId);
  if(dates.length > 1 && countries.length > 0) { overTimeCheckbox.prop('disabled', ''); }
  else {
    overTimeCheckbox.prop('disabled', 'disabled');
    overTimeCheckbox.prop('checked', false);
  }
}

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
      xAxis.push(key);
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
          dataElement['y'] = checkValue(row[indicator]);
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
    exporting: {
      chartOptions: { // specific options for the exported image
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
    chart: { type: type.toLowerCase() },
    title: { text: title },
    xAxis: { categories: xAxis },
    yAxis: { title: { text: yAxis } },
    series: seriesData
  });
};
