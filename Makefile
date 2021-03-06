install: install-deps

install-deps:
	npm ci

test:
	npm test

dev:
	npm run dev

start:
	npm start

editorconfig:
	npm run test::editorconfig

lint:
	npm run test::eslint

test-coverage:
	npm run test::jest -- --coverage --coverageProvider=v8

.PHONY: test
