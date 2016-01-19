function selectAll(containerId) {
  $('.collapse.in .year-check-' + containerId).each(function() { $(this).prop('checked', true); });
  validateFilters(containerId);
};

function selectLatest(containerId) {
  $('.date-selection').each(function() {
    $('.year-check-' + containerId).each(function() {
      $(this).prop('checked', false);
    });
  });
  $('.date-selection.collapse.in').each(function() {
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

function toggleCountryHeader(el) {
  var container = el.parents().eq(3);
  var checked_count = container.find("[type='checkbox']:checked").length;
  if (checked_count > 0) {
    container.find(".country-header b.i18nable").removeClass("active").addClass("active");
  } else {
    container.find(".country-header b.i18nable").removeClass("active");
  }
}

$('.collapse').on('show.bs.collapse', function () {
  var checked = $(this).find("[type='checkbox']:checked").length;
  if (checked > 0) { return false; }
  $(this).parent().find(".country-header").find("i").removeClass("fa-plus").addClass("fa-minus");
});

$('.collapse').on('shown.bs.collapse', function () {
  var openItems = $('.collapse.in').length;
  if (openItems > 0) { $('.btn-group-justified button').attr('disabled', false); }
});

$('.collapse').on('hide.bs.collapse', function () {
  var checked = $(this).find("[type='checkbox']:checked").length;
  if (checked > 0) { return false; }
  $(this).parent().find(".country-header").find("i").removeClass("fa-minus").addClass("fa-plus");
});

$('.collapse').on('hidden.bs.collapse', function () {
  var openItems = $('.collapse.in').length;
  if (openItems == 0) { $('.btn-group-justified button').attr('disabled', true); }
});
