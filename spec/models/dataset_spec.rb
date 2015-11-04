require 'rails_helper'

RSpec.describe Dataset, :type => :model do
  describe "validations" do
    it { expect(subject).to validate_presence_of(:name) }
  end
end
