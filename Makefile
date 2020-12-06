install: install-deps

install-deps:
	npm ci

test:
	npm test

dev:
	npm run dev

start:
	npm start

.PHONY: test
