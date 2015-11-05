require 'date'

class DatasetParser
  attr_reader :data, :countries, :years

  def initialize(csv)
    @csv = csv
    load
  end

  def script
    ScriptGenerator.new(metadata, data).generate
  end

  def countries
    @countries ||= data.collect{|row| row[:country]}.uniq
  end

  def years
    @years ||= data.collect{|row| row[:date]}.uniq
  end

  def metadata
    {
      countries: countries,
      years: years
    }
  end

  private

  def load
    @data ||= SmarterCSV.process(@csv, options)
  end

  def options
    {
      row_sep: :auto,
      value_converters: { date: DateConverter }
    }
  end
end

class DateConverter
  def self.convert(value)
    Date.strptime(value, '%m/%d/%Y').year
  end
end
