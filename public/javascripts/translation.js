function updateLanguage(containerId) {
  $('.i18nable-button').each(function() { $(this).text(translate($(this).val(), labelText)); });
  $('.i18nable-checkbox').each(function() { $(this).val(translate($(this).data('type'), labelText)); });
  $('.i18nable-label').each(function() { $(this).text(translate($(this).data('type'), labelText)); });
  $("select.i18nable option").each(function() { $(this).text(translate($(this).val(), labelText)); });
  $("h4.i18nable").each(function() { $(this).text(translate($(this).data('value'), labelText)); });
  displayHelpText(containerId);
  generateChart(containerId);
};

function translate(text, type) {
  if(text == "") { text = 'Select option'; }
  var language = $('#dataset-language-picker').val();
  var key = keyify(text);
  if(type[key]) { text = type[key][language]; }
  return text
};
