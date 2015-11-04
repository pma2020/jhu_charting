require 'rails_helper'

RSpec.describe DatasetParser, type: :model do
  let!(:csv) { File.open(Rails.root.join("spec", "fixtures", "test.csv")) }

  describe "#load" do
    let(:data_parser) { DatasetParser.new(csv) }

    it "loads the csv data" do
      expect(data_parser.load).to_not be_empty
    end
  end
end
