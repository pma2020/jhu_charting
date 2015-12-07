function validateFilters(containerId) {
  var chartType = getInput(containerId, 'chart_types');
  var selectedDates = getCheckedItems(containerId, 'year');
  var selectedCountries = getCountries(containerId);

  disablePieOption(containerId, selectedCountries, selectedDates);
  toggleOverTimeOption(containerId, selectedDates, selectedCountries);
  disableUnavailableFilters(containerId);

  return chartable(containerId, selectedDates);
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
  var chartSelect = $("#dataset_chart_types_" + containerId + " option[value='Pie']");
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
              .attr("value", 'Pie')
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

function chartable(containerId, dates) {
  var selectedIndicator = getSelectedItemValue(containerId, 'indicators');
  var selectedGrouping = getSelectedItemValue(containerId, 'group_filters');
  var chartType = getSelectedItemValue(containerId, 'chart_types');

  if(dates.length > 0 && selectedIndicator.length > 0 && selectedGrouping.length > 0 && chartType.length > 0) {
    enableCharting(containerId, '');
    return true;
  } else {
    enableCharting(containerId, 'disabled');
    return false;
  }
}

function enableCharting(containerId, state) { $('#submit-chart-filters-' + containerId).prop('disabled', state) };

function disableUnavailableFilters(containerId) {
  var selectedIndicator = getSelectedItemValue(containerId, 'indicators');
  var selectedGrouping = getSelectedItemValue(containerId, 'group_filters');

  var groupFilterInput = getInput(containerId, 'group_filters');
  var indicatorFilterInput = getInput(containerId, 'indicators');

  var unavailableIndicatorFilters = unavailableFilters[selectedIndicator];
  var unavailableGroupingFilters = unavailableFilters[selectedGrouping];

  enableFilters(groupFilterInput);
  enableFilters(indicatorFilterInput);


  if(unavailableIndicatorFilters) {
    disableFilters(
      unavailableIndicatorFilters,
      groupFilterInput);
  }
  if(unavailableGroupingFilters) {
    disableFilters(
      unavailableGroupingFilters,
      indicatorFilterInput);
  }
};

function enableFilters(input) {
  input.find('option').each(function() {
    $(this).prop('disabled', '');
  });
};

function disableFilters(filters, input) {
  if(filters.length > 0) {
    filters.forEach(function(filter) {
      input.find("option[value='" + filter + "']").prop('disabled', 'disabled');
    });
  }
};
