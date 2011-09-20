NODE = node
TEST = vows
TESTS ?= test/*-test.js test/**/*-test.js

test:
	@NODE_ENV=test NODE_PATH=lib $(TEST) $(TEST_FLAGS) $(TESTS)

docs: docs/api.html

docs/api.html: lib/junction-commands/*.js
	dox \
		--title Junction/Commands \
		--desc "Ad-Hoc Commands development framework for Junction" \
		$(shell find lib/junction-commands/* -type f) > $@

docclean:
	rm -f docs/*.{1,html}

.PHONY: test docs docclean
