class SeriesDataOverTime
  attr_reader :series

  def initialize(opts = {})
    @series = JSON.parse(opts.fetch("series"))
    @disaggregator = opts.fetch("disaggregator")
    @xAxis = JSON.parse(opts.fetch("xAxis"))
    @header = Array.new
  end

  def raw_data
    @raw_data = @series.collect{|x| x.fetch("data")}.flatten
  end

  def data
    @data = Hash.new
    raw_data.each do |row|
      date = Date.strptime((row["x"].to_f/1000).to_s, '%s').strftime("%Y-%m")
      @data[date] = @data[date] || []
      @data[date] << row["y"]
    end
    @data
  end

  def generate_csv
    CSV.generate do |csv|
      csv << csv_header

      data.each do |k,v|
        csv << [k,v].flatten
      end
    end
  end

  def csv_header
    series.collect{|x| x.fetch("name")}.unshift(@disaggregator)
  end
end
