var DEFAULTCOLORS = [
  "#ad241a",
  "#25577f",
  "#32722f",
  "#ff7f00",
  "#b1a601",
  "#a65628",
  "#f781bf",
  "#753c7e",
  "#999999",
  "#6a3d9a"
]
var BLACK_AND_WHITE_COLORS = [ '#121212 ','#515151 ', '#919191' ]

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

function blackAndWhiteValue(seriesSize, index) {
  if(seriesSize > BLACK_AND_WHITE_MAX) {
    alert('Black and White color scheme is only available for 5 or fewer Country/Rounds. Please select fewer Country/Rounds and try again');
    return false;
  }
  return BLACK_AND_WHITE_COLORS[index];
}

function colorValue(seriesSize, countryIndex, roundIndex) {
  if (seriesSize > COLOR_SERIES_MIN && seriesSize <= COLOR_SERIES_MAX) {
    var shadedColor;
    var baseColor = DEFAULTCOLORS[countryIndex]
    var factor = FACTOR_BASE / seriesSize;
    var offset = factor * roundIndex;
    return shadeColor(baseColor, offset);
  }
}
