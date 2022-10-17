#!/bin/bash

VERSION="$1"

yarn version --new-version "$VERSION"
cd packages/shared && yarn version --new-version "$VERSION" && cd -
cd packages/server && yarn version --new-version "$VERSION" && cd -
cd packages/client && yarn version --new-version "$VERSION" && cd -

git commit -am "chore: bump version to $VERSION"
