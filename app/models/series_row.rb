class SeriesRow
  def initialize(row, categories)
    @row = row
    @categories = categories
  end

  def data
    { series_name => series_values }
  end

  private

  def series_name
    @row.fetch("name")
  end

  def series_values
    @row.fetch("data", {}).map.with_index do |row, index|
      row["name"] = @categories[index]
      row
    end.inject({}) do |acc, cur|
      acc.merge({cur["name"] => cur["y"]})
    end
  end
end
