class SeriesRow
  def initialize(row, xAxis)
    @row = row
    @xAxis = xAxis
  end

  def data
    raise "Invalid data series" if series_values.size != disaggregator_values.size
    data = Hash.new
    series_values.size.times do |index|
      data[disaggregator_values[index]] = series_values[index]
    end
    data
  end

  def header
    @row.fetch("name")
  end

  def series_values
    @row.fetch("data", {}).values.collect(&:values).flatten
  end

  def disaggregator_values
    @xAxis || []
  end
end
