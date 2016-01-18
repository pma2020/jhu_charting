function getHelpText(containerId) {
  var language = $('#dataset-language-picker').val();
  var indicator = $('#dataset_nested_indicators_' + containerId);
  var grouping = $('#dataset_group_filters_' + containerId);

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

  return groupingMessage + "\n\n" + indicatorMessage;
}

function displayHelpText(containerId) {
  $('.help-center .help-definition').html(getHelpText(containerId));
  $('.help-center').show();
}

