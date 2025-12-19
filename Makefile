SHELL=/bin/bash

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build project
	 rm -rf public && hugo

netlify: ## Build and deploy to Netlify
	rm -rf public && netlify deploy --prod

netlify-staging: ## Build and deploy to Netlify Staging environment
	rm -rf public && netlify deploy --alias=staging

start: ## start
	hugo server -D

start-cms: ## start Decap CMS
	MODE=git npx decap-server
