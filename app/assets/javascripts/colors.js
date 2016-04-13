var HIGHCHARTS_DEFAULT_COLORS = [
  '#7cb5ec',
  '#434348',
  '#90ed7d',
  '#f7a35c',
  '#8085e9',
  '#f15c80',
  '#e4d354',
  '#2b908f',
  '#f45b5b',
  '#91e8e1'
];
var DEFAULT_COLORS = [
  '#ad241a',
  '#25577f',
  '#32722f',
  '#ff7f00',
  '#b1a601',
  '#a65628',
  '#f781bf',
  '#753c7e',
  '#999999',
  '#6a3d9a'
];
var BLACK_AND_WHITE_COLORS = [
  '#121212',
  '#515151',
  '#919191'
];

var COLOR_PALETTES = [
  'HIGHCHARTS_DEFAULT_COLORS',
  'DEFAULT_COLORS'
]

var FACTOR_BASE = 100;
var COLOR_SERIES_MIN = 1;
var COLOR_SERIES_MAX = 7;
var BLACK_AND_WHITE_MAX = 3;

function shadeColor(color, percent) {
  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

function generateColorPaletteOptions() {
  var colorPaletteSelect = $('#chart-palette');
  COLOR_PALETTES.forEach(function(palette) {
    var opt = document.createElement('option');
    opt.value = keyify(palette);
    opt.innerHTML = titleCase(humanize(palette));
    colorPaletteSelect.append(opt);
  });
  previewColorPalette();
};

function previewColorPalette() {
  var colorPalettePreview = $('#color-palette-preview');
  var colorPalette;
  colorPalettePreview.empty();

  selectedColorPalette().forEach(function(color) {
    var previewBox = document.createElement('div');
    previewBox.style.backgroundColor = color;
    previewBox.style.height = '25px';
    previewBox.style.width = '25px';
    previewBox.style.cssFloat = 'left';
    colorPalettePreview.append(previewBox);
  });
};

function selectedColorPalette() {
  var selectedColorPalette = $('#chart-palette').val();
  if (selectedColorPalette == 'default_colors') {
    return DEFAULT_COLORS;
  } else if (selectedColorPalette == 'highcharts_default_colors') {
    return HIGHCHARTS_DEFAULT_COLORS;
  }
};

function blackAndWhiteValue(seriesSize, index) {
  if(seriesSize > BLACK_AND_WHITE_MAX) {
    alert("Black and White color scheme is only available for " + BLACK_AND_WHITE_MAX + " or fewer Country/Rounds. Please select fewer Country/Rounds and try again");
    return false;
  }
  return BLACK_AND_WHITE_COLORS[index];
}

function colorValue(seriesSize, countryIndex, roundIndex) {
  if (seriesSize > COLOR_SERIES_MIN && seriesSize <= COLOR_SERIES_MAX) {
    var shadedColor;
    var baseColor = selectedColorPalette()[countryIndex]
    var factor = FACTOR_BASE / seriesSize;
    var offset = factor * roundIndex;
    return shadeColor(baseColor, offset);
  } else {
    return selectedColorPalette()[roundIndex];
  }
}
