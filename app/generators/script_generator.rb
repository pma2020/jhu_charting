require 'version.rb'

class ScriptGenerator
  include ActionView::Helpers
  include ActionView::Context

  def initialize(metadata = {}, data = {})
    @metadata = metadata
    @data = data
  end

  def generate
    <<-"EOS"
      <!--
        DO NOT MODIFY CONTENT BELOW
        Chart content generated by JHU Charting application.

        VERSION: #{VERSION}
      -->
      <style>#{ File.read(Rails.root.join('public', 'stylesheets', 'chart_styles.css')) }</style>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
      <div id='jhu-chart'>
        <section class='chart-header'>
          <div class='language-selector-container'>
            #{language_picker}
          </div>
          <div class='filters'>
            <div id='series-filters-container'>
              <div id='series-filters-buttons'>
                #{button_tag('All', type: :button, value: 'Select All', id: "select-all-#{container_id}", class: 'i18nable-button')}
                #{button_tag('Latest', type: :button, value: 'Select Latest', id: "select-latest-#{container_id}", class: 'i18nable-button')}
                #{button_tag('Clear', type: :button, value: 'Clear All', id: "clear-all-#{container_id}", class: 'i18nable-button')}
              </div>
              <div id='series-filters'>
                #{data_series}
              </div>
              <div class='clearfix'></div>
            </div>
          </div>
        </section>
        <section class='chart-sidebar'>
          <div class='filters'>
            <div id='limiting-filters-container'>
              #{select_box_filter('group_filters', 'Disaggregator', true)}
              #{select_box_filter('indicators', nil, true)}
              #{select_box_filter('chart_types')}
              <div id='overtime-checkbox-container-#{container_id}' class='overtime-checkbox-container form-group'>
                <h4 class='i18nable-label' data-type='over-time'>Over-time:</h4>
                #{overtime_checkbox}
              </div>
              <div class='clearfix'></div>
            </div>
            #{button_tag('Chart', type: :button, value: 'Chart', id: "submit-chart-filters-#{container_id}", class: 'submit-chart i18nable-button', disabled: 'disabled')}
            <div class='help-center'>
              <h4 class='i18nable' data-value='Help Center'>Help Center</h4>
              <span class='help-definition'></span>
            </div>
          </div>
        </section>
        <section class='chart-viewport'>
          <div id='chart-container-#{container_id}' style='height:600px;'>
            <div class='chart-placeholder'>
              <h4>
                <i class='fa fa-bar-chart'></i>
              </h4>
            </div>
          </div>
        </div>
      </section>
      <script src='https://code.jquery.com/jquery-2.1.4.min.js'></script>
      <script src='https://code.highcharts.com/highcharts.js'></script>
      <script src='https://code.highcharts.com/modules/exporting.js'></script>
      <script src='https://code.highcharts.com/modules/offline-exporting.js'></script>
      <script>
        #{ File.read(Rails.root.join('public', 'javascripts', 'markdown.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'utility.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'selector.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'help.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'validation.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'translation.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'interaction.js')) }
        #{ File.read(Rails.root.join('public', 'javascripts', 'chart_helper.js')) }

        var metadata = #{@metadata.fetch(:year_by_country, {}).to_json};
        var availableLanguages = #{@metadata.fetch(:languages, {}).to_json};
        var helpText = #{@metadata.fetch(:help_text, {}).to_json};
        var labelText = #{@metadata.fetch(:label_text, {}).to_json};
        var unavailableFilters = #{@metadata.fetch(:unavailable_filters, {}).to_json};
        var data = #{chart_data};
        var chartContainer = $('#chart-container-#{container_id}');

        $('.filter').on('change', function() { validateFilters('#{container_id}', metadata) });
        $('.filter.filter-indicators').on('change', function() { displayHelpText('#{container_id}') });
        $('.filter.filter-group_filters').on('change', function() { displayHelpText('#{container_id}') });
        $('#select-all-#{container_id}').on('click', function() {selectAll('#{container_id}')});
        $('#select-latest-#{container_id}').on('click', function() {selectLatest('#{container_id}')});
        $('#clear-all-#{container_id}').on('click', function() {clearAll('#{container_id}')});
        $('.clear-select').on('click', function() {clearSelect('#{container_id}', $(this))});
        $('#dataset-language-picker').on('change', function() {updateLanguage('#{container_id}')});
        $('#submit-chart-filters-#{container_id}').on('click', function() { generateChart('#{container_id}'); });
        $(document).ready(function(){updateLanguage('#{container_id}');});
      </script>
      <!-- END DO NOT MODIFY CONTENT-->
    EOS
  end

  private

  def language_picker
    id = "dataset-language-picker".to_sym
    <<-"EOS"
    <div class='form-group'>
      #{label_tag(id, "Language: ", class: 'i18nable-label', data: { type: 'Language' })}
      <span class='select-container'>
        #{select_tag(id,  options_for_select(select_options(@metadata.fetch(:languages).keys), 'None'), class: "filter filter-language")}
      </span>
    </div>
    EOS
  end

  def overtime_checkbox
    <<-"EOS"
    <div class="onoffswitch checkbox-group">
      <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox filter overtime-check-#{container_id}" id="myonoffswitch" disabled='disabled'>
      <label class="onoffswitch-label" for="myonoffswitch">
        <span class="onoffswitch-inner"></span>
        <span class="onoffswitch-switch"></span>
      </label>
    </div>
    EOS
  end

  def checkbox_filter(type)
    <<-"EOS"
    <div class='form-group'>
      #{label_tag("dataset_#{type}".to_sym, "#{type.humanize.capitalize}:")}
      #{checkboxes(type)}
    </div>
    EOS
  end

  def checkboxes(type, values, disabled = false, data_attributes = {})
    collection_check_boxes(:dataset, type.to_sym, select_options(values), :first, :last) do |b|
      content_tag(:span, class: "checkbox-group") do
        b.label do
          b.check_box(
            class: "filter #{type.singularize}-check-#{container_id}",
            disabled: disabled,
            data: data_attributes
          ) + b.text
        end
      end
    end
  end

  def select_box_filter(type, label = nil, clear_button = false)
    label = type unless label
    label_safe = label.humanize.capitalize
    label_ref = label.downcase.underscore
    id = "dataset_#{type}_#{container_id}".to_sym
    values = @metadata.fetch(type.to_sym)

    <<-"EOS"
    <div class='form-group form-group-#{type}'>
      #{label_tag(id, "#{label_safe}", class: 'i18nable-label', data: { type: label_ref })}
      <span class='select-container #{'select-cancelable' if clear_button}'>
        #{select_tag(id,  options_for_select(select_options(values)), class: "filter filter-#{type} i18nable", prompt: "Select option")}
      </span>
      #{clear_button(id) if clear_button}
    </div>
    EOS
  end

  def clear_button(id)
    button_tag(type: :button, id: "clear-#{id}", class: 'clear-select icon-button', data: { id: id }) do
      content_tag(:i, nil, class: 'fa fa-times')
    end
  end

  def data_series
    @metadata.fetch(:year_by_country, {}).collect do |k,v|
      data_attributes = { country: k }
      <<-"EOS"
      <div class='form-group'>
        <div class='country-header'>
          <b class='i18nable' data-value='#{k}'>#{k}</b>
        </div>
        <div class='date-selection'>
          #{checkboxes('year', v, false, data_attributes)}
        </div>
      </div>
      EOS
    end.join("")
  end

  def container_id
    @container_id ||= SecureRandom.hex(15)
  end

  def chart_data
    @data.to_json
  end

  def select_options(values)
    values.collect do |item|
      item = item.to_s
      [item, item]
    end
  end
end
