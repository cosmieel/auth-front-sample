test:
	yarn test
snapshots:
	yarn snapshots
test-watch:
	yarn test:watch
lint:
	yarn lint
build:
	yarn build
dev:
	yarn dev
install:
	yarn
start:
	yarn
	yarn dev
reinstall:
	rm -rf node_modules
	rm -r yarn.lock
	yarn