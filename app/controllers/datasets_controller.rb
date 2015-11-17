class DatasetsController < ApplicationController
  before_action :set_dataset, only: [:show, :destroy]

  respond_to :html

  def index
    @datasets = Dataset.all
    @dataset = Dataset.new
  end

  def show
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

  private

  def dataset_params
    params.require(:dataset).permit(:name, :csv_file, :help_file)
  end

  def set_dataset
    @dataset = Dataset.find(params[:id])
  end
end
