function getSelectedYearRounds() {
  var year_rounds = [];
  $('.year-check:checked').each(function() {
    year_rounds.push({ year: $(this).data('date'), round: $(this).data('round')});
  });
  return year_rounds;
};

function getInput(containerId, type) {
  return $('#dataset_' + type + '_' + containerId);
};

function getCheckValue(containerId, type) {
  return getInput(containerId, type)[0].checked;
}

function getSelectedItemValue(containerId, type) {
  return getInput(containerId, type).val();
};

function getSelectedChartType(containerId, type) {
  return getInput(containerId, type).find("label.active").find("input").data("type");
};

function getSelectedItemDisplayText(containerId, type) {
  return getInput(containerId, type).find(":selected").text();
};

function getCountries(containerId) {
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
