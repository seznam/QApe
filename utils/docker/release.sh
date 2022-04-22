#!/bin/bash

set -e

if [ -z "$npm_package_version" ] ; then
    echo "No package version available, aborting docker image release.";
    exit 1;
fi

IMAGE_VERSION=qape/qape:$npm_package_version
IMAGE_LATEST=qape/qape:latest

echo Releasing $IMAGE_VERSION

docker build --platform amd64 --build-arg QAPE_VERSION=$npm_package_version -t $IMAGE_VERSION -t $IMAGE_LATEST .

echo Build finished!
echo Pushing to docker registry...

docker push $IMAGE_VERSION
echo Image $IMAGE_VERSION published!

docker push $IMAGE_LATEST
echo Image $IMAGE_LATEST published!
