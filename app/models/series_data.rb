class SeriesData
  attr_reader :series

  def initialize(opts = {})
    @series = opts.fetch("series").values
    @disaggregator = opts.fetch("disaggregator")
    @xAxis = opts.fetch("xAxis")
  end


  def data
    @data = Hash.new
    @series.each do |row|
      series_row = SeriesRow.new(row, @xAxis)
      @data[series_row.header] = series_row.data
    end
    @data
  end

  def generate_csv
    CSV.generate do |csv|
      csv << csv_header

      csv_rows.each do |k,v|
        csv << v.unshift(k)
      end
    end
  end

  def csv_header
    data.keys.unshift(@disaggregator)
  end

  def csv_rows
    csv_rows = Hash.new
    csv_row_keys.each_with_index do |key, index|
      csv_rows[key] = transposed_data_values[index]
    end
    csv_rows
  end

  def csv_row_keys
    @xAxis.fetch("categories")
  end

  def transposed_data_values
    data.values.collect(&:values).transpose
  end
end
