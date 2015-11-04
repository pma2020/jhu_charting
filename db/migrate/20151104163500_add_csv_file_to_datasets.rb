class AddCsvFileToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :csv_file_id, :string
  end
end
