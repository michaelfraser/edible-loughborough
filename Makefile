SHELL=/bin/bash

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

clean: ## Delete build artifacts
	rm -rf public resources/_gen

build-staging: clean ## Build project
	 hugo --gc --minify --environment staging

build-production: clean ## Build project
	 hugo --gc --minify --environment production

netlify-staging: build-staging ## Build and deploy to Netlify Staging environment
	npx netlify-cli deploy --alias=staging --dir=public --message="Staging deploy"

netlify: build-production ## Build and deploy to Netlify
	npx netlify-cli deploy --prod --dir=public --message="Production deploy"

start-hugo: ## Start Hugo server
	hugo server -D

start-cms: ## Start Decap CMS
	npx decap-server

start-all: clean ## Start both Hugo server and Decap CMS
	@echo "Starting Hugo server and Decap CMS..."
	@$(MAKE) -j2 start-hugo start-cms	
