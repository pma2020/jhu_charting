function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };
function keyify(text) {
  if(typeof text === 'undefined' || text == ''){
    console.log('Warning text may be blank!');
  } else {
    return text.toLowerCase().replace(/ /g, '_');
  }
}

function appendToHash(hsh, key, value) {
  if (hsh[key] == null || hsh[key] == {}) { hsh[key] = [value]; }
  else { hsh[key].push(value) }
  return hsh;
};

function multiSeries(countries, dates) {
  if (countries.length >= 1 && dates.length > 1) {
    return true
  } else {
    return false
  }
};

function checkValue(value) {
  if(value == null || (value.length == 1 && value.indexOf(".") >= 0)) { return null; }
  return value;
};

function scrollToAnchor(aid){
  $('html, body').animate({
    scrollTop: $(aid).offset().top
  }, 500);
  return false;
};

function titleCase(string) {
  if (string == null) { return null; } else {
    return (string.charAt(0).toUpperCase() + string.slice(1)).replace("_", " ");
  }
}

function nullSeries(series) {
  return series.every(function(v){return (v == null || isNaN(v))});
}

function dataValues(hsh) {
  var values = [];
  for(var k in hsh) { values.push(hsh[k].y); }
  return values;
}
