source 'https://rubygems.org'
ruby "2.2.1"

source 'https://rails-assets.tenex.tech' do
  gem 'rails-assets-jquery'
  gem 'rails-assets-bootstrap'
  gem 'rails-assets-highcharts'
  gem 'rails-assets-bootstrap-select'
end

gem 'rails', '4.2.4'
gem 'pg'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.1.0'
gem 'refile', '~> 0.6.0', require: 'refile/rails'
gem 'responders'
gem 'smarter_csv'
gem 'iso'
gem "font-awesome-rails"
gem 'turbolinks'
gem 'rack-cors', require: 'rack/cors'

group :development, :test do
  gem 'byebug'
  gem 'factory_girl_rails'
  gem 'pry-rails'
end

group :development do
  gem 'web-console', '~> 2.0'
  gem 'spring'
end

group :test do
  gem "capybara"
  gem "poltergeist"
  gem 'rspec-rails'
  gem "database_cleaner"
  gem "shoulda-matchers", require: false
end

group :production do
  gem 'rails_12factor'
  gem 'puma'
end
