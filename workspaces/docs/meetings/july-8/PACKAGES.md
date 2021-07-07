Pull requests accepted so far:

- `hex2dec`
- `hex-rgba`
- `natural-compare`
- `http-codes` (particularly hard to spot)

Open pull requests:

- `checksum`
- `file-exists`
- `ms`
- `buffer-equal`

--

- Found more packages to go through because of _network errors_ last time
  - `npm` would flake out due to cache bugs; getting rid of the cache each time solved the problems
- About 48 more packages to investigate due to new problems found (going through them)
- More pull requests to submit...

Contract system questions:

- What should we do with JavaScript that explicitly expects `String` objects? (`trim` and `fined`)
- What should we do in the case of `doge-seed` where the _test_ uses the function incorrectly? Interesting edge case...
- `7zip-min` types
- `to-absolute-glob` types
