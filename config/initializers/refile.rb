# config/initializers/refile.rb
require "refile/s3"

aws = {
  access_key_id: ENV['S3_ACCESS_KEY_ID'],
  secret_access_key: ENV['S3_SECRET_ACCESS_KEY'],
  region: "us-east-1",
  bucket: "pma2020datasets",
}

Refile.cache = Refile::S3.new(prefix: "cache", **aws)
Refile.store = Refile::S3.new(prefix: "store", **aws)
