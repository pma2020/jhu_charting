function downloadCSV(containerId) {
  var data = chartData(containerId, false) || [];
  var xAxis = data[0];
  var title = data[2];
  var disaggregator = data[4];
  var seriesData = data[5];

  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
    },
    url: "/datasets/chart_csv.csv",
    method: "POST",
    data: {
      series : seriesData,
      xAxis: xAxis,
      disaggregator: disaggregator
    },
    success: function(data) {
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([data]));
      link.download = title + ".csv";
      link.click();
    }
  });

};

