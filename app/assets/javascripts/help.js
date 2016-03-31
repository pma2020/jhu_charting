function getHelpText() {
  var language = $('#dataset-language-picker').val();
  var indicator = $('#dataset_indicators');
  var grouping = $('#dataset_disaggregators');

  var indicatorKey = keyify(indicator.val());
  var groupingKey = keyify(grouping.val());

  var indicatorHelp = helpText[indicatorKey];
  var groupingHelp = helpText[groupingKey];

  var groupingMessage;
  var indicatorMessage;
  var errorMessage = helpText['!error'][language];

  if (groupingKey == "") {
    groupingMessage = "";
  } else if(groupingHelp == null) {
    if(errorMessage) {
      groupingMessage =  grouping.find(":selected").text() + ": " + errorMessage;
    } else {
      groupingMessage =  grouping.find(":selected").text() + ": " + "Uh oh, looks like we are missing a definition for this one.";
    }
  } else {
    if (groupingKey == 'none' && groupingHelp == null) {
      groupingMessage = "";
    } else {
      groupingMessage =  grouping.find(":selected").text() + ": " + marked(groupingHelp[language]);
    }
  }

  if (indicatorKey == "") {
    indicatorMessage = "";
  } else if(indicatorHelp == null) {
    if(errorMessage) {
      indicatorMessage =  indicator.find(":selected").text() + ": " + errorMessage;
    } else {
      indicatorMessage =  indicator.find(":selected").text() + ": " + "Uh oh, looks like we are missing a definition for this one.";
    }
  } else {
    if (indicatorKey == 'none' && indicatorHelp == null) {
      indicatorMessage = "";
    } else {
      indicatorMessage =  indicator.find(":selected").text() + ": " + marked(indicatorHelp[language]);
    }
  }

  var messages = {
    "group-filter": groupingMessage,
    "indicator": indicatorMessage
  }

  return messages
}

function displayHelpText() {
  var helpText = getHelpText();
  $('.help-center .help-definition.indicator').html(helpText['indicator']);
  $('.help-center .help-definition.group-filter').html(helpText['group-filter']);
}

