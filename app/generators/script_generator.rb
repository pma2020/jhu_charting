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
