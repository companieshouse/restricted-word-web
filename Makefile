artifact_name       := restricted-word-web

.PHONY: build
build: clean init
	npm run build-scss
	npm run build-js
	npm run build

.PHONY: clean
clean:
	rm -rf dist/*

.PHONY: test
test:
	npm run test:coverage

.PHONY: test-unit
test-unit:
	npm run test

.PHONY: sonar
sonar: test
	npm run analyse-code

.PHONY: lint
lint:
	npm run lint

.PHONY: security-check
security-check:
	npm audit --audit-level=high

.PHONY: package
package: init build 
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist $(tmpdir)
	cp -r ./views $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cd $(tmpdir) && npm i --production
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: init
init:
	npm install
