function selectAll(containerId) {
  $('.year-check-' + containerId).each(function() { $(this).prop('checked', true); });
  validateFilters(containerId, metadata);
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
  validateFilters(containerId, metadata);
};

function clearAll(containerId) {
  $('.year-check-' + containerId).each(function() {
    $(this).prop('checked', false);
  });
  validateFilters(containerId, metadata);
};

