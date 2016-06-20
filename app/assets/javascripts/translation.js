function updateLanguage() {
  $('.i18nable-button').each(function() { $(this).text(translate($(this).val(), labelText)); });
  $('.i18nable-checkbox').each(function() { $(this).val(translate($(this).data('type'), labelText)); });
  $('.i18nable-label').each(function() { $(this).text(titleCase(translate($(this).data('type'), labelText))); });
  $("select.i18nable option").each(function() { $(this).text(translate($(this).val(), labelText)); });
  $("h4.i18nable").each(function() { $(this).text(translate($(this).data('value'), labelText)); });
  $("b.i18nable").each(function() { $(this).text(translate($(this).data('value'), labelText)); });
  displayHelpText();
  generateChart();
};

function translate(text, type) {
  if(text == "") { text = 'Select option'; }
  var language = selectedData().language;
  var originalText = text;
  var key = keyify(text);
  if(type[key]) { text = type[key][language]; }
  else {
    text = originalText;
    //console.log('There was not a translation for ' + key + ' in the specified type.')
  }
  return text
};

function translateCountryRound(countryRound) {
  var parts = countryRound.split(" ");
  var country = parts[0];
  var year = parts[1];
  var round = parts[2];
  var roundNumber = parts[3];

  return [
    translate(country, labelText),
    year,
    translate(round, labelText),
    roundNumber
  ].join(" ");
};

function translateCountries(countries) {
  var translated = [];
  countries.forEach(function(country) {
    if (country.indexOf("*") > -1) {
      country = country.split("*")[0];
      translated.push(titleCase(translate(country, labelText)) + '*');
    } else {
      translated.push(titleCase(translate(country, labelText)));
    }
  });
  return translated;
};

