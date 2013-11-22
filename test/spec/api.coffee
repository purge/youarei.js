describe 'new YouAreI()', ->
  ex_uri = "http://www.example.com"

  it 'Should accept plain URI', ->
    uri = new YouAreI("http://www.example.com")
    console.log(uri.scheme())
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
    uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")

    beforeEach ->
      uri = new YouAreI("http://user:pass@www.example.com:3000/a/b/c?d=1&e=1&d=1#fragment")

    describe 'scheme()', ->
      assert.equal uri.scheme(), "http"

    describe 'userinfo()', ->
      assert.equal uri.userinfo(), "user:pass"

    describe 'host()', ->
      assert.equal uri.host(), "www.example.com"

    describe 'port()', ->
      assert.equal uri.port(), 3000

    describe 'path()', ->
      assert.equal uri.path(), "/a/b/c"

    describe 'fragment()', ->
      assert.equal uri.fragment(), "fragment"

    describe 'query()', ->
      assert.equal uri.query().stringify(), "d=1&e=1&d=1"

    describe 'update query()', ->
      #example http://test.com/?a=1
      assert.deepEqual uri.query().params(), { d: ['1','1'], e: '1' }
      assert.deepEqual uri.query().params_array(), { d: ['1','1'], e: ['1'] }

      it 'should replace', ->
        #example http://test.com/?e=1&d=9
        #shortcut to .replace()
        assert.equal uri.query({d: 9}), "", "takes dict"
        assert.equal uri.query("d", 9), "", "accept as simple pair"

      it 'should merge', ->
        #example http://test.com/?d=1&e=1&d=1&e=5&d=9
        uri.query().merge({d: 9, e: 5 })

      it 'should append', ->
        #example http://test.com/?d=1&e=1&d=1&a=b
        uri.query().append({ a: "b" })

      it 'should append, multi', ->
        #example http://test.com/?d=1&e=1&d=1&a=b&a=b&a=c
        uri.query().append({ "a": ["b","c"] })

      it 'should remove', ->
        #example http://test.com/?a=b&a=b&a=c
        uri.query({ d: null })

