describe 'new YouAreI()', ->
  Array.prototype.stupid = -> false
  ex_uri = "http://www.example.com"

  it "Should accept regular URI (#{ex_uri})", ->
    uri = new YouAreI ex_uri
    assert.instanceOf uri, YouAreI, "URI"

  it 'Should accept schemeless URI ( www.example.com )', ->
    uri = new YouAreI "www.example.com"
    assert.ok uri

  xit 'Should accept empty URI', ->
    uri = new YouAreI()
    assert.ok uri
    assert.equal uri.toString(), "www.example.com"

  xit 'Throw exception on malformed URIs', ->

  it 'Should be chainable', ->
    uri = new YouAreI(ex_uri).query_set({a: "b"})
    assert.instanceOf uri, YouAreI, "URI"

  describe 'methods', ->

    #removing this causes beforeEach not to be called?!
    uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1&gg#fragment")

    beforeEach ->
      uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1&gg#fragment")

    describe "URI parts for #{uri.toString()}", ->

      describe 'toString()', ->
        it 'should toString back to source representation', ->
          assert.equal uri.toString(), "http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment"

      describe 'scheme()', ->
        it 'should return scheme ( http )', ->
          assert.equal uri.scheme(), "http"

      describe 'user_info()', ->
        it 'should return userinfo ( user:pass )', ->
          assert.equal uri.user_info(), "user:pass"
          assert.equal uri.userInfo(), "user:pass"

      describe 'host()', ->
        it 'should return host ( www.example.com )', ->
          assert.equal uri.host(), "www.example.com"

      describe 'port()', ->
        it 'should return port ( 3000 )', ->
          assert.equal uri.port(), 3000

      describe 'path_to_string()', ->
        it 'should return path ( /a/b/c )', ->
          assert.equal uri.path_to_string(), "/a/b/c"
          assert.equal uri.pathToString(), "/a/b/c"

      describe 'fragment()', ->
        it 'should return fragment ( fragment )', ->
          assert.equal uri.fragment(), "fragment"

    describe 'query', ->
      describe 'query_to_string()', ->
        it 'should to_string back to source representation', ->
          assert.equal uri.query_to_string(), "d=1&e=1&d=1"
          assert.equal uri.queryToString(), "d=1&e=1&d=1"

      describe 'query_get()', ->
        it 'should return the query dictionary containing the first value of multis', ->
          assert.deepEqual uri.query_get(), { d: '1', e: '1' }, "query_get() - returns all"
          assert.deepEqual uri.query_get('d'), '1', "query_get(str) - returns matching str"

      describe 'query_get_all()', ->
        it 'should return query dictionary always using an array regardless, {d: [1,1], e: [1]}', ->
          assert.deepEqual uri.query_get_all(), { d: ['1','1'], e: ['1'] }, "query_get_all() - returns all"
          assert.deepEqual uri.query_get_all('d'), ['1', '1'], "query_get_all(str) - returns matching str"

      describe 'query_set()', ->
        it 'should merge the new value with the existing query', ->
          assert.equal uri.query_set("d", 10).query_to_string(), "d=10&e=1"

        it 'should replace the entire query with the new value', ->
          assert.equal uri.query_set({d: 9, e: 10}).query_to_string(), "d=9&e=10"

        it 'no parameters should reset the query to blank', ->
          assert.equal uri.query_set().query_to_string(), ""

      describe 'query_clear()', ->
        it 'should clear the query', ->
          assert.equal uri.query_clear().query_to_string(), ""

      describe 'query_push()', ->
        it 'should append the new value adding new if it doesn\'t exist', ->
          assert.equal uri.query_push({a: "b" }).query_to_string(), "d=1&e=1&d=1&a=b"

        it 'should append the new value to an existing key if it exists', ->
          assert.equal uri.query_push({ "a": ["c","d"] }).query_to_string(), "d=1&e=1&d=1&a=c&a=d"

      describe 'query_merge()', ->
        it 'should merge with existing values', ->
          assert.equal uri.query_merge({d: 9, e: 5, f: 6 }).query_to_string(), "d=9&e=5&f=6"

        it 'should remove key:val if val is set to null', ->
          assert.equal uri.query_merge({ d: null }).query_to_string(), "e=1"

        it 'should merge multiple values too, preserving order', ->
          assert.equal uri.query_merge({ d: [1,2,3] }).query_to_string(), "d=1&e=1&d=2&d=3"

  describe 'path', ->

    describe 'path_parts()', ->
      it 'should set path', ->
        uri = new YouAreI "/d/c/b?moo=1"
        uri.path_parts ['d','e','f']
        assert.equal uri.path_to_string(), "/d/e/f"

      it 'should return array of path parts', ->
        uri = new YouAreI "/d/c/b?moo=1"
        assert.deepEqual uri.path_parts(), ['d', 'c', 'b']

    describe 'path_to_dir()', ->
      it 'should return the path without script', ->
        uri = new YouAreI "/d/c/b?moo=1"
        assert.equal uri.path_to_dir(),  "/d/c/"

      it 'should return the path without script (with trailing slash)', ->
        uri = new YouAreI "/d/c/b/?moo=1"
        assert.equal uri.path_to_dir(),  "/d/c/b/"

    describe 'path_basename_set()', ->
      it 'should set the basename to value (i.e test.html) after trailing slash', ->
        uri = new YouAreI "/d/c/b/?moo=1"
        uri.path_basename_set("test.html")
        assert.equal uri.path_to_string(),  "/d/c/b/test.html"

      it 'should set the basename to value (i.e test.html)', ->
        uri = new YouAreI "/d/c/b"
        uri.path_basename_set("test.html")
        assert.equal uri.path_to_string(),  "/d/c/test.html"

    describe 'path_extension_set()', ->
      xit 'should set the extension on basename', ->
        uri = new YouAreI "/d/c/b"
        uri.path_extension_set("html")
        assert.equal uri.path_to_string(),  "/d/c/b.html"

      xit 'should throw error when not possible', ->
        uri = new YouAreI "/d/c/"
        #throw error?
        uri.path_extension_set("html")
        assert.equal uri.path_to_string(),  "/d/c/b.html"

  describe 'partial urls', ->

    it 'handles just path', ->
      uri = new YouAreI "/d/c/b?moo=1"
      assert.equal uri.toString(), "/d/c/b?moo=1"

  describe 'edge cases', ->

    it 'handles root path with only one slash', ->
      uri = new YouAreI "http://www.example.com/"
      assert.equal uri.toString(), "http://www.example.com/"

  describe 'clone()', ->
    it "should clone the url", ->
      uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")
      uri2 = uri.clone()
      uri.parse("https://x:y@www.example2.com:5000/test?x=y#fragment2")
      assert.equal uri2.toString(), "http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment"
      assert.equal uri.toString(), "https://x:y@www.example2.com:5000/test?x=y#fragment2"

