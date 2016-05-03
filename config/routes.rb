Rails.application.routes.draw do
  resources :datasets, only: [:index, :show, :create, :destroy] do
    post :chart_csv, on: :collection
    get :activate, on: :member
    get :embed, on: :member
  end

  root 'datasets#show'
end
