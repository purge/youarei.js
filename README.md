youarei.js
==========

A Javascript (UMD, node) module with sane query parameter handling. Under 1k gzipped.

API
===

```
var url = new YouAreI("https://user:pass@www.example.com/a/b?z=1&y=2&x=3&z=2#boop");

url.scheme() === "https"
uri.userinfo() === "user:pass"
url.host() === 'www.example.com'
url.port() === 443
url.path() === '/a/b'
url.fragment() === "boop"

//get first if multiple provided

url.query_get() === { z: 1, y: 2, x: 3  }
url.query_get('z') === 1

url.query_get_all() === { z: [1,2], y: [2], x: [3]  }
url.query_get_all('z') === ['1', '2']

//replace existing
url.query_set({'z', 1})

//merge existing
url.query_set('z', 1)

url.query_clear()

//helper to always append
url.query_push({z: [3, 4]})

//helper to always merge
url.query_merge({z: [3, 4]})

```

See tests/ for more details
