#!/bin/bash

TARGET_WEB_URL="http://localhost:3000/"
NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL="localhost:4873"
NPM_LOCAL_REGISTRY_URL="http://${NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL}/"
NPM_ORIGINAL_REGISTRY=`npm config get registry`

PACKAGE_VERSION="next"
PACKAGE_NAME="qape"

# Setup local registry
node_modules/.bin/verdaccio -l "$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL" -c utils/tests/release/verdaccio_config.yml >/dev/null &
NPM_LOCAL_REGISTRY_PID=$!

npm config set "//$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL/:_authToken" "0"
npm config set registry "$NPM_LOCAL_REGISTRY_URL"

# Release QApe
sed -i "s/\"version\":\s\".*\"/\"version\": \"$PACKAGE_VERSION\"/" package.json
npm run build
npm publish

# Install QApe prerelease and other test dependencies
cd utils/tests/release
npm install

# Setup server with tested website
node server.js &
IMA_SKELETON_SERVER_PID=$!

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
node_modules/.bin/qape report/*-minified.json
[ "$?" = "1" ] && echo "pass" || (echo "fail" && STATUS=1)

# Cleanup
npm config set registry "$NPM_ORIGINAL_REGISTRY"
kill $NPM_LOCAL_REGISTRY_PID
kill $IMA_SKELETON_SERVER_PID

# Send proper exit code
exit $STATUS
