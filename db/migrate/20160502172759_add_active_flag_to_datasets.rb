class AddActiveFlagToDatasets < ActiveRecord::Migration
  def change
    add_column(:datasets, :active, :boolean, default: false)
  end
end
