FactoryGirl.define do
  factory :dataset do
    sequence(:name) {|n| "Dataset #{n}" }
    sequence(:csv_file_id) {|n| "#{n}" }
  end
end
