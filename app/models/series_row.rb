class SeriesRow
  def initialize(row, xAxis)
    @row = row
    @xAxis = xAxis
  end

  def header
    @row.fetch("name")
  end

  def series_values
    @row.fetch("data", {}).collect(&:values).flatten
  end

  def disaggregator_values
    @xAxis || []
  end
end
