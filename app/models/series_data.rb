class SeriesData
  attr_reader :series

  def initialize(opts = {})
    @series = JSON.parse(opts.fetch("series"))
    @disaggregator = opts.fetch("disaggregator")
    @xAxis = JSON.parse(opts.fetch("xAxis"))
  end


  def data
    @series.map do |row|
      SeriesRow.new(row, @xAxis.fetch("categories")).data
    end.inject(&:merge)
  end

  def generate_csv
    CSV.generate do |csv|
      csv << csv_header

      value_keys.each do |key|
        csv << [key, data.values.collect{|x| x[key]}].flatten
      end
    end
  end

  def csv_header
    data.keys.unshift(@disaggregator)
  end

  def value_keys
    @value_keys ||= data.values.collect{|x| x.keys}.flatten.uniq
  end
end
