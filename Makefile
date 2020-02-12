.PHONY: build
build: clean
	npm run build-scss
	npm run build-js
	npm run build

.PHONY: clean
clean:
	rm -rf dist/*

.PHONY: init
init:
	npm install
