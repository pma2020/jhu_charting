function selectedData() {
  var chartType = getSelectedChartType('chart_types');
  var selectedCountryYearRounds = getSelectedCountryYearRounds();
  var selectedCountries = getCountries();
  var selectedYearRounds = getSelectedYearRounds();
  var selectedYears = getSelectedYears();
  var selectedIndicator = getSelectedItemValue('indicators');
  var selectedIndicatorName = getSelectedItemDisplayText('indicators');
  var selectedGrouping = getSelectedItemValue('disaggregators');
  var selectedGroupingName = getSelectedItemDisplayText('disaggregators');
  var blackAndWhite = getBlackAndWhiteState();
  var overTime = getOvertimeState();
  var language = $('#dataset-language-picker').val();

  return {
    chartType: chartType,
    countryYearRounds: selectedCountryYearRounds,
    countries: selectedCountries,
    yearRounds: selectedYearRounds,
    years: selectedYears,
    indicator: selectedIndicator,
    indicatorName: selectedIndicatorName,
    disaggregator: selectedGrouping,
    disaggregatorName: selectedGroupingName,
    blackAndWhite: blackAndWhite,
    overTime: overTime,
    language: selectedLanguage
  }
};

function getSelectedYearRounds() {
  return getSelectedCountryYearRounds().map(function(item){
    return { year: item.year, round: item.round };
  });
};

function getSelectedYears() {
  return getSelectedCountryYearRounds().map(function(item){
    return item.year;
  });
};

function getSelectedCountryYearRounds() {
  var year_rounds = [];
  $('.year-check:checked').each(function() {
    year_rounds.push({
      country: $(this).data('country'),
      year: $(this).data('date'),
      round: $(this).data('round')
    });
  });
  return year_rounds;
};

function getOvertimeState() {
  return getCheckValue('overtime');
};

function getBlackAndWhiteState() {
  return getCheckValue('black_and_white');
};

function getInput(type) {
  return $('#dataset_' + type);
};

function getCheckValue(type) {
  return getInput(type)[0].checked;
}

function getSelectedItemValue(type) {
  return getInput(type).val();
};

function getSelectedChartType(type) {
  return getInput(type).find("label.active").find("input").data("type");
};

function getSelectedItemDisplayText(type) {
  return getInput(type).find(":selected").text();
};

function getCountries() {
  var countries = [];
  $('.year-check:checked').each(function() {
    countries.push($(this).data('country'));
  });

  var uniqueCountries = [];
  $.each(countries, function(i, el){
    if($.inArray(el, uniqueCountries) === -1) uniqueCountries.push(el);
  });

  return uniqueCountries;
};
