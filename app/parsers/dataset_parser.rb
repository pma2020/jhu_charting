require 'date'

class DatasetParser
  INDICATOR_HEADER_RANGE_START = 5
  AVAILABLE_CHART_TYPES = ['bar', 'column', 'line', 'pie'].freeze
  HEADER_MAP = {
    country: "Country",
    date: "Date",
    grouping: "Grouping"
  }.freeze

  attr_reader :data, :countries, :years, :group_filters

  def initialize(csv)
    @csv = csv
    load
  end

  def script
    ScriptGenerator.new(metadata, data).generate
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
      keep_original_headers: true,
      value_converters: { date: DateConverter }
    }
  end

  def metadata
    {
      countries: countries,
      years: years,
      group_filters: group_filters,
      indicators: indicators,
      chart_types: chart_types,
      year_by_country: years_by_country
    }
  end

  def years_by_country
    countryHeader = HEADER_MAP.fetch(:country)
    yearHeader = HEADER_MAP.fetch(:date)
    results = Hash.new

    countries.map do |country|
      results[country] = data.find_all{|row| row[countryHeader] == country}
                             .collect{|row| row[yearHeader]}.uniq
    end

    results
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
    @chart_types ||= AVAILABLE_CHART_TYPES
  end

  def filter_items_for(type)
    header = HEADER_MAP.fetch(type)
    data.collect{|row| row[header]}.uniq
  end

  def filters_from_columns(start_index, end_index = nil)
    keys = data.first.keys
    end_index = keys.count unless end_index
    data.first.keys[start_index..end_index]
  end
end

class DateConverter
  def self.convert(value)
    Date.strptime(value, '%m - %Y')
  end
end
