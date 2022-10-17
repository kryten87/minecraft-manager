#!/bin/bash

IMAGE_NAME=registry.gitlab.com/dave137/minecraft-manager/server

# get the version from package.json
VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('./packages/server/package.json').toString()).version);")

# build the docker image
echo -e "\nBuilding Docker image version $VERSION"

docker build \
  -f docker/Dockerfile.server \
  -t "$IMAGE_NAME:latest" \
  .

docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:$VERSION"

echo -e "\nPushing image $IMAGE_NAME:$VERSION"
# docker push "$IMAGE_NAME:$VERSION"
# docker push "$IMAGE_NAME:latest"
