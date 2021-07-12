# ACTION ITEMS

- Make a pull request to `trim` with an `interface` type that reflects `String`

# NOTES

Pull requests accepted so far:

- ## `human-date`
- `hex2dec`
- `hex-rgba`
- `natural-compare`
- `http-codes`

Open pull requests:

- `money-math`
- `is-valid-path`
- `parse-unit`
- `integer`
- `repeat-string`
- `pad-left`
- `url-params`
- ## `point-in-polygon`
- `checksum`
- `file-exists`
- `ms`
- `buffer-equal`
- `trim`

- Found more packages to go through because of _network errors_ last time
  - `npm` would flake out due to cache bugs; getting rid of the cache each time solved the problems
- About 70 more packages to investigate due to new problems found (going through them)
- More pull requests to submit...

Contract system questions:

- Does TypeScript let us capture the semantics of the `Integer` package?
- What should we do about pseudo-private properties that aren't reflected in the types? (E.g., `_almost_private` keys on objects) (`properties-reader` and `socketty`)
- `7zip-min` types - `and` contract questions
- `to-absolute-glob` types
- `rename` types
