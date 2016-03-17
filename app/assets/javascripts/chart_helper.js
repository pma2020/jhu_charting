var DEFAULTCOLORS = {
  "nigeria_kaduna":"#003366",
  "burkina":"#000066",
  "indonesia":"#660066",
  "niger":"#993333",
  "nigeria_lagos":"#663300",
  "uganda": "#003300",
  "kenya": "#999900",
  "ethiopia": "#09465b",
  "ghana": "#5FB404",
  "other": "#0000000"
}
var BLACK_AND_WHITE_COLORS = {
  'nigeria_kaduna':'#111111',
  'burkina':'#444444',
  'indonesia':'#555555',
  'niger':'#777777',
  'nigeria_lagos':'#888888',
  'uganda':'#999999',
  'kenya':'#AAAAAA',
  'ethiopia':'#BBBBBB',
  'ghana':'#EEEEEE',
  'other':'#000000'
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
  var dataSetInUse;
  if (overTime) {
    dataSetInUse = denormalizedData;
  } else {
    dataSetInUse = data;
  }

  reducedDataSet = dataIntersection([
    reduceDataSet(dataSetInUse, countries, 'Country'),
    reduceDataSet(dataSetInUse, dates, 'Date'),
    reduceDataSet(dataSetInUse, grouping, 'Grouping')
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

function generateSeriesData(chartType, countries, indicator, grouping, dates, overTime, blackAndWhite) {
  var dataSet = reduceDataBasedOnSelection(countries, grouping, dates, overTime);
  var series = [];
  var unassessedRounds = {};
  var xAxis = [];
  var colors;
  if (blackAndWhite) {
    colors = BLACK_AND_WHITE_COLORS
  } else {
    colors = DEFAULTCOLORS
  }

  if(overTime) {
    dates.sort(function(a,b){ return Date.parse(a) - Date.parse(b); });

    for(var key in dataSet) {
      var countryData = dataSet[key];

      var itemIndex = 1;
      for(var countryKey in countryData) {
        var data = countryData[countryKey];
        var newRow = {};
        var country = countryData[countryKey][0]['Country'];
        var curColor = shadeColor(colors[keyify(country)], (20*itemIndex));
        newRow['name'] = key + ' ' + translate(countryKey, labelText);
        newRow['data'] = [];
        newRow['color'] = curColor;

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

        nullKeys.forEach(function(date) { nullIndexes.push(date); });

        data.forEach(function(row) {
          var dataElement = {};

          country = translate(row['Country'], labelText);
          category = row['Category'];
          round = row['Round'];

          dataElement['name'] = country + ' ' + category + ' ' + round;
          dataElement['y'] = parseFloat(checkValue(tmpHsh[row['Date']]));
          dataElement['x'] = (new Date(row['Date']+"-02")).getTime()

          newRow['data'].push(dataElement);
        });

        nullIndexes.forEach(function(date) {
          var dataElement = {};

          dataElement['name'] = country + ' ' + category;
          dataElement['y'] = null;
          dataElement['x'] = (new Date(date+"-02")).getTime()

          newRow['data'].push(dataElement);
        });

        itemIndex++;
        xAxis = null;
        series.push(newRow);
      };
    }
  } else if(multiSeries(countries, dates)) {
    var tmpHsh = {};

    for(var key in dataSet) {
      var data = dataSet[key];

      data.forEach(function(row) {
        key = dateRoundLabel(row['Country'], row['Date'], row['Round']);
        appendToHash(tmpHsh, key, checkValue(row[indicator]));
      });
    };

    var itemIndex = 1;
    for(var countryDate in tmpHsh) {
      var country = keyify(countryDate.split("|")[0]);
      var name  = countryDate.split("|")[1];
      var dataPoints = tmpHsh[countryDate];
      var newRow = {};
      var color = colors[country];
      var shadedColor;

      if (blackAndWhite){shadedColor = color}
      else{shadedColor = shadeColor(color, (20*itemIndex))}


      newRow['data'] = [];
      newRow['name'] = name;
      newRow['color'] = shadedColor;

      dataPoints.forEach(function(dataPoint) {
        var dataElement = {};
        var val = checkValue(dataPoint);
        dataElement['y'] = parseFloat(val);
        newRow['data'].push(dataElement);
      });

      itemIndex++;
      series.push(newRow);
    };

    var index = 0;
    for(var key in dataSet) {
      var hasNaN = false;
      var translatedText = translate(key, labelText);
      series.forEach(function(round) {
        if (isNaN(round['data'][index]['y'])){
          hasNaN = true;
          if (unassessedRounds[key] == null || unassessedRounds[key] == undefined) {
            unassessedRounds[key] = [];
          }
          unassessedRounds[key].push(round['name']);
        }
      });
      if (hasNaN) {
        xAxis.push(translatedText + '*');
      } else {
        xAxis.push(translatedText);
      }
      index++;
    }

  } else {
    var itemIndex = 1;
    for(var key in dataSet) {
      var data = dataSet[key];
      var newRow = {};
      var color = colors[keyify(countries[0])];

      newRow['data'] = [];
      newRow['name'] = dateRoundLabel(countries[0], dates[0], data[0]['Round']);
      newRow['color'] = shadeColor(color, (20*itemIndex));

      data.forEach(function(row) {
        var dataElement = {};
        xAxis.push(translate(row['Category'], labelText))
        dataElement['name'] = row['Category'];
        dataElement['y'] = parseFloat(checkValue(row[indicator]));
        newRow['data'].push(dataElement);
      });

      series.push(newRow);
    }
    itemIndex++;
  };



  chartComponents = [xAxis, series, unassessedRounds];
  return chartComponents;
};

function dateRoundLabel(country, date, round) {
  return country + "|" + translate(country, labelText) + ' ' + date.split("-")[0] + ' ' + round;
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
  var citation = "Performance Monitoring and Accountability 2020. Johns Hopkins University; ";
  for (partner in partners) {
    partner = partners[partner];
    citation += translate(partner+"_P", labelText) + "; ";
  }
  citation += " " + new Date().toJSON().slice(0,10);
  return citation;
};

function xAxisData(overtime, components) {
  var styles = chartStyles();
  var overrides = chartOverrides();
  var xAxis = {};

  if (overtime) {
    xAxis['type'] = 'datetime';
  } else {
    xAxis['categories'] = components;
  }

  xAxis['lineColor'] = styles['x-axis-color'];
  xAxis['title'] = {
    text: overrides['x-axis-label'],
    style: {
      color: styles['label-color']
    },
    x: overrides['x-axis-x-position'],
    y: overrides['x-axis-y-position'],
  };
  xAxis['labels'] = {
    style: {
      color: styles['label-color']
    }
  };
  xAxis['tickColor'] = styles['tick-color'];
  xAxis['minorTickColor'] = styles['minor-tick-color'];

  return xAxis;
};

function unassessedRoundsWarning(unassessedRounds) {
  var warnings = [];
  Object.keys(unassessedRounds).forEach(function(indicator) {
    var warningString = indicator + '* was not assessed in: ' + unassessedRounds[indicator].join(', ');
    warnings.push(warningString);
  });
  return warnings.join("\n");
};

function chartData(containerId, overTime) {
  var chartType = getSelectedChartType(containerId, 'chart_types');
  var selectedCountries = getCountries(containerId);
  var selectedDates = getCheckedItems(containerId, 'year');
  var selectedIndicator = getSelectedItemValue(containerId, 'nested_indicators');
  var selectedGrouping = getSelectedItemValue(containerId, 'disaggregators');
  var blackAndWhite = getCheckValue(containerId, 'black_and_white');
  if (typeof overTime == 'undefined') {
    var overTime = $('.overtime-check-' + containerId).prop('checked');
  }
  $(".citation-viewport .panel .panel-body").text(generateCitation(selectedCountries));

  if(validateFilters(containerId)) {
    var title = generateTitle(
      selectedCountries,
      getSelectedItemDisplayText(containerId, 'nested_indicators'),
      getSelectedItemDisplayText(containerId, 'disaggregators')
    );

    var chartComponents = generateSeriesData(
      chartType,
      selectedCountries,
      selectedIndicator,
      selectedGrouping,
      selectedDates,
      overTime,
      blackAndWhite
    );

    var xAxis = xAxisData(overTime, chartComponents[0]);
    var yAxis = getSelectedItemDisplayText(containerId, 'nested_indicators');
    var seriesData = chartComponents[1];
    var warnings = unassessedRoundsWarning(chartComponents[2]);

    return [xAxis, yAxis, title, chartType, selectedGrouping, seriesData, warnings];
  }
};

function downloadCSV(containerId) {
  var data = chartData(containerId, false) || [];
  var xAxis = data[0];
  var title = data[2];
  var disaggregator = data[4];
  var seriesData = data[5];

  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
    },
    url: "/datasets/chart_csv.csv",
    method: "POST",
    data: {
      series : seriesData,
      xAxis: xAxis,
      disaggregator: disaggregator
    },
    success: function(data) {
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([data]));
      link.download = title + ".csv";
      link.click();
    }
  });

};

function chartStyles(containerId) {
  var chartBackgroundColor = $('input#chart-background-color').val() || '#FFFFFF';
  var yAxisColor = $('input#y-axis-color').val() || '#FFFFFF';
  var yAxisWidth = 0;
  if(yAxisColor != '#FFFFFF'){yAxisWidth=1};
  var xAxisColor = $('input#x-axis-color').val() || '#C0D0E0';
  var titleColor = $('input#title-color').val() || '#333333';
  var labelColor = $('input#label-color').val() || '#333333';
  var tickColor = $('input#tick-color').val() || '#333333';
  var minorTickColor = $('input#minor-tick-color').val() || '#333333';

  return {
    "chart-background-color" : chartBackgroundColor,
    "y-axis-color" : yAxisColor,
    "y-axis-width" : yAxisWidth,
    "x-axis-color" : xAxisColor,
    "title-color" : titleColor,
    "label-color" : labelColor,
    "tick-color" : tickColor,
    "minorTick-color" : minorTickColor
  }
};

function chartOverrides(containerId) {
  var yAxisLabel = $('input#y-axis-label').val();
  var xAxisLabel = $('input#x-axis-label').val();
  var yAxisX = $('input#y-axis-x-position').val();
  var yAxisY = $('input#y-axis-y-position').val();
  var xAxisX = $('input#x-axis-x-position').val();
  var xAxisY = $('input#x-axis-y-position').val();
  var markerSize = $('input#marker-size').val() || 4;
  var dataLabelX = $('input#data-label-x-position').val();
  var dataLabelY = $('input#data-label-y-position').val();
  var font = $('.bfh-selectbox-option').text()

  return {
    "y-axis-label" : yAxisLabel,
    "x-axis-label" : xAxisLabel,
    "y-axis-x-position" : parseInt(yAxisX),
    "y-axis-y-position" : parseInt(yAxisY),
    "x-axis-x-position" : parseInt(xAxisX),
    "x-axis-y-position" : parseInt(xAxisY),
    "marker-size" : parseInt(markerSize),
    "data-label-x-position" : parseInt(dataLabelX),
    "data-label-y-position" : parseInt(dataLabelY),
    "chart-font" : font,
  }
};

function generateChart(containerId) {
  var styles = chartStyles();
  var overrides = chartOverrides();

  var data = chartData(containerId) || [];
  var xAxis = data[0];
  var yAxis = data[1];
  // Override y-axis-label if necessary
  if (overrides['y-axis-label'] != "") { yAxis = overrides['y-axis-label']; }
  var title = data[2];
  var chartType = data[3].toLowerCase();
  var seriesData = data[5];
  var warnings = data[6];

  if(seriesData != false) {
    $('#chart-container-' + containerId).highcharts({
      plotOptions: {
        series: {
          connectNulls: true,
          marker: {
            radius: overrides['marker-size']
          },
          dataLabels: {
            x: overrides['data-label-x-position'],
            y: overrides['data-label-y-position']
          }
        },
        bar: { dataLabels: { enabled: true } },
        column: { dataLabels: { enabled: true } },
        line: { dataLabels: { enabled: true } },
        pie: { dataLabels: { enabled: true } }
      },
      chart: {
        type: chartType,
        marginBottom: 150,
        backgroundColor: styles["chart-background-color"],
        style: {
          fontFamily: overrides['chart-font']
        }
      },
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
      credits: {
        text: warnings,
        position: {
          align: 'center',
          y: -5
        },
      },
      legend: {
        itemStyle: {
          color: styles['label-color']
        }
      },
      title: {
        style: {
          color: styles['title-color']
        },
        text: title
      },
      subtitle: {
        style: {
          color: styles['title-color']
        },
        text: "PMA 2020"
      },
      xAxis: xAxis,
      yAxis: {
        min: 0,
        title: {
          text: yAxis,
          style: {
            color: styles['label-color']
          },
          x: overrides['y-axis-x-position'],
          y: overrides['y-axis-y-position'],
        },
        lineColor: styles['y-axis-color'],
        lineWidth: styles['y-axis-width'],
        labels: {
          style: {
            color: styles['label-color']
          }
        },
        tickColor: styles['tick-color'],
        minorTickColor: styles['minor-tick-color']
      },
      series: seriesData
    });

    scrollToAnchor('#chart-container-' + containerId);
  }
};
