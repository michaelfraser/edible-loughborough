SHELL=/bin/bash
VERSION := $(shell git rev-parse --short HEAD)

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

clean: ## Delete build artifacts
	rm -rf public resources/_gen

build-staging: clean
	$(MAKE) build-hugo SKIP_CHECK=false ENV=staging

build-production: clean
	$(MAKE) build-hugo SKIP_CHECK=false ENV=production

build-hugo:
	HUGO_PARAMS_siteversion=$(VERSION) \
	HUGO_PARAMS_ignoresmallcsscheck=$(SKIP_CHECK) \
	hugo --gc --minify --environment $(ENV)

netlify-staging: build-staging ## Build and deploy to Netlify Staging environment
	npx netlify-cli deploy --alias=staging --dir=public --message="Staging deploy"

netlify: build-production ## Build and deploy to Netlify
	npx netlify-cli deploy --prod --dir=public --message="Production deploy"

start-hugo: ## Start Hugo server
	HUGO_PARAMS_siteversion=$(VERSION) hugo server --buildDrafts --disableLiveReload

start-cms: ## Start Decap CMS
	npx decap-server

start-all: ## Start both Hugo server and Decap CMS
	@echo "Starting Hugo server and Decap CMS..."
	@$(MAKE) -j2 start-hugo start-cms	

update-headers: ## A script to update the _headers file
	@go run bin/update_headers.go

lighthouse: ## A script to run google lighthouse on multiple web pages
	@go run bin/lighthouse.go
