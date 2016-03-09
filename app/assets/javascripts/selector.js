function getCheckedItems(containerId, type) {
  var checkedItems = [];
  $('.' + type + '-check-' + containerId + ':checked').each(function() {
    checkedItems.push($(this).val());
  });
  return checkedItems;
};

function getInput(containerId, type) {
  return $('#dataset_' + type + '_' + containerId);
};

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
  $('.year-check-' + containerId + ':checked').each(function() {
    countries.push($(this).data('country'));
  });

  var uniqueCountries = [];
  $.each(countries, function(i, el){
    if($.inArray(el, uniqueCountries) === -1) uniqueCountries.push(el);
  });

  return uniqueCountries;
};
