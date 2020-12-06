install: install-deps

install-deps:
	npm ci

test:
	npm test

dev:
	npm run dev

start:
	npm start

make editorconfig:
	npm run test::editorconfig

make lint:
	npm run test::eslint

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY: test
