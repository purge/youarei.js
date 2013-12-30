youarei.js
==========

A Javascript (UMD, node) module with sane query parameter handling. About 1k gzipped.

Installing
==========

`npm install youarei`

`bower install youarei`

API (generated from tests)
===

Note: All methods are aliased to their camelCase alternative.

```

Start:
  new YouAreI()
    ✓ Should accept regular URI (http://www.example.com)
    ✓ Should accept schemeless URI ( www.example.com )
    ✗ Should accept empty URI (skipped)
    ✗ Throw exception on malformed URIs (skipped)
    ✓ Should be chainable
    methods
      URI parts for http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment
        toString()
          ✓ should toString back to source representation
        scheme()
          ✓ should return scheme ( http )
        user_info()
          ✓ should return userinfo ( user:pass )
        host()
          ✓ should return host ( www.example.com )
        port()
          ✓ should return port ( 3000 )
        path_to_string()
          ✓ should return path ( /a/b/c )
        fragment()
          ✓ should return fragment ( fragment )
      query
        query_to_string()
          ✓ should to_string back to source representation
        query_get()
          ✓ should return the query dictionary containing the first value of multis
        query_get_all()
          ✓ should return query dictionary always using an array regardless, {d: [1,1], e: [1]}
        query_set()
          ✓ should merge the new value with the existing query
          ✓ should replace the entire query with the new value
          ✓ no parameters should reset the query to blank
        query_clear()
          ✓ should clear the query
        query_push()
          ✓ should append the new value adding new if it doesn't exist
          ✓ should append the new value to an existing key if it exists
        query_merge()
          ✓ should merge with existing values
          ✓ should remove key:val if val is set to null
          ✓ should merge multiple values too, preserving order
    path
      path_parts()
        ✓ should set path
        ✓ should return array of path parts
      path_to_dir()
        ✓ should return the path without script
        ✓ should return the path without script (with trailing slash)
      path_basename_set()
        ✓ should set the basename to value (i.e test.html) after trailing slash
        ✓ should set the basename to value (i.e test.html)
      path_extension_set()
        ✗ should set the extension on basename (skipped)
        ✗ should throw error when not possible (skipped)
    partial urls
      ✓ handles just path
    clone()
      ✓ should clone the url

Finished in 0.005 secs

SUMMARY:
✓ 30 tests completed
- 4 tests skipped
```
