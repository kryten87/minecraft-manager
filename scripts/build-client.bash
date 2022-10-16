#!/bin/bash

IMAGE_NAME=registry.gitlab.com/minecraft-manager/client

cd packages/client

# get the version from package.json
VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('./package.json').toString()).version);")

echo -e "\nBuilding client bundle version $VERSION"
# build the application
rm -rf build
yarn build


# build the docker image
echo -e "\nBuilding Docker image version $VERSION"

cd -

docker build \
  -f ./docker/Dockerfile.client \
  -t "$IMAGE_NAME:latest" \
  .

docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:$VERSION"

echo -e "\nPushing image $IMAGE_NAME:$VERSION"
# docker push "$IMAGE_NAME:$VERSION"
# docker push "$IMAGE_NAME:latest"
