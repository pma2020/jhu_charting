require 'date'

class DatasetParser
  INDICATOR_HEADER_RANGE_START = 5
  AVAILABLE_CHART_TYPES = ['Bar', 'Column', 'Line', 'Pie'].freeze
  HEADER_MAP = {
    country: "Country",
    date: "Date",
    round: "Round",
    grouping: "Grouping"
  }.freeze
  HELP_FILE_DELIMITER = "|".freeze


  attr_reader :data, :help_data, :countries, :years, :disaggregators, :languages

  def initialize(csv, help_file)
    @csv = csv
    @help_file = help_file
    load
  end

  def script
    ScriptGenerator.new(metadata, data).generate
  end

  def load
    @data ||= SmarterCSV.process(@csv, csv_parse_options)
    @indicator_categories = @data.shift
    @help_data ||= SmarterCSV.process(@help_file, csv_parse_options)
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
      rounds_by_country: rounds_by_country,
      years: years,
      year_by_country: years_by_country,
      disaggregators: disaggregators,
      nested_indicators: nested_indicators,
      chart_types: chart_types,
      languages: language_codes,
      help_text: help_text,
      label_text: label_text,
      unavailable_filters: unavailable_filters
    }
  end

  def unavailable_filters
    unavailable_filters = Hash.new
    available_filters = Hash.new
    all_indicators = data.first.keys
    all_disaggregators = data.collect{|row| row['Grouping']}.uniq!
    all_filters = all_indicators + all_disaggregators

    data.each do |row|
      subdata = row.select{|k,v| indicators.include?(k)}
      current_item = available_filters.fetch(row['Grouping'], [])

      subdata.each do |k,v|
        if v.present? #!
          current_item.push(k)
          sub_item = available_filters.fetch(k, [])
          available_filters[k] = sub_item.push(row['Grouping'])
        end
      end
      available_filters[row['Grouping']] = current_item
    end

    available_filters.each do |k,v|
      v.uniq!
      unavailable_filters[k] = all_filters - v
    end

    unavailable_filters
  end

  def help_text
    auxiliary_metadata('help')
  end

  def label_text
    auxiliary_metadata('label')
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

  def rounds_by_country
    round_header = HEADER_MAP.fetch(:round)
    countryHeader = HEADER_MAP.fetch(:country)
    yearHeader = HEADER_MAP.fetch(:date)
    results = Hash.new

    countries.map do |country|
      sub_result = Hash.new
      data.find_all{|row| row[countryHeader] == country}.each do |row|
        sub_result[row[yearHeader]] = row[round_header]
      end
      results[country] = sub_result
    end

    results
  end

  def countries
    @countries ||= filter_items_for(:country)
  end

  def years
    @years ||= filter_items_for(:date)
  end

  def disaggregators
    @disaggregators ||= filter_items_for(:grouping)
  end

  def indicators
    @indicators ||= filters_from_columns(INDICATOR_HEADER_RANGE_START)
  end

  def nested_indicators
    result = Hash.new
    data = @indicator_categories.to_a[INDICATOR_HEADER_RANGE_START..@indicator_categories.length]
    categories = data.collect{|x| x.last }.uniq
    categories.each{ |category| result[category] = Array.new }
    data.each do |item|
      result[item.last].push(item.first)
    end
    result
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

  private

  def auxiliary_metadata(type = 'help')
    tmp_hash = Hash.new

    help_data.each do |row|
      term = row['ID'].downcase.gsub(' ', '_')
      language_hash = Hash.new
      languages(row).each do |language|
        language_hash[language] = row["#{type}#{HELP_FILE_DELIMITER}#{language}"]
      end
      tmp_hash[term] = language_hash
    end

    tmp_hash
  end

  def languages(row)
    @languages ||= process_row_for_languages(row)
  end

  def process_row_for_languages(row)
    languages = row.keys.collect{|key| key.split(HELP_FILE_DELIMITER).last}
    languages.shift # Shift ID off the languages
    languages.uniq
  end

  def language_codes
    potential_languages.select{|k,v| languages(help_data.first).include?(k) }
  end

  def potential_languages
    potential_languages = Hash.new
    ISO::Language.all.each do |language|
      potential_languages[language.name] = language.code
    end
    potential_languages
  end
end

class DateConverter
  def self.convert(value)
    Date.strptime(value, '%m - %Y')
  end
end

class Indicator
  attr_reader :val, :group

  def initialize(val, group)
    @val = val
    @group = group
  end
end
