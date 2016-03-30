module DatasetHelper
  def select_options(values)
    values.collect do |item|
      item = item.to_s
      [item, item]
    end
  end

  def options(values, grouped = false)
    if grouped
      grouped_options_for_select(values)
    else
      options_for_select(select_options(values))
    end
  end

  def clear_button(id)
    button_tag(type: :button, id: "clear-#{id}", class: 'clear-select icon-button btn btn-primary', data: { id: id }) do
      content_tag(:i, nil, class: 'fa fa-times')
    end
  end

  def chart_icon(value)
    case value
    when 'Column'
      "bar-chart"
    when 'Bar'
      'bar-chart fa-mirror'
    else
      "#{value.downcase}-chart"
    end
  end

  def get_round(metadata, country, year)
    metadata.fetch(:rounds_by_country)[country][year]
  end
end
