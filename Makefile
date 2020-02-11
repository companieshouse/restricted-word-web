.PHONY: build
build: clean
	npm run build-scss
	npm run build-js

.PHONY: clean
clean:
	rm -rf dist/*

.PHONY: init
init:
	npm install
