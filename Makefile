SHELL=/bin/bash

-include .env
export

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build project
	 rm -rf public && hugo build

netlify: ## Build and deploy to Netlify
	rm -rf public && netlify deploy --prod
