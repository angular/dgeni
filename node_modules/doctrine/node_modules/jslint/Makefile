install:
	npm i .

lint:
	find bin lib -name "*.js" -print0 | xargs -0 node ./bin/jslint.js --stupid

.PHONY: install lint
