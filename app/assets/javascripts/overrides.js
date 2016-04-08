function xAxisData(overtime, components) {
  var styles = chartStyles();
  var overrides = chartOverrides();
  var xAxis = {};

  if (overtime) {
    xAxis['type'] = 'datetime';
  } else {
    xAxis['categories'] = components;
  }

  xAxis['lineColor'] = styles['x-axis-color'];
  xAxis['title'] = {
    text: overrides['x-axis-label'],
    style: {
      color: styles['label-color']
    },
    x: overrides['x-axis-x-position'],
    y: overrides['x-axis-y-position'],
  };
  xAxis['labels'] = {
    style: {
      color: styles['label-color']
    }
  };
  xAxis['tickColor'] = styles['tick-color'];
  xAxis['minorTickColor'] = styles['minor-tick-color'];

  return xAxis;
};

function chartStyles() {
  var chartBackgroundColor = $('input#chart-background-color').val() || '#FFFFFF';
  var yAxisColor = $('input#y-axis-color').val() || '#FFFFFF';
  var yAxisWidth = 0;
  if(yAxisColor != '#FFFFFF'){yAxisWidth=1};
  var xAxisColor = $('input#x-axis-color').val() || '#C0D0E0';
  var titleColor = $('input#title-color').val() || '#333333';
  var labelColor = $('input#label-color').val() || '#333333';
  var tickColor = $('input#tick-color').val() || '#333333';
  var minorTickColor = $('input#minor-tick-color').val() || '#333333';

  return {
    "chart-background-color" : chartBackgroundColor,
    "y-axis-color" : yAxisColor,
    "y-axis-width" : yAxisWidth,
    "x-axis-color" : xAxisColor,
    "title-color" : titleColor,
    "label-color" : labelColor,
    "tick-color" : tickColor,
    "minorTick-color" : minorTickColor
  }
};

function chartOverrides() {
  var yAxisLabel = $('input#y-axis-label').val();
  var xAxisLabel = $('input#x-axis-label').val();
  var yAxisX = $('input#y-axis-x-position').val();
  var yAxisY = $('input#y-axis-y-position').val();
  var xAxisX = $('input#x-axis-x-position').val();
  var xAxisY = $('input#x-axis-y-position').val();
  var creditsX = $('input#credits-x-position').val() || 0;
  var creditsY = $('input#credits-y-position').val() || 0;
  var bottomMarginOffset = $('input#bottom-margin-offset').val() || 115;
  var markerSize = $('input#marker-size').val() || 4;
  var dataLabelX = $('input#data-label-x-position').val();
  var dataLabelY = $('input#data-label-y-position').val();
  var font = $('.bfh-selectbox-option').text()

  return {
    "y-axis-label" : yAxisLabel,
    "x-axis-label" : xAxisLabel,
    "y-axis-x-position" : parseInt(yAxisX),
    "y-axis-y-position" : parseInt(yAxisY),
    "x-axis-x-position" : parseInt(xAxisX),
    "x-axis-y-position" : parseInt(xAxisY),
    "credits-x-position" : parseInt(creditsX),
    "credits-y-position" : parseInt(creditsY),
    "bottom-margin-offset" : parseInt(bottomMarginOffset),
    "marker-size" : parseInt(markerSize),
    "data-label-x-position" : parseInt(dataLabelX),
    "data-label-y-position" : parseInt(dataLabelY),
    "chart-font" : font,
  }
};

