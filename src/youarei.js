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
    // From RFC 3986
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
      console.log(this._query);
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

    _set: function(opt) {
      return this._toList( [], [], opt );
    },

    //split into constituent parts
    _toList: function(p,q, opt) {
      for(key in opt) {
        if( Object.prototype.toString.call( opt[key] ) === '[object Array]' ) {
          opt[key].forEach(function (val) {
            p.push(key);
            q.push(val);
          });
        } else if (opt[key] !== undefined && opt[key] !== null ) {
          p.push(key);
          q.push(opt[key]);
        }
      }
      return [p, q];
    },

    //simply add to end
    append: function(opt) {
      this._query = this._toList( this._query[0], this._query[1], opt );
      return this;
    },

    //find existing keys and update or append.
    merge: function(opt) {
      var ex = this._query;
      for(key in opt) {
        //find existing
        for(x_key in ex) {
          if(key === x_key) {
            if( Object.prototype.toString.call( opt[key] ) === '[object Array]' ) {
              ex[key] = opt[key];
            } else {
              ex[key] = opt[key];
            }
            //remove future ones too
            delete opt[key];
          }
        }
      }
      this.append(opt);
      return this;
    },

    clear: function () {
      this._query = [[], []];
      return this;
    },

    set: function() {
      var args = Array.prototype.slice.call(arguments);

      if(args.length === 1) {
        if (typeof args[0] === 'object') {
          //if object, replace
          this._query = this._set(args[0]);
        } else {
          //set as raw
          this._query = this._parse(args[0]);
        }
      } else if(args.length === 0) {
        this.clear();

      } else {
        //probably a list, set key, val
        var obj = {};
        obj[args[0]] = args[1];
        this._query = this._set(obj);
      }

      return this;
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
    var q = this.query.stringify();
    var f = this.fragment();
    return this.scheme() + '://' +  this.authority()
      + this.path() + (q ? '?' + q : '') +( f ? '#' + f : '');

  },
};
