class Dataset < ActiveRecord::Base
  attachment :csv_file

  validates_presence_of :name
end
