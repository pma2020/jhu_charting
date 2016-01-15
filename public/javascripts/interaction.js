function selectAll(containerId) {
  $('.year-check-' + containerId).each(function() { $(this).prop('checked', true); });
  validateFilters(containerId);
};

function selectLatest(containerId) {
  $('.date-selection').each(function() {
    $('.year-check-' + containerId).each(function() {
      $(this).prop('checked', false);
    });
  });
  $('.date-selection').each(function() {
    $(this).find('.year-check-' + containerId).last().prop('checked', true);
  });
  validateFilters(containerId);
};

function clearAll(containerId) {
  $('.year-check-' + containerId).each(function() {
    $(this).prop('checked', false);
  });
  validateFilters(containerId);
};

function clearSelect(containerId, el) {
  var select = el.data('id');
  $('#' + select).prop('selectedIndex', 0);
  $('#' + select).selectpicker('deselectAll');
  validateFilters(containerId);
}
