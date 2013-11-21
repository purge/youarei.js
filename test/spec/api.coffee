describe 'new YouAreI()', ->

  it 'Should accept plain URI', ->
    uri = new YouAreI("http://www.example.com")
    assert.ok uri

  it 'Should accept schemeless URI', ->
    uri = new YouAreI("www.example.com")
    assert.ok uri

  it 'Should accept empty URI', ->
    uri = new YouAreI()
    assert.ok uri

  it 'Throw exception on malformed URIs', ->

  it 'Should be chainable', ->
    uri = new YouAreI(ex_uri).params({a: "b"})

  describe 'methods', ->
    uri = null

    beforeEach ->
      uri = new YouAreI("http://user@host:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1")

    describe 'scheme()', ->
      assert.equal uri.scheme(), "https"

    describe 'userinfo()', ->
      assert.equal uri.userinfo(), "user@host:pass"

    describe 'host()', ->
      assert.equal uri.host(), "www.example.com"

    describe 'port()', ->
      assert.equal uri.port(), 3000

    describe 'path()', ->
      assert.equal uri.path(), "/a/b/c"

    #describe 'fragment()', ->

    describe 'query()', ->
      #example http://test.com/?a=1
      assert.deepEqual uri.query(), { d: [1,1], e: 1 }
      assert.deepEqual uri.query_array(), { d: [1,1], e: [1] }

      it 'should replace', ->
        #example http://test.com/?a=b
        uri.query({a: "b"})

      it 'should merge', ->
        #example http://test.com/?a=b&b=b&c=b
        uri.query_merge({b: "b", c: "b" })

      it 'should append', ->
        #example http://test.com/?a=b&a=b
        uri.query_append({ "a": "b" })

      it 'should append, multi', ->
        #example http://test.com/?a=b&a=b&a=c
        uri.query_append({ "a": ["b","c"] })


