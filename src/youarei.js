var uri_re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
var auth_re = /^([^\@]+)\@/;
var port_re = /:(\d+)$/;
var pl_re = /\+/g;
var qp_re = /^([^=]+)(?:=(.*))?$/;

//actually doesn't support URIs yet, only URLs
function YouAreI(uri){
  return this.parse(uri);
}

YouAreI.prototype = {

  parse: function(uri) {
    // Official regex from RFC 3986
    var f = uri.match(uri_re);
    return this.scheme(f[2]||"").authority(f[4]||"").path(f[5]||"")
               .query(f[7]||"").fragment(f[9]||"");
  },

  fragment: function(fragment) {
    if(fragment !== undefined) {
      this._fragment = fragment;
      return this;
    } else {
      return this._fragment;
    }
  },

  //returns the raw query string
  query: function(query) {
    //if string, set as raw
    if(query !== undefined) {
      this._query = query;
      return this;

    //if list, set key values
    
    //if object, replace
    } else {
      return this._query;
    }
  },

  //returns parsed query string as object
  params: function() {

    var params = [];
    var pairs = this._query.split(/&|;/);

    pairs.forEach(function(pair) {
      var n_pair, name, value;
      if(n_pair = pair.match(qp_re)) {
        var tmp = {};
        name = decodeURIComponent(n_pair[1].replace(pl_re, " "));
        value = decodeURIComponent(n_pair[2].replace(pl_re, " "));
        tmp[name] = value;
        params.push( tmp );
      } else {
        return;
      }
    });
    return params;
  },

  //returns parsed query string as object, value *always* array
  params_array: function() {

  },

  userinfo: function(userinfo) {
    if(userinfo !== undefined) {
      this._userinfo = userinfo;
      return this;
    } else {
      return this._userinfo;
    }
  },

  path: function(path) {
    if(path !== undefined) {
      this._path = path;
      return this;
    } else {
      return this._path;
    }
  },

  protocol: function () {
    return this.scheme.toLowerCase();
  },

  port: function (port) {
    if(port !== undefined) {
      this._port = port;
      return this;
    } else {
      return this._port;
    }
  },

  host: function (host) {
    if(host !== undefined) {
      this._host = host;
      return this;
    } else {
      return this._host;
    }
  },

  authority: function(authority) {
    if(authority !== undefined) {
      this._authority = authority;
      var auth, port;
      if(auth = authority.match(auth_re)) {
        authority = authority.replace(auth_re, '');
        this.userinfo(auth[1]);
      }
      //Port
      if(port = authority.match(port_re)) {
        authority = authority.replace(port_re, "");
        this.port(port[1]);
      }
      this.host(authority);
      return this;
    } else {
      //TODO: build from constituent parts.
      return this._authority;
    }
  },

  scheme: function(scheme) {
    if(scheme !== undefined) {
      this._scheme = scheme;
      return this;
    } else {
      return this._scheme;
    }
  },

  stringify: function() {

  },
};
