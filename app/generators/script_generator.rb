require 'version.rb'

class ScriptGenerator
  include ActionView::Helpers
  include ActionView::Context

  def initialize(metadata = {}, data = {})
    @metadata = metadata
    #@denormalized_data = denormalized_data
    @data = data
  end

  def generate
    <<-"EOS"
      #{attribution}
      <div class='container-fluid'>
        <div id='jhu-chart'>
          <div class='row top-row'>
            <div class='col-md-3'>
              <section class='chart-sidebar'>
                <!-- Nav tabs -->
                <ul class="nav nav-tabs" role="tablist">
                  <li role="presentation" class="active"><a href="#controls" aria-controls="controls" role="tab" data-toggle="tab">Controls</a></li>
                  <li role="presentation"><a href="#help-center" aria-controls="help-center" role="tab" data-toggle="tab">Help Center</a></li>
                  <li role="presentation"><a href="#style" aria-controls="style" role="tab" data-toggle="tab">Style</a></li>
                </ul>
                <!-- Tab panes -->
                <div class="tab-content">
                  <div role="tabpanel" class="tab-pane active" id="controls">
                    #{language_picker}
                    #{select_box_filter('nested_indicators', 'Indicators', true, true)}
                    #{select_box_filter('disaggregators', 'Break down data by', true)}
                    #{data_series_limiters}
                    <div class='row'>
                      <div class='col-md-12'>
                        <div class='data-series'>
                          #{data_series}
                        </div>
                      </div>
                    </div>
                    <div class='row'>
                      <div class='col-md-8'>
                        #{chart_type_buttons('chart_types')}
                      </div>
                      <div class='col-md-4'>
                        <div id='overtime-checkbox-container-#{container_id}' class='overtime-checkbox-container form-group'>
                          <h4 class='i18nable-label' data-type='over-time'>Over-time:</h4>
                          #{overtime_checkbox}
                        </div>
                      </div>
                    </div>
                    <div class='row'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Black and White:
                      </label>
                      <input type="checkbox" class="filter black-and-white-check" id="dataset_black_and_white_#{container_id}">
                    </div>
                    <div class='row'>
                      <div class='col-md-12'>
                      #{button_tag('Chart', type: :button, value: 'Chart', id: "submit-chart-filters-#{container_id}", class: 'submit-chart i18nable-button btn btn-success btn-block btn-lg', disabled: 'disabled')}
                      #{button_tag('Download CSV', type: :button, value: 'Download CSV', id: "download-csv-#{container_id}", class: 'i18nable-button btn btn-success btn-block btn-lg', disabled: 'disabled')}
                      </div>
                    </div>
                  </div>
                  <div role="tabpanel" class="tab-pane" id="help-center">
                    <div class='help-center'>
                      <p>
                        Change components from the controls tab to get more info here.
                      </p>
                      <div class='help-definition indicator'></div>
                      <div class='help-definition group-filter'></div>
                    </div>
                  </div>
                  <div role="tabpanel" class="tab-pane" id="style">
                    <h4 class='text-center'>Chart Font</h4>
                    <div class="bfh-selectbox bfh-fonts" data-font="Arial">
                    </div>
                    <h4 class='text-center'>Chart Color Options</h4>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Background color:
                      </label>
                      <input class='color form-input' id="chart-background-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Title color:
                      </label>
                      <input class='color form-input' id="title-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Label color:
                      </label>
                      <input class='color form-input' id="label-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Y-Axis color:
                      </label>
                      <input class='color form-input' id="y-axis-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        X-Axis color:
                      </label>
                      <input class='color form-input' id="x-axis-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Tick color:
                      </label>
                      <input class='color form-input' id="tick-color"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Minor Tick color:
                      </label>
                      <input class='color form-input' id="minor-tick-color"/>
                    </div>
                    <h4 class='text-center'>Axis Labels</h4>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        Y-Axis Label:
                      </label>
                      <input class='form-input' id="y-axis-label"/>
                    </div>
                    <div class='form-group'>
                      <label for='chart-background-color' class='col-md-6 text-right'>
                        X-Axis Label:
                      </label>
                      <input class='form-input' id="x-axis-label"/>
                    </div>
                    <h4 class='text-center'>Axis Title Position</h4>
                    <div class='form-group'>
                      <label for='y-axis-x-position' class='col-md-6 text-right'>
                        Y-Axis X:
                      </label>
                      <input class='form-input' id="y-axis-x-position" placeholder='Default: 0'/>
                    </div>
                    <div class='form-group'>
                      <label for='y-axis-y-position' class='col-md-6 text-right'>
                        Y-Axis Y:
                      </label>
                      <input class='form-input' id="y-axis-y-position" placeholder='Default: 0'/>
                    </div>
                    <div class='form-group'>
                      <label for='x-axis-x-position' class='col-md-6 text-right'>
                        X-Axis X:
                      </label>
                      <input class='form-input' id="x-axis-x-position" placeholder='Default: 0'/>
                    </div>
                    <div class='form-group'>
                      <label for='x-axis-y-position' class='col-md-6 text-right'>
                        X-Axis Y:
                      </label>
                      <input class='form-input' id="x-axis-y-position" placeholder='Default: 0'/>
                    </div>
                    <h4 class='text-center'>Marker and Labels</h4>
                    <div class='form-group'>
                      <label for='marker-size' class='col-md-6 text-right'>
                        Marker Size:
                      </label>
                      <input class='form-input' id="marker-size" placeholder='Default: 4'/>
                    </div>
                    <div class='form-group'>
                      <label for='data-label-x-position' class='col-md-6 text-right'>
                        Data Label X:
                      </label>
                      <input class='form-input' id="data-label-x-position" placeholder='Default: 0' />
                    </div>
                    <div class='form-group'>
                      <label for='data-label-y-position' class='col-md-6 text-right'>
                        Data Label Y:
                      </label>
                      <input class='form-input' id="data-label-y-position" placeholder='Default: -6' />
                    </div>
                    <br/>
                    <br/>
                    #{button_tag('Chart', type: :button, value: 'Update Chart', id: "submit-chart-filters-#{container_id}", class: 'submit-chart i18nable-button btn btn-success btn-block btn-lg', disabled: 'disabled')}
                  </div>
                </div>
              </section>
            </div>
            <div class='col-md-9'>
              <section class='chart-viewport'>
                <div id='chart-container-#{container_id}' class='chart-container'>
                  <div class='chart-placeholder'>
                    <h4>
                      <i class='fa fa-bar-chart'></i>
                    </h4>
                  </div>
                  <div class='clearfix'></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      #{javascripts}
      <!-- END DO NOT MODIFY CONTENT-->
    EOS
  end

  private

  def attribution
    <<-"EOS"
      <!--
        DO NOT MODIFY CONTENT BELOW
        Chart content generated by JHU Charting application.

        VERSION: #{VERSION}
      -->
    EOS
  end

  def javascripts
    <<-"EOS"
      <script>
        var metadata = #{@metadata.fetch(:year_by_country, {}).to_json};
        var availableLanguages = #{@metadata.fetch(:languages, {}).to_json};
        var helpText = #{@metadata.fetch(:help_text, {}).to_json};
        var labelText = #{@metadata.fetch(:label_text, {}).to_json};
        var unavailableFilters = #{@metadata.fetch(:unavailable_filters, {}).to_json};
        var data = #{chart_data};
        var denormalizedData = #{denormalized_chart_data};
        var chartContainer = $('#chart-container-#{container_id}');

        $('.filter').on('change', function() { validateFilters('#{container_id}', metadata) });
        $('.filter.filter-nested_indicators').on('change', function() { displayHelpText('#{container_id}') });
        $('.filter.filter-disaggregators').on('change', function() { displayHelpText('#{container_id}') });
        $('.year-check').on('change', function() { toggleCountryHeader($(this)) });
        $('#select-all-#{container_id}').on('click', function() {selectAll('#{container_id}')});
        $('#select-latest-#{container_id}').on('click', function() {selectLatest('#{container_id}')});
        $('#clear-all-#{container_id}').on('click', function() {clearAll('#{container_id}')});
        $('.clear-select').on('click', function() {clearSelect('#{container_id}', $(this))});
        $('#dataset-language-picker').on('change', function() {updateLanguage('#{container_id}')});
        $('.submit-chart').on('click', function() {
          generateChart('#{container_id}');
          $('#download-csv-#{container_id}').prop('disabled', '');
        });
        $('#download-csv-#{container_id}').on('click', function() { downloadCSV('#{container_id}'); });
        $('input.color').colorPicker();
        $(document).ready(function(){ updateLanguage('#{container_id}'); });

        $('.collapse').on('show.bs.collapse', function () {
          var checked = $(this).find("[type='checkbox']:checked").length;
          if (checked > 0) { return false; }
          $(this).parent().find(".country-header").find("i").removeClass("fa-plus").addClass("fa-minus");
        });

        $('.collapse').on('shown.bs.collapse', function () {
          var openItems = $('.collapse.in').length;
          if (openItems > 0) { $('.btn-group-justified button').attr('disabled', false); }
        });

        $('.collapse').on('hide.bs.collapse', function () {
          var checked = $(this).find("[type='checkbox']:checked").length;
          if (checked > 0) { return false; }
          $(this).parent().find(".country-header").find("i").removeClass("fa-minus").addClass("fa-plus");
        });

        $('.collapse').on('hidden.bs.collapse', function () {
          var openItems = $('.collapse.in').length;
          if (openItems == 0) { $('.btn-group-justified button').attr('disabled', true); }
        });
      </script>
    EOS
  end

  def language_picker
    id = "dataset-language-picker".to_sym
    <<-"EOS"
      <div class='row'>
        <div class='col-md-12'>
          <div class='form-group'>
            #{label_tag(id, "Language: ", class: 'i18nable-label', data: { type: 'Language' })}
            #{select_tag(id,
                options_for_select(select_options(@metadata.fetch(:languages).keys), 'None'),
                class: "filter filter-language form-control")}
          </div>
        </div>
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
          if @metadata.fetch(:years).include?(b.text) && data_attributes.has_key?(:country)
            year = b.text.split("-").first
            round = get_round(data_attributes.fetch(:country), b.text)
            text = "#{year} - #{round}"
          else
            text = b.text
          end

          b.check_box(
            class: "filter year-check #{type.singularize}-check-#{container_id}",
            disabled: disabled,
            data: data_attributes
          ) + text
        end
      end
    end
  end

  def chart_type_buttons(label=nil)
    id = "dataset_chart_types_#{container_id}".to_sym
    values = @metadata.fetch(:chart_types)

    <<-"EOS"
      <div class='form-group'>
        <h4 class='i18nable-label' data-type='chart-type'>Chart Type:</h4>
        <div id=#{id.to_s} data-toggle="buttons">
          #{chart_button(values)}
        </div>
      </div>
    EOS
  end

  def chart_button(values)
    values.collect do |value|
      <<-"EOS"
        <label class="btn btn-primary">
          <input type='radio'
                 name='options'
                 class='filter'
                 id='option-#{value.downcase}'
                 data-type='#{value.downcase}'
                 autocomplete='off' checked>
          <i class='fa fa-#{chart_icon(value)}'></i>
        </label>
      EOS
    end.join(" ")
  end

  def chart_icon(value)
    case value
    when 'Column'
      "bar-chart"
    when 'Bar'
      'bar-chart fa-mirror'
    else
      "#{value.downcase}-chart"
    end
  end

  def get_round(country, year)
    @metadata.fetch(:rounds_by_country)[country][year]
  end

  def select_box_filter(type, label = nil, clear_button = false, grouped = false)
    label = type unless label
    label_safe = label.humanize.capitalize
    label_ref = type =="disaggregators" ? type.singularize.downcase.underscore : label.downcase.underscore
    id = "dataset_#{type}_#{container_id}".to_sym
    values = @metadata.fetch(type.to_sym)

    <<-"EOS"
    <div class='row'>
      <div class='col-md-12'>
        <div class='form-group'>
          #{label_tag(id, "#{label_safe}", class: 'i18nable-label', data: { type: label_ref })}
          <div class="input-group">
             #{select_tag(id,  options(values, grouped), class: "selectpicker filter filter-#{type} i18nable", prompt: "Select option", data: {"live-search" => "true" })}
             <span class="input-group-btn">
                #{clear_button(id) if clear_button}
             </span>
          </div>
        </div>
      </div>
    </div>
    EOS
  end

  def data_series
    @metadata.fetch(:year_by_country, {}).collect do |k,v|
      data_attributes = { country: k }
      <<-"EOS"
      <div class='row'>
        <div class='col-md-12'>
          <div class='country-header' data-toggle="collapse" href="#collapse-#{k}" aria-expanded="false" aria-controls="collapseExample">
            <i class="fa fa-plus"></i>
            <b class='i18nable' data-value='#{k}'>#{k}</b>
          </div>
          <div class='date-selection collapse' id="collapse-#{k}">
            #{checkboxes('year', v, false, data_attributes)}
          </div>
        </div>
      </div>
      EOS
    end.join("")
  end

  def data_series_limiters
    <<-EOS
    <div class='row'>
      <div class='col-md-12'>
        <div class="btn-group btn-group-justified" role="group">
          <div class="btn-group" role="group">
            #{button_tag('All', type: :button, value: 'All', id: "select-all-#{container_id}", class: 'i18nable-button btn btn-primary', disabled: "disabled")}
          </div>
          <div class="btn-group" role="group">
            #{button_tag('Latest', type: :button, value: 'Latest', id: "select-latest-#{container_id}", class: 'i18nable-button btn btn-primary', disabled: "disabled")}
          </div>
          <div class="btn-group" role="group">
            #{button_tag('Clear', type: :button, value: 'Clear', id: "clear-all-#{container_id}", class: 'i18nable-button btn btn-primary', disabled: "disabled")}
          </div>
        </div>
      </div>
    </div>
    EOS
  end

  def options(values, grouped = false)
    if grouped
      grouped_options_for_select(values)
    else
      options_for_select(select_options(values))
    end
  end

  def clear_button(id)
    button_tag(type: :button, id: "clear-#{id}", class: 'clear-select icon-button btn btn-primary', data: { id: id }) do
      content_tag(:i, nil, class: 'fa fa-times')
    end
  end

  def container_id
    @container_id ||= SecureRandom.hex(15)
  end

  def denormalized_chart_data
    @denormalized_data.to_json
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
