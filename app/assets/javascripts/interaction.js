function selectAll() {
  $('.collapse.in .year-check').each(function() { $(this).prop('checked', true); });
  validateFilters();
};

function selectLatest() {
  $('.date-selection').each(function() {
    $('.year-check').each(function() {
      $(this).prop('checked', false);
    });
  });
  $('.date-selection.collapse.in').each(function() {
    $(this).find('.year-check').last().prop('checked', true);
  });
  validateFilters();
};

function clearAll() {
  $('.year-check').each(function() {
    $(this).prop('checked', false);
  });
  validateFilters();
};

function clearSelect(el) {
  var select = el.data('id');
  $('#' + select).prop('selectedIndex', 0);
  $('#' + select).selectpicker('deselectAll');
  validateFilters();
}

function toggleCountryHeader(el) {
  var container = el.parents().eq(3);
  var checked_count = container.find("[type='checkbox']:checked").length;
  if (checked_count > 0) {
    container.find(".country-header b.i18nable").removeClass("active").addClass("active");
  } else {
    container.find(".country-header b.i18nable").removeClass("active");
  }
}
