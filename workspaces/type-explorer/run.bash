#!/bin/bash

if [ ! -d "$PWD"/DefinitelyTyped ]; then
  git clone https://github.com/DefinitelyTyped/DefinitelyTyped "$PWD"/DefinitelyTyped
fi

mkdir -p results
for REL_PATH in "$PWD"/DefinitelyTyped/types/*; do
  BASENAME="$(basename "$REL_PATH")"
  printf "Testing %s...\n" "$BASENAME";
  timeout 600 "$PWD"/bin/ct "$BASENAME" &> results/"$BASENAME"
done
