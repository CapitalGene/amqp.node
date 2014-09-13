RABBITMQ_SRC_VERSION=rabbitmq_v3_3_5
JSON=amqp-rabbitmq-0.9.1.json
RABBITMQ_CODEGEN=https://raw.githubusercontent.com/rabbitmq/rabbitmq-codegen
AMQP_JSON=$(RABBITMQ_CODEGEN)/$(RABBITMQ_SRC_VERSION)/$(JSON)

REPORTER=spec
MOCHA=./node_modules/.bin/mocha
_MOCHA=./node_modules/.bin/_mocha
UGLIFY=./node_modules/.bin/uglifyjs
ISTANBUL=./node_modules/.bin/istanbul

.PHONY: test test-all-nodejs all clean coverage

clean:
	rm lib/defs.js bin/amqp-rabbitmq-0.9.1.json
	rm -rf ./coverage

test:
	@NODE_ENV=testing \
	BLUEBIRD_DEBUG=1 \
	$(MOCHA) --check-leaks -u tdd -t 10000 test/ \
		--reporter $(REPORTER)

test-all-nodejs: lib/defs.js
	for v in '0.8' '0.9' '0.10' '0.11'; \
		do nave use $$v $(MOCHA) -u tdd -R progress test; \
		done

coverage: $(ISTANBUL) lib/defs.js
	$(ISTANBUL) cover $(_MOCHA) -- -u tdd -R progress test/
	$(ISTANBUL) report
	@echo "HTML report at file://$$(pwd)/coverage/lcov-report/index.html"

bin/amqp-rabbitmq-0.9.1.json:
	curl -L $(AMQP_JSON) > $@

$(ISTANBUL):
	npm install

$(UGLIFY):
	npm install
