require 'rails_helper'

RSpec.describe DatasetParser, type: :model do
  let!(:csv) { File.open(Rails.root.join('spec', 'fixtures', 'test.csv')) }

  describe '#script' do
    let(:data_parser) { DatasetParser.new(csv) }

    it 'generates a script' do
      script = data_parser.script
      expect(script).to_not be_nil
      expect(script).to include('DO NOT MODIFY')
    end
  end
end
