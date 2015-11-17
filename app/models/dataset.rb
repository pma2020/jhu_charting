class Dataset < ActiveRecord::Base
  attachment :csv_file
  attachment :help_file

  validates_presence_of :name

  def parse
    DatasetParser.new(
      csv_file.backend.path(csv_file.id),
      help_file.backend.path(help_file.id)
    )
  end

  def script
    parse.script
  end
end
