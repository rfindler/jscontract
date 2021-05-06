#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"

for REL_PATH in "$PWD"/DefinitelyTyped/types/*; do
  BASENAME="$(basename "$REL_PATH")"
  printf "Testing %s...\n" "$BASENAME";
  timeout 600 "$DIR"/bin/ct "$BASENAME" &> results/"$BASENAME"
  rm -rf "$DIR"/sandbox
done
