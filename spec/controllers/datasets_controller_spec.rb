require 'rails_helper'

RSpec.describe DatasetsController, type: :controller do
  describe "GET index" do
    let(:dataset) { create(:dataset) }

    it "assigns all datasets as @datasets" do
      get :index, {}
      expect(assigns(:datasets)).to eq([dataset])
    end
  end

  #describe "GET show" do
    #it "assigns the requested dataset as @dataset" do
      #dataset = Dataset.create! valid_attributes
      #get :show, {:id => dataset.to_param}
      #expect(assigns(:dataset)).to eq(dataset)
    #end
  #end

  describe "POST create" do
    let(:derivative_file) do
      fixture_file_upload('test.csv', 'text/csv')
    end

    describe "with valid params" do
      let(:valid_attributes) do
        {
          name: "Test Data Set",
          dataset_csv_file: derivative_file
        }
      end

      it "creates a new Dataset" do
        expect {
          post :create, {:dataset => valid_attributes}
        }.to change(Dataset, :count).by(1)
      end

      it "assigns a newly created dataset as @dataset" do
        post :create, {:dataset => valid_attributes}
        expect(assigns(:dataset)).to be_a(Dataset)
        expect(assigns(:dataset)).to be_persisted
      end

      it "redirects to the dataset index" do
        post :create, {:dataset => valid_attributes}
        expect(response).to redirect_to(datasets_path)
      end
    end

    describe "with invalid params" do
      let(:invalid_attributes) do
        {
          name: nil,
          dataset_csv_file: derivative_file
        }
      end

      it "assigns a newly created but unsaved dataset as @dataset" do
        post :create, {:dataset => invalid_attributes}
        expect(assigns(:dataset)).to be_a_new(Dataset)
      end

      it "re-renders the 'new' template" do
        post :create, {:dataset => invalid_attributes}
        expect(response).to render_template(:index)
      end
    end
  end

  describe "DELETE destroy" do
    let!(:dataset) { create(:dataset) }

    it "destroys the requested dataset" do
      expect {
        delete :destroy, {:id => dataset.to_param}
      }.to change(Dataset, :count).by(-1)
    end

    it "redirects to the datasets list" do
      delete :destroy, {:id => dataset.to_param}
      expect(response).to redirect_to(datasets_url)
    end
  end

end
