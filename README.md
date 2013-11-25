youarei.js
==========

A Javascript (UMD, node) module with sane query parameter handling. About 1k gzipped.

Installing
==========

`npm install youarei`

`bower install youarei`

API
===

The usual suspects

```
var url = new YouAreI("https://user:pass@www.example.com/a/b?z=1&y=2&x=3&z=2#boop");

url.scheme() === "https"
uri.userinfo() === "user:pass"
url.host() === 'www.example.com'
url.port() === 443
url.path() === '/a/b'
url.fragment() === "boop"
url.stringify() === "https://user:pass@www.example.com/a/b?z=1&y=2&x=3&z=2#boop"
```

Query Handling
==============

query_get() will only ever return the *first* provided if multiple same named parameters are set

```
url.query_get() === { z: 1, y: 2, x: 3  }
url.query_get('z') === 1
```

query_get_all() will *always* return a list as the value for a key, regardless of whether the parameter is provided multiple times

```
url.query_get_all() === { z: [1,2], y: [2], x: [3]  }
url.query_get_all('z') === ['1', '2']
```

query_set() will DWIM

replace entire query string:

`url.query_set({'z', 1})`

merge with existing query string (replace if exists, otherwise append)

`url.query_set('z', 1)`


Helpers to cut down on boilerplate code

Always append to existing

`url.query_push({z: [3, 4]})`

Always merge with existing

`url.query_merge({z: [3, 4]})`

Clear querystring:

`url.query_clear()`

Set it as a raw value:

`url.query_set("a=b&c=d")`

Output as safe string:

`url.query_stringify()`

See tests/ for more details
