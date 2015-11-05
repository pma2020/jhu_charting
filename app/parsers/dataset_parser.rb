require 'date'

class DatasetParser
  INDICATOR_HEADER_RANGE_START = 5
  attr_reader :data, :countries, :years, :group_filters

  def initialize(csv)
    @csv = csv
    load
  end

  def script
    ScriptGenerator.new(metadata, data).generate
  end

  def countries
    @countries ||= filter_items_for(:country)
  end

  def years
    @years ||= filter_items_for(:date)
  end

  def group_filters
    @group_filters ||= filter_items_for(:grouping)
  end

  def indicators
    @indicators ||= filters_from_columns(INDICATOR_HEADER_RANGE_START)
  end

  def chart_types
    @chart_types ||= ['bar', 'column', 'line', 'pie']
  end

  def metadata
    {
      countries: countries,
      years: years,
      group_filters: group_filters,
      indicators: indicators,
      chart_types: chart_types
    }
  end

  private

  def load
    @data ||= SmarterCSV.process(@csv, csv_parse_options)
  end

  def csv_parse_options
    {
      row_sep: :auto,
      remove_empty_values: false,
      remove_zero_values: false,
      value_converters: { date: DateConverter }
    }
  end

  def filter_items_for(type)
    data.collect{|row| row[type]}.uniq
  end

  def filters_from_columns(start_index, end_index = nil)
    keys = data.first.keys
    end_index = keys.count unless end_index
    data.first.keys[start_index..end_index]
  end
end

class DateConverter
  def self.convert(value)
    Date.strptime(value, '%m/%d/%Y')
  end
end
