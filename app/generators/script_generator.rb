class ScriptGenerator
  include ActionView::Helpers

  def initialize(metadata = {}, data = {})
    @metadata = metadata
    @data = data
  end

  def generate
    <<-"EOS"
      <div class='filters'>
        #{label_tag(:dataset_countries, "Countries:")}
        #{collection_check_boxes(:dataset, :countries, select_options(:countries), :first, :last, {}, class: 'country-check')}
        #{submit_tag("Chart", id: "submit-chart-filters-#{container_id}")}
      </div>
      <div id='chart-container-#{container_id}' style='width:100%; height:400px;'></div>
      <script src='http://code.highcharts.com/highcharts.js'></script>
      <script>
        var data = #{chart_data};
        var chartContainer = $('#chart-container-#{container_id}');

        // Chart Filter Submission
        $('#submit-chart-filters-#{container_id}').on('click', function() {
          console.log(getCheckedCountries());
        });

        // Function to retrieve the selected countries
        function getCheckedCountries() {
          var checkedCountries = [];
          $('.country-check:checked').each(function() {
             checkedCountries.push($(this).val());
          });
          return checkedCountries;
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
