#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"

if [ ! -d "$DIR/DefinitelyTyped" ]; then
  git clone https://github.com/DefinitelyTyped/DefinitelyTyped "$DIR/DefinitelyTyped"
fi

mkdir -p results

for REL_PATH in "$PWD"/DefinitelyTyped/types/*; do
  BASENAME="$(basename "$REL_PATH")"
  printf "Testing %s...\n" "$BASENAME";
  timeout 150 "$DIR"/bin/ct "$BASENAME" &> results/"$BASENAME"
  rm -rf "$DIR"/sandbox
done
