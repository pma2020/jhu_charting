function downloadCSV(containerId) {
  var data = chartData(containerId, false) || [];
  var xAxis = data[0];
  var title = data[2];
  var disaggregator = data[4];
  var seriesData = data[5];

  $form = $("<form></form>");
  $form.attr('action', "/datasets/chart_csv.csv");
  $form.attr('method', "POST");
  $('<input>').attr({
    type: 'hidden',
    id: 'series',
    name: 'series',
    value: JSON.stringify(seriesData)
  }).appendTo($form);
  $('<input>').attr({
    type: 'hidden',
    id: 'xAxis',
    name: 'xAxis',
    value: JSON.stringify(xAxis)
  }).appendTo($form);
  $('<input>').attr({
    type: 'hidden',
    id: 'disaggregator',
    name: 'disaggregator',
    value: disaggregator
  }).appendTo($form);
  $('<input>').attr({
    type: 'hidden',
    id: 'authenticity_token',
    name: 'authenticity_token',
    value: $('meta[name="csrf-token"]').attr('content')
  }).appendTo($form);
  $form.submit();
};

