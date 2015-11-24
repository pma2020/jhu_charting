function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };
function keyify(text) { return text.toLowerCase().replace(/ /g, '_'); }

function appendToHash(hsh, key, value) {
  if (hsh[key] == null || hsh[key] == {}) { hsh[key] = [value]; }
  else { hsh[key].push(value) }
  return hsh;
}

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
}

