artifact_name       := restricted-word-web

.PHONY: build
build: clean
	npm run build-scss
	npm run build-js
	npm run build

.PHONY: clean
clean:
	rm -rf dist/*


.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./app $(tmpdir)
	cp -r ./dist $(tmpdir)
	cp -r ./views $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cp ./start.sh $(tmpdir)
	cp ./routes.yaml $(tmpdir)
	cd $(tmpdir) && npm i --production
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: init
init:
	npm install
