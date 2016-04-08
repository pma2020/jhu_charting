function selectAll() {
  $('.collapse.in .year-check').each(function() {
    $(this).prop('checked', true);
    $(this).parents(".country-collapse").find('.country-header b.i18nable').removeClass("active").addClass("active");
  });
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
    $(this).parents(".country-collapse").find('.country-header b.i18nable').removeClass("active").addClass("active");
  });
  validateFilters();
};

function clearAll() {
  $('.year-check').each(function() {
    $(this).prop('checked', false);
    $(this).parents(".country-collapse").find('.country-header b.i18nable').removeClass("active");
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

function resetChart() {
  if (confirm('Are you sure you want to reset the chart styles?')) {
    $(".tab-pane#style").find("input[type=text], textarea").val("");
    generateChart();
    $('#download-csv').prop('disabled', '');
  };
};
