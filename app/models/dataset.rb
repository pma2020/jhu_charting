class Dataset < ActiveRecord::Base
  attachment :csv_file

  validates_presence_of :name

  def parse
    DatasetParser.new(csv_file.backend.path(csv_file.id))
  end

  def script
    parse.script
  end
end
