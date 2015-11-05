class DatasetParser
  attr_reader :data, :countries

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

  def metadata
    {
      countries: countries
    }
  end

  private

  def load
    @data ||= SmarterCSV.process(@csv, row_sep: :auto)
  end

end
