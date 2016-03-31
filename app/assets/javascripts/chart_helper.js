function filterData(dataSet, type, value) {
  if (type == 'CountryDateRound') {
    var items = dataSet.filter(function(hsh) {
      return hsh['Country'] === value.country && hsh['Round'] === value.round && hsh['Date'] === value.year
    });
  } else {
    var items = dataSet.filter(function(hsh) {
      return hsh[type] === value;
    });
  };
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

function select(item, key) {
  var result = [];
  if (isArray(item) == true) {
    item.forEach(function(row) {
      result.push(row[key]);
    });
  }
  return result;
}

function uniq(array) {
  return array.filter(function(i,x,a){return x==a.indexOf(i);});
};

function addRow(data, category, countryRound) {
  var keys = Object.keys(data[0]);
  var tmpItem = {};
  // null out everything
  keys.forEach(function(key) { tmpItem[key] = null; });
  tmpItem['Country'] = countryRound.split("|")[0];
  tmpItem['Round'] = countryRound.split("|")[1];
  tmpItem['Date'] = countryRound.split("|")[2];
  tmpItem['Category'] = category;
  data.push(tmpItem);
};

function syncDataSets(data) {
  var sets = {};
  data.forEach(function(row) {
    var key = row['Country'] + "|" + row['Round'] + "|" + row['Date'];
    if (sets[key] == null) {
      sets[key] = [row['Category']];
    } else {
      var items = sets[key];
      items.push(row['Category']);
      sets[key] = items;
    }
  });
  var allValues  = uniq($.map(sets, function(v) { return v; }));

  Object.keys(sets).forEach(function(countryRound) {
    allValues.forEach(function(category) {
      if (sets[countryRound].indexOf(category) == -1) {
        addRow(data, category, countryRound);
      }
    });
  });

  return data;
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

function reduceDataBasedOnSelection(countryDateRounds, grouping, overTime) {
  var reducedDataSet;
  var syncedData;

  var countries = countryDateRounds.map(function(obj){return obj.country });
  var dates = countryDateRounds.map(function(obj){return obj.year });

  reducedDataSet = dataIntersection([
    reduceDataSet(data, countryDateRounds, 'CountryDateRound'),
    reduceDataSet(data, grouping, 'Grouping')
  ]);

  if (overTime) {
    syncedData = reducedDataSet;
  } else {
    syncedData = syncDataSets(reducedDataSet);
  }

  var dataTestResult = validateDataset(syncedData, countries);
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

function generateSeriesData(chartType, countries, indicator, grouping, dateRounds, overTime, blackAndWhite, countryDateRounds) {
  var dataSet = reduceDataBasedOnSelection(countryDateRounds, grouping, overTime);
  var dates = dateRounds.map(function(obj){return obj.year});
  var series = [];
  var unassessedRounds = {};
  var xAxis = [];

  if(overTime) {
    dates.sort(function(a,b){ return Date.parse(a) - Date.parse(b); });

    for(var key in dataSet) {
      var countryData = dataSet[key];

      var roundIndex = 0;
      for(var countryKey in countryData) {
        var data = countryData[countryKey];
        var newRow = {};

        var countryIndex = countries.indexOf(countryData[countryKey][0]['Country']);
        if (blackAndWhite) {
          var color = blackAndWhiteValue(Object.keys(countryData).length, roundIndex);
          if (color == false) { return false }
          newRow['color'] = color;
        } else {
          newRow['color'] = colorValue(Object.keys(countryData).length, countryIndex, roundIndex)
        }

        newRow['name'] = titleCase(key) + ' ' + translate(countryKey, labelText);
        newRow['data'] = [];

        var tmpHsh = {};

        // Gather the possible keys
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

        roundIndex++;
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

    var countryIndex = 0;
    var roundIndex = 0;
    var totalIndex = 0;
    for(var countryDate in tmpHsh) {
      var country = keyify(countryDate.split("|")[0]);
      var lastCountry;
      if (lastCountry == null) { lastCountry = country; }
      var name  = countryDate.split("|")[1];
      var dataPoints = tmpHsh[countryDate];
      var newRow = {};

      if (country != lastCountry) {
        countryIndex++;
        roundIndex = 0;
      }

      if (blackAndWhite == true) {
        var color = blackAndWhiteValue(Object.keys(tmpHsh).length, totalIndex);
        if (color == false) { return false }
        newRow['color'] = color;
      } else {
        newRow['color'] = colorValue(countries.length, countryIndex, roundIndex);
      }

      newRow['data'] = [];
      newRow['name'] = name;

      dataPoints.forEach(function(dataPoint) {
        var dataElement = {};
        var val = checkValue(dataPoint);
        dataElement['y'] = parseFloat(val);
        newRow['data'].push(dataElement);
      });

      lastCountry = country;
      roundIndex++;
      totalIndex++;
      series.push(newRow);
    };

    var index = 0;
    for(var key in dataSet) {
      var hasNaN = false;
      var translatedText = translate(key, labelText);
      series.forEach(function(round) {
        if (isNaN(round['data'][index]['y'])){
          hasNaN = true;
          round['data'][index]['y'] = null;
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

      newRow['data'] = [];
      newRow['name'] = dateRoundLabel(countries[0], dates[0], data[0]['Round']).split("|")[1];

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
  return titleCase(country) + "|" + titleCase(translate(country, labelText)) + ' ' + date.split("-")[0] + ' ' + round;
};

function translateCountries(countries) {
  var translated = [];
  countries.forEach(function(country) {
    translated.push(titleCase(translate(country, labelText)));
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
  var citation = "Performance Monitoring and Accountability 2020. Johns Hopkins University; <br/>";
  var index = 1;
  for (partner in partners) {
    partner = partners[partner];
    citation += translate(partner+"_P", labelText) + "; ";
    if (index % 3 == 0 && index != 0) {
      citation += "<br/>";
    }
    index++;
  }
  citation += " " + new Date().toJSON().slice(0,10);
  return citation;
};

function unassessedRoundsWarning(unassessedRounds) {
  var warnings = [];
  Object.keys(unassessedRounds).forEach(function(indicator) {
    var warningString = indicator + '* was not assessed in: ' + unassessedRounds[indicator].join(', ');
    warnings.push(warningString);
  });
  return warnings.join("<br/>");
};

function chartData(overTime) {
  var chartType = getSelectedChartType('chart_types');
  var selectedCountryYearRound = getSelectedCountryYearRounds();
  var selectedCountries = getCountries();
  var selectedYearRounds = getSelectedYearRounds();
  var selectedIndicator = getSelectedItemValue('indicators');
  var selectedGrouping = getSelectedItemValue('disaggregators');
  var blackAndWhite = getCheckValue('black_and_white');
  var citationText = generateCitation(selectedCountries);
  if (typeof overTime == 'undefined') {
    var overTime = $('.overtime-check').prop('checked');
  }

  if(validateFilters()) {
    var title = generateTitle(
      selectedCountries,
      getSelectedItemDisplayText('indicators'),
      getSelectedItemDisplayText('disaggregators')
    );

    var chartComponents = generateSeriesData(
      chartType,
      selectedCountries,
      selectedIndicator,
      selectedGrouping,
      selectedYearRounds,
      overTime,
      blackAndWhite,
      selectedCountryYearRound
    );

    var xAxis = xAxisData(overTime, chartComponents[0]);
    var yAxis = getSelectedItemDisplayText('indicators');
    var seriesData = chartComponents[1];
    var warnings = unassessedRoundsWarning(chartComponents[2]);

    return [xAxis, yAxis, title, chartType, selectedGrouping, seriesData, warnings, citationText];
  }
};

function seriesDataLabels(overrides) {
  var dataLabelOverrides = {};
  if (!isNaN(overrides['data-label-x-position'])) {
    dataLabelOverrides['x'] = overrides['data-label-x-position'];
  }
  if (!isNaN(overrides['data-label-y-position'])) {
    dataLabelOverrides['y'] = overrides['data-label-y-position'];
  }
  return dataLabelOverrides;
};

function legendContent(lableColor, seriesCount, chartType) {
  var legendContent = {
    itemStyle: {
      color: lableColor
    },
  }
  if (seriesCount > 5 && chartType != 'pie') {
    legendContent['align'] = 'right',
    legendContent['verticalAlign'] = 'top',
    legendContent['layout'] = 'vertical',
    legendContent['x'] = 0,
    legendContent['y'] = 40
  }
  return legendContent
};

function generateChart() {
  var styles = chartStyles();
  var overrides = chartOverrides();

  var data = chartData() || [];
  var xAxis = data[0];
  var yAxis = data[1];
  // Override y-axis-label if necessary
  if (overrides['y-axis-label'] != "") { yAxis = overrides['y-axis-label']; }
  var title = data[2];
  var chartType = data[3].toLowerCase();
  var seriesData = data[5];
  var warnings = data[6];
  var citationText = data[7];

  var footerText = warnings + '<br/><br/>' + citationText;

  if(seriesData != false) {
    $('#chart-container').highcharts({
      plotOptions: {
        series: {
          connectNulls: true,
          marker: {
            radius: overrides['marker-size']
          },
          dataLabels: seriesDataLabels(overrides)
        },
        bar: { dataLabels: { enabled: true } },
        column: { dataLabels: { enabled: true } },
        line: { dataLabels: { enabled: true } },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true
          },
          showInLegend: true
        }
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
        text: footerText,
        position: {
          align: 'center',
          y: -100
        },
      },
      legend: legendContent(styles['label-color'], seriesData.length, chartType),
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

    scrollToAnchor('#chart-container');
  }
};
