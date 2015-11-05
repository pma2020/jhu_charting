class ScriptGenerator
  include ActionView::Helpers

  def initialize(metadata = {}, data = {})
    @metadata = metadata
    @data = data
  end

  def generate
    <<-"EOS"
      <div class='filters'>
        <div class='form-group'>
          #{label_tag(:dataset_countries, "Countries:")}
          #{collection_check_boxes(:dataset, :countries, select_options(:countries), :first, :last, {}, class: 'country-check')}
        </div>
        <div class='form-group'>
          #{label_tag(:dataset_years, "Years:")}
          #{collection_check_boxes(:dataset, :years, select_options(:years), :first, :last, {}, class: 'year-check')}
        </div>
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
        });

        // Function to retrieve the selected items in a checkbox group
        function getCheckedItems(type) {
          var checkedItems = [];
          $('.' + type + '-check:checked').each(function() {
             checkedItems.push($(this).val());
          });
          return checkedItems;
        }
      </script>
    EOS
  end

  private

  def container_id
    @container_id ||= SecureRandom.hex(15)
  end

  def chart_data
    @data.to_json
  end

  def select_options(type)
    @metadata[type].collect.with_index{|item| [item, item ] }
  end
end
