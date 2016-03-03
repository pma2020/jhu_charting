Rails.application.routes.draw do
  resources :datasets, only: [:index, :show, :create, :destroy] do
    post :chart_csv, on: :collection
  end

  root 'datasets#index'
end
