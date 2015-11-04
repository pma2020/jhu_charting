require 'rails_helper'

RSpec.describe DatasetParser, type: :model do
  let!(:csv) { File.open(Rails.root.join('spec', 'fixtures', 'test.csv')) }

  describe '#countries' do
    let(:data_parser) { DatasetParser.new(csv) }

    it 'loads the csv data' do
      expect(data_parser.countries).to eq(['Uganda'])
    end
  end

  describe '#metadata' do
    let(:data_parser) { DatasetParser.new(csv) }

    it 'loads the csv data' do
      expect(data_parser.metadata).to eq({ countries: ['Uganda'] })
    end
  end
end
