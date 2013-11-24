describe 'new YouAreI()', ->
  ex_uri = "http://www.example.com"

  it 'Should accept plain URI', ->
    uri = new YouAreI ex_uri
    assert.instanceOf uri, YouAreI, "URI"

  it 'Should accept schemeless URI', ->
    uri = new YouAreI "www.example.com"
    assert.ok uri

  it 'Should accept empty URI', ->
    uri = new YouAreI()
    assert.ok uri

  xit 'Throw exception on malformed URIs', ->

  xit 'Should be chainable', ->
    #TODO: decide whether query should return YouAreI object
    uri = new YouAreI(ex_uri).query.set({a: "b"})
    assert.instanceOf uri, YouAreI, "URI"

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

    describe 'query', ->
      describe 'stringify()', ->
        assert.equal uri.query.stringify(), "d=1&e=1&d=1"

      describe 'get(), get_all()', ->
        assert.deepEqual uri.query.get(), { d: ['1','1'], e: '1' }
        assert.deepEqual uri.query.get_all(), { d: ['1','1'], e: ['1'] }

      describe 'set()', ->
        it 'replaced using pair', ->
          assert.equal uri.query.set("d", 10).stringify(), "d=10"
        it 'replaced using object', ->
          assert.equal uri.query.set({d: 9, e: 10}).stringify(), "d=9&e=10"

        it 'should remove', ->
          assert.equal uri.query.set({ d: null }).stringify(), "e=10"

        it 'should clear using set()', ->
          assert.equal uri.query.set().stringify(), ""

      describe 'clear()', ->
        it 'should clear using clear()', ->
          assert.equal uri.query.clear().stringify(), ""

      describe 'merge()', ->
        it 'should merge', ->
          assert.equal uri.query.merge({d: 9, e: 5 }).stringify(), "d=1&e=1&d=1&e=5&d=9"

      describe 'append()', ->
        it 'should append', ->
          assert.equal uri.query.append({a: b }).stringify(), "d=1&e=1&d=1&a=b"

        it 'should append, multi', ->
          assert.equal uri.query.append({ "a": ["c","d"] }).stringify(), "d=1&e=1&d=1&a=b"


