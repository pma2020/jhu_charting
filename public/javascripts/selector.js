function getCheckedItems(containerId, type) {
  var checkedItems = [];
  $('.' + type + '-check-' + containerId + ':checked').each(function() {
    checkedItems.push($(this).val());
  });
  return checkedItems;
};

function getSelectedItem(containerId, type) {
  return $('#dataset_' + type + '_' + containerId);
};

function getSelectedItemValue(containerId, type) {
  return getSelectedItem(containerId, type).val();
};

function getSelectedItemDisplayText(containerId, type) {
  return getSelectedItem(containerId, type).find(":selected").text();
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
