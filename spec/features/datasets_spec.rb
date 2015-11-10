require 'rails_helper'

feature 'Datasets' do
  let(:dataset_file) do
    Rails.root.join('spec', 'fixtures', 'test.csv')
  end

  context 'valid params' do
    scenario 'uploading a dataset' do
      visit datasets_path

      fill_in 'Name', with: 'Dataset 1'
      page.attach_file('Csv file', dataset_file)

      click_button("Save dataset")

      expect(page).to have_content('Dataset was successfully created.')
      expect(Dataset.first.name).to eq('Dataset 1')
    end
  end

  context 'invalid params' do
    scenario 'uploading a dataset' do
      visit datasets_path

      page.attach_file('Csv file', dataset_file)

      click_button("Save dataset")

      expect(page).to have_content('Dataset could not be created.')
      expect(page).to have_content('Name can\'t be blank')
      expect(Dataset.count).to eq(0)
    end
  end
end
