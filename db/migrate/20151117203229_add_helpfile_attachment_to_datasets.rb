class AddHelpfileAttachmentToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :help_file_id, :string
  end
end
