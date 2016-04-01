class Dataset < ActiveRecord::Base
  attachment :csv_file
  attachment :help_file

  validates_presence_of :name

  def parse
    DatasetParser.new(csv_file, help_file)
  end

  def script
    parse.script
  end

  def embed_code(host)
<<-EOS
<script id='load_jhu_pma_chart'
     src='http://#{host}/embed.js'
     data-host='http://#{host}/'
     data-id='#{id}'></script>
EOS
  end
end
