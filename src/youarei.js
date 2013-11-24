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
    var f = uri ? uri.match(uri_re) : [];
    _this =  this.scheme(f[2]||"").authority(f[4]||"").path(f[5]||"")
               .fragment(f[9]||"");
    _this.query.set(f[7]||"");
    return _this;
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
  query: {

    stringify: function() {
      //regenerate from parsed
      var pairs = [],
          n = this._query[0],
          v = this._query[1];

      for(var i=0; i < n.length; i++) {
        pairs.push(encodeURIComponent(n[i]) + '=' + encodeURIComponent(v[i]));
      }

      return pairs.join('&');
    },

    get: function() {

      var dict = {};
      var opts = this._query;
      for(var i=0; i < opts[0].length; i++) {
        var k = opts[0][i],
            v = opts[1][i];
        if(dict[k]) {
          if(Array.isArray(dict[k])) {
            dict[k].push(v);
          } else {
            dict[k] = [dict[k],v];
          }
        } else {
          dict[k] = v;
        }
      }
      return dict;
    },

    get_all: function() {
      var dict = {};
      var opts = this._query;
      for(var i=0; i < opts[0].length; i++) {
        var k = opts[0][i],
            v = opts[1][i];
        if(dict[k]) {
          dict[k].push(v);
        } else {
          dict[k] = [v];
        }
      }
      return dict;
    },

    _parse: function(raw) {

      var keys = [], values = [];
      var pairs = raw.split(/&|;/);

      pairs.forEach(function(pair) {
        var n_pair, name, value;
        if(n_pair = pair.match(qp_re)) {
          var tmp = {};
          name = decodeURIComponent(n_pair[1].replace(pl_re, " "));
          value = decodeURIComponent(n_pair[2].replace(pl_re, " "));
          keys.push( name );
          values.push( value );
        } else {
          return;
        }
      });

      return [keys, values];
    },

    _set: function(args) {

    },

    append: function(args) {

    },

    merge: function(args) {

    },

    set: function() {
      var args = Array.prototype.slice.call(arguments);

      if(args.length === 1) {
        if (typeof args[0] === 'object') {
          //if object, replace
          this._set(args[0]);
        } else {
          //set as raw
          this._query = this._parse(args[0]);
        }
      } else if(args.length === 0) {
        //TODO clear
        this._query = [];

      } else {
        //probably a list, set key, val
        var obj = {};
        obj[args[0]] = args[1];
        this._set(obj);
      }


      return args.length ? this : this._query;
    }
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
