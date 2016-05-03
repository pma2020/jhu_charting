class DatasetsController < ApplicationController
  before_action :set_dataset, only: [:show, :embed, :activate, :destroy]
  after_action :allow_iframe, only: :embed

  layout false
  layout 'application', :except => :embed
  layout 'embed', :only => :embed

  respond_to :html

  def index
    @datasets = Dataset.all
    @dataset = Dataset.new
  end

  def show
    @metadata = @dataset.parse.metadata
    @data = @dataset.parse.data
  end

  def embed
    @metadata = @dataset.parse.metadata
    @data = @dataset.parse.data
  end

  def create
    @dataset = Dataset.new(dataset_params)

    if @dataset.save
      respond_with(@dataset, location: -> { datasets_path })
    else
      @datasets = Dataset.all
      flash[:alert] = "Dataset could not be created."
      render :index
    end
  end

  def destroy
    @dataset.destroy
    respond_with(@dataset, location: -> { datasets_path })
  end

  def chart_csv
    respond_to do |format|
      format.csv {
        send_data(SeriesData.new(params).generate_csv,
                  filename: "result.csv",
                  type: "text/csv")
      }
    end
  end

  def activate
    Dataset.update_all(active: false)
    @dataset.update_attributes(active: true)
    redirect_to datasets_path
  end

  private

  def dataset_params
    params.require(:dataset).permit(:name, :csv_file, :help_file)
  end

  def set_dataset
    @dataset = if params[:id]
                 Dataset.find(params[:id])
               else
                 Dataset.find_by(active: true)
               end
  end

  def allow_iframe
    response.headers.except! 'X-Frame-Options'
  end
end
