SHELL=/bin/bash

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build project
	 rm -rf public && hugo --gc --minify

netlify: build ## Build and deploy to Netlify
	netlify deploy --prod

netlify-staging: build ## Build and deploy to Netlify Staging environment
	netlify deploy --alias=staging

start-hugo: ## start Hugo server
	hugo server -D

start-cms: ## start Decap CMS
	npx decap-server

start-all: ## start both Hugo server and Decap CMS
	@echo "Starting Hugo server and Decap CMS..."
	@$(MAKE) -j2 start-hugo start-cms	
