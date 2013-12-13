describe 'new YouAreI()', ->
  ex_uri = "http://www.example.com"

  it 'Should accept plain URI', ->
    uri = new YouAreI ex_uri
    assert.instanceOf uri, YouAreI, "URI"

  it 'Should accept schemeless URI', ->
    uri = new YouAreI "www.example.com"
    assert.ok uri

  xit 'Should accept empty URI', ->
    uri = new YouAreI()
    assert.ok uri
    assert.equal uri.stringify(), "www.example.com"

  xit 'Throw exception on malformed URIs', ->

  it 'Should be chainable', ->
    uri = new YouAreI(ex_uri).query_set({a: "b"})
    assert.instanceOf uri, YouAreI, "URI"

  describe 'methods', ->

    #removing this causes beforeEach not to be called?!
    uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")

    beforeEach ->
      uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")

    describe 'URI parts', ->

      describe 'stringify()', ->
        assert.equal uri.stringify(), "http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment"

      describe 'scheme()', ->
        assert.equal uri.scheme(), "http"

      describe 'userinfo()', ->
        assert.equal uri.userinfo(), "user:pass"

      describe 'host()', ->
        assert.equal uri.host(), "www.example.com"

      describe 'port()', ->
        assert.equal uri.port(), 3000

      describe 'path()', ->
        assert.equal uri.path_stringify(), "/a/b/c"

      describe 'fragment()', ->
        assert.equal uri.fragment(), "fragment"

    describe 'query', ->
      describe 'stringify()', ->
        assert.equal uri.query_stringify(), "d=1&e=1&d=1"

      describe 'get(), get_all()', ->
        assert.deepEqual uri.query_get(), { d: '1', e: '1' }
        assert.deepEqual uri.query_get_all(), { d: ['1','1'], e: ['1'] }
        assert.deepEqual uri.query_get('d'), '1'
        assert.deepEqual uri.query_get_all('d'), ['1', '1']

      describe 'set()', ->
        it 'merged using pair', ->
          assert.equal uri.query_set("d", 10).query_stringify(), "d=10&e=1"

        it 'replaced using object', ->
          assert.equal uri.query_set({d: 9, e: 10}).query_stringify(), "d=9&e=10"

        it 'should clear using set()', ->
          assert.equal uri.query_set().query_stringify(), ""

      describe 'clear()', ->
        it 'should clear using clear()', ->
          assert.equal uri.query_clear().query_stringify(), ""

      describe 'push()', ->
        it 'should append', ->
          assert.equal uri.query_push({a: "b" }).query_stringify(), "d=1&e=1&d=1&a=b"

        it 'should append, multi', ->
          assert.equal uri.query_push({ "a": ["c","d"] }).query_stringify(), "d=1&e=1&d=1&a=c&a=d"

      describe 'merge()', ->
        it 'should merge', ->
          assert.equal uri.query_merge({d: 9, e: 5, f: 6 }).query_stringify(), "d=9&e=5&f=6"

        it 'should remove', ->
          assert.equal uri.query_merge({ d: null }).query_stringify(), "e=1"

        it 'set multi', ->
          assert.equal uri.query_merge({ d: [1,2,3] }).query_stringify(), "d=1&e=1&d=2&d=3"

  describe 'path', ->
    describe 'path_parts()', ->
      uri = new YouAreI "/d/c/b?moo=1"
      assert.deepEqual uri.path_parts(), ['d', 'c', 'b']

    describe 'path_to_dir() not rooted', ->
      uri = new YouAreI "/d/c/b?moo=1"
      assert.equal uri.path_to_dir(),  "/d/c/"

    describe 'path_to_dir()', ->
      uri = new YouAreI "/d/c/b/?moo=1"
      assert.equal uri.path_to_dir(),  "/d/c/b/"

    describe 'path_basename_set()', ->
      uri = new YouAreI "/d/c/b/?moo=1"
      uri.path_basename_set("test.html")
      assert.equal uri.path_stringify(),  "/d/c/b/test.html"


  describe 'partial urls', ->
    describe 'just path', ->
      uri = new YouAreI "/d/c/b?moo=1"

      describe 'stringify()', ->
        assert.equal uri.stringify(), "/d/c/b?moo=1"

  describe 'clone()', ->
    uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")
    uri2 = uri.clone()
    uri.parse("https://x:y@www.example2.com:5000/test?x=y#fragment2")
    it "doesn't bleed clone", ->
      assert.equal uri2.stringify(), "http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment"
      assert.equal uri.stringify(), "https://x:y@www.example2.com:5000/test?x=y#fragment2"

