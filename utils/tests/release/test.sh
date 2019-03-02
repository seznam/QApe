#!/bin/bash

TARGET_WEB_URL="http://localhost:3000/"
NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL="localhost:4873"
NPM_LOCAL_REGISTRY_URL="http://${NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL}/"
NPM_ORIGINAL_REGISTRY=`npm config get registry`

PACKAGE_VERSION=`cat package.json | grep \"version\" | head -1 | cut -d':' -f2 | cut -d'"' -f2`-next
PACKAGE_NAME=`cat package.json | grep \"name\" | head -1 | cut -d':' -f2 | cut -d'"' -f2`

# Setup local registry
node_modules/.bin/verdaccio -l "$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL" -c utils/tests/release/verdaccio_config.yml >/dev/null &
NPM_LOCAL_REGISTRY_PID=$!

npm config set "//$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL/:_authToken" "0"

# Release QApe
sed -i "s/\"version\":\s\".*\"/\"version\": \"$PACKAGE_VERSION\"/" package.json
sed -i "s#https://registry.npmjs.org/#${NPM_LOCAL_REGISTRY_URL}#" package.json
npm run build
npm publish

# Install QApe prerelease and other test dependencies
cd utils/tests/release
sed -i "s/\"$PACKAGE_NAME\":\s\".*\"/\"$PACKAGE_NAME\": \"$PACKAGE_VERSION\"/" package.json
npm install --registry="$NPM_LOCAL_REGISTRY_URL"

# Setup server with tested website
node server.js &
SERVER_PID=$!

sleep 1

# Run tests
STATUS=0

echo "Test1: QApe can pass the run when there are no error at the page."
node_modules/.bin/qape -u "$TARGET_WEB_URL/noerror.html"
[ "$?" = "0" ] && echo "pass" || (echo "fail" && STATUS=1)

echo "Test2: QApe can find an error and minify the scenario."
node_modules/.bin/qape -u "$TARGET_WEB_URL/error.html"
[ "$?" = "1" ] && ls report/*-minified.json && echo "pass" || (echo "fail" && STATUS=1)

echo "Test3: QApe can replay the failing scenario."
mv report scenarios
node_modules/.bin/qape -u "$TARGET_WEB_URL/error.html" --random-scenarios-disabled scenarios/*-minified.json
[ "$?" = "1" ] && ls report/*-minified.json && echo "pass" || (echo "fail" && STATUS=1)

# Cleanup
kill $NPM_LOCAL_REGISTRY_PID || "Could not kill local registry"
kill $SERVER_PID || "Could not kill server"

# Send proper exit code
exit $STATUS
