Rails.application.routes.draw do
  resources :datasets, only: [:index, :show, :create, :destroy]

  root 'datasets#index'
end
