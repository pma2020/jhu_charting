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

  def load
    @data ||= SmarterCSV.process(@csv.download, csv_parse_options)
    @indicator_categories = @data.shift
    @help_data ||= SmarterCSV.process(File.open(
      @help_file.download,"r:bom|utf-8"
    ), csv_parse_options)
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
      rounds_by_country: rounds_by_country,
      disaggregators: disaggregators,
      indicators: nested_indicators,
      chart_types: chart_types,
      languages: languages(help_data.first),
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
      term = row['id'].downcase.gsub(' ', '_')
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

  def normalize_data
    all_grouping_categories.each do |grouping_category|
      grouped_data.each do |k,v|
        unless v.include?(grouping_category)
          puts "Adding blank row #{grouping_category} to #{k}"
          row = blank_row(k[0], k[2], k[1], grouping_category[0], grouping_category[1])
          data << row
        end
      end
    end
  end

  def all_grouping_categories
    grouping_categories = data.collect do |row|
      [row["Grouping"], row["Category"]]
    end.uniq
    grouping_categories.delete(["", ""])
    grouping_categories
  end

  def grouped_data
    x = data.group_by{|x| [x['Country'], x['Round'], x['Date']] }
    x.delete(["", "", ""]) # remove headers
    x.each {|k,v| x[k] = v.collect{|y| [y['Grouping'], y['Category']] }}
  end

  def blank_row(country, date, round, grouping, category)
    instance = data.last.dup
    instance.each do |k,v|
      instance[k] = nil
    end
    instance['Country'] = country
    instance['Date'] = date
    instance['Round'] = round
    instance['Grouping'] = grouping
    instance['Category'] = category
    instance
  end
end

class DateConverter
  def self.convert(value)
    Date.strptime(value, '%m - %Y')
  end
end
