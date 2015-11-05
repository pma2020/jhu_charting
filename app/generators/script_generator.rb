class ScriptGenerator
  include ActionView::Helpers

  def initialize(metadata = {}, data = {})
    @metadata = metadata
    @data = data
  end

  def generate
    <<-"EOS"
      <div class='filters'>
        #{checkbox_filter('countries')}
        #{checkbox_filter('years')}
        #{select_box_filter('group_filters')}
        #{select_box_filter('indicators')}
        #{select_box_filter('chart_types')}
        #{submit_tag("Chart", id: "submit-chart-filters-#{container_id}")}
      </div>
      <div id='chart-container-#{container_id}' style='width:100%; height:400px;'></div>
      <script src='http://code.highcharts.com/highcharts.js'></script>
      <script>
        var data = #{chart_data};
        var chartContainer = $('#chart-container-#{container_id}');

        // Chart Filter Submission
        $('#submit-chart-filters-#{container_id}').on('click', function() {
          console.log(getCheckedItems('country'));
          console.log(getCheckedItems('year'));
          console.log(getSelectedItem('group_filters'));
          console.log(getSelectedItem('indicators'));

          var chartType = getSelectedItem('chart_types');
          var selectedCountries = getCheckedItems('country');
          var selectedDates = getCheckedItems('year');
          var selectedIndicator = getSelectedItem('indicators');
          var selectedGrouping = getSelectedItem('group_filters');

          var title = generateTitle(selectedCountries, selectedIndicator, selectedGrouping);
          var chartComponents = generateSeriesData(chartType, selectedCountries, selectedIndicator, selectedGrouping, selectedDates);
          var xAxis = chartComponents[0];
          var seriesData = chartComponents[1]

          generateChart(chartType, title, xAxis, selectedIndicator, seriesData);
        });

        // Function to retrieve the selected items in a checkbox group
        function getCheckedItems(type) {
          var checkedItems = [];
          $('.' + type + '-check-#{container_id}:checked').each(function() {
             checkedItems.push($(this).val());
          });
          return checkedItems;
        }

        // Function to retrieve the selected item in a select group
        function getSelectedItem(type) {
          var selector = $('#dataset_' + type + '_#{container_id}');
          return selector.val();
        }

        function filterData(dataSet, type, value) {
          var items = dataSet.filter(function(hsh) {
            return hsh[type] === value;
          });
          return items
        }

        function dataIntersection(arrays) {
          var result = arrays.shift().filter(function(v) {
            return arrays.every(function(a) {
              return a.indexOf(v) !== -1;
            });
          });
          return result;
        }

        function reduceDataBasedOnSelection(countries, grouping, dates) {
          var countryFilter = [];
          var dateFilter = [];
          var groupingFilter = [];

          // filter countries
          countries.forEach(function(country) {
            countryFilter.push(filterData(data, 'country', country));
          })
          countryFilter = [].concat.apply([], countryFilter);

          dates.forEach(function(date) {
            dateFilter.push(filterData(data, 'date', date));
          });
          dateFilter = [].concat.apply([], dateFilter);

          groupingFilter.push(filterData(data, 'grouping', grouping));
          groupingFilter = [].concat.apply([], groupingFilter);

          var reducedDataSet = dataIntersection([countryFilter, dateFilter, groupingFilter]);
          var scopedData = {};

          reducedDataSet.forEach(function(row) {
            var country = row['country'];

            if (scopedData[country] == null) {
              scopedData[country] = [row];
            } else {
              scopedData[country].push(row)
            }
          });

          return scopedData;
        }

        function generateSeriesData(chartType, countries, indicator, grouping, dates) {
          var dataSet = reduceDataBasedOnSelection(countries, grouping, dates);
          var series = [];
          var xAxis = [];

          switch(chartType) {
              case 'bar':
                for(var key in dataSet) {
                  var data = dataSet[key];
                  var newRow = {};
                  newRow['name'] = key;
                  newRow['data'] = [];

                  data.forEach(function(row) {
                    var dataElement = {};
                    xAxis.push(row['category'])
                    dataElement['name'] = row['country'];
                    dataElement['y'] = row[indicator];
                    newRow['data'].push(dataElement);
                  });

                  series.push(newRow);
                };
                  break;
              case 'column':
                for(var key in dataSet) {
                  var data = dataSet[key];
                  var newRow = {};
                  newRow['name'] = key;
                  newRow['data'] = [];

                  data.forEach(function(row) {
                    var dataElement = {};
                    xAxis.push(row['category'])
                    dataElement['name'] = row['country'];
                    dataElement['y'] = row[indicator];
                    newRow['data'].push(dataElement);
                  });

                  series.push(newRow);
                };
                  break;
              case 'line':
                for(var key in dataSet) {
                  var data = dataSet[key];
                  var newRow = {};
                  newRow['name'] = key;
                  newRow['data'] = [];

                  data.forEach(function(row) {
                    var dataElement = {};
                    xAxis.push(row['category'])
                    dataElement['name'] = row['country'];
                    dataElement['y'] = row[indicator];
                    newRow['data'].push(dataElement);
                  });

                  series.push(newRow);
                };
                  break;
              case 'pie':
                  // code block
                  break;
              default:
                  console.log('unable to generate series for ' + chartType);
          }

          chartComponents = [xAxis, series];
          return chartComponents;
        }

        function generateTitle(countries, indicator, grouping) {
          var titleResult;
          if (grouping == 'None') {
            titleResult = indicator + ' for ' + countries.join();
          } else {
            titleResult = indicator + ' by ' + grouping + ' for ' + countries.join();
          }
          return titleResult;
        }

        function generateChart(type, title, xAxis, yAxis, seriesData) {
          $('#chart-container-#{container_id}').highcharts({
              chart: { type: type },
              title: { text: title },
              xAxis: { categories: xAxis },
              yAxis: { title: { text: yAxis } },
              series: seriesData
              // [{
              //     name: 'Jane',
              //     data: [1, 0]
              // }, {
              //     name: 'John',
              //     data: [5, 7]
              // }]
          });
        }
      </script>
    EOS
  end

  private

  def checkbox_filter(type)
    <<-"EOS"
    <div class='form-group'>
      #{label_tag("dataset_#{type}".to_sym, "#{type.humanize.capitalize}:")}
      #{collection_check_boxes(:dataset, type.to_sym, select_options(type.to_sym), :first, :last, {}, class: "#{type.singularize}-check-#{container_id}")}
    </div>
    EOS
  end

  def select_box_filter(type)
    id = "dataset_#{type}_#{container_id}".to_sym
    <<-"EOS"
    <div class='form-group'>
      #{label_tag(id, "#{type.humanize.capitalize}:")}
      #{select_tag(id,  options_for_select(select_options(type.to_sym), "None"))}
    </div>
    EOS
  end

  def container_id
    @container_id ||= SecureRandom.hex(15)
  end

  def chart_data
    @data.to_json
  end

  def select_options(type)
    @metadata[type].collect do |item|
      item = item.to_s
      [item.humanize, item]
    end
  end
end
