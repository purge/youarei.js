const uri_re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/
const auth_re = /^([^\@]+)\@/
const port_re = /:(\d+)$/
const qp_re = /^([^=]+)(?:=(.*))?$/

interface ParsedURL {
  scheme: string
  host: string
  port: string | null
  path: string
  search: string
  auth: string | null
  fragment: string
}

export const parse = (uri: string): ParsedURL => {
  // From RFC 3986
  var urlParts = uri ? uri.match(uri_re) : []
  if (!urlParts) {
    throw new Error("Invalid URI")
  }

  let authority = urlParts[4] || ""
  let auth = null
  let port = null
  const authMatch = authority.match(auth_re)
  if (authMatch) {
    auth = authMatch[1]
    authority = authority.replace(auth_re, "")
  }
  const portMatch = authority.match(port_re)
  if (portMatch) {
    port = portMatch[1]
    authority = authority.replace(port_re, "")
  }

  return {
    scheme: urlParts[2] || "",
    host: authority,
    auth,
    port,
    path: urlParts[5] || "",
    search: urlParts[7] || "",
    fragment: urlParts[9] || "",
  }
}

export const pathParse = (rawPath: string): [string[], boolean[]] => {
  const path = decodeURIComponent(rawPath)
  const pathParts = path.split("/")
  const slashes = [path[0] === "/", path[path.length - 1] === "/"]
  if (slashes[0]) {
    pathParts.shift()
  }
  if (slashes[1]) {
    pathParts.pop()
  }
  return [pathParts, slashes]
}

const _pathToString = (path: string[], slashes: boolean[]) => {
  let stringPath = path.join("/")
  if (slashes[0]) stringPath = "/" + stringPath
  if (slashes[1]) stringPath = path + "/"
  return stringPath
}

export const pathDir = (rawPath: string): string => {
  const [path, slashes] = pathParse(rawPath)
  if (!slashes[1]) {
    path.pop()
    //add a trailing slash.
    path.push("")
  }

  return _pathToString(path, slashes)
}

export const pathBasenameSet = (rawPath: string, baseName: string) => {
  const [path, slashes] = pathParse(rawPath)
  if (slashes[1]) {
    path.push(baseName)
  } else {
    path[path.length - 1] = baseName
  }
  return _pathToString(path, [slashes[0], false])
}

const cleanValue = (v?: string): string | true =>
  v ? decodeURIComponent(v.replace(/\+/g, " ")) : true

type QuerySafeValues = string | true
type QueryStruct = { [name: string]: Array<QuerySafeValues> }

export const parseSearch = (searchString: string): QueryStruct => {
  const output: QueryStruct = {}
  const pairs = searchString.split(/&|;/)

  for (var j = 0; j < pairs.length; j++) {
    const pair = pairs[j].match(qp_re)
    if (pair) {
      const [, k, v] = pair
      if (output[k]) {
        output[k].push(cleanValue(v))
      } else {
        output[k] = [cleanValue(v)]
      }
    }
  }

  return output
}

export const deparseSearch = (queryObject: QueryStruct) => {
  const pairs: string[] = []
  Object.keys(queryObject).forEach(k => {
    const vArr = queryObject[k]
    vArr.forEach(v => {
      if (v === true) {
        pairs.push(encodeURIComponent(k))
      } else {
        pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v))
      }
    })
  })
  return pairs.join("&")
}

export type QueryValue = string | number | boolean | undefined

export const nameDoesntExist = []
export const getQueryValue = (
  rawQuery: string,
  name: string,
): Array<QueryValue> => {
  const query = parseSearch(rawQuery)
  return query[name] || nameDoesntExist
}

export const getSingleQueryValue = (
  rawQuery: string,
  name: string,
): QueryValue => {
  const query = parseSearch(rawQuery)
  return query[name] && query[name][0]
}

export const hasQueryValue = (rawQuery: string, name: string): boolean => {
  const query = parseSearch(rawQuery)
  return !!query[name]
}

export const setQueryValue = (
  rawQuery: string,
  name: string,
  value: QuerySafeValues | QuerySafeValues[],
): string => {
  const query = parseSearch(rawQuery)
  query[name] = Array.isArray(value) ? value : [value]
  return deparseSearch(query)
}

export const omitQueryValue = (
  rawQuery: string,
  name: string | string[],
): string => {
  const query = parseSearch(rawQuery)
  if (Array.isArray(name)) {
    name.forEach(n => delete query[n])
  } else {
    if (!query[name]) {
      // shortcut
      return rawQuery
    }
    delete query[name]
  }
  return deparseSearch(query)
}

export const appendToQueryValue = (
  rawQuery: string,
  name: string,
  value: QuerySafeValues | QuerySafeValues[],
): string => {
  const query = parseSearch(rawQuery)
  query[name] = (query[name] || []).concat(
    Array.isArray(value) ? value : [value],
  )
  return deparseSearch(query)
}

export const removeFromQueryValue = (
  rawQuery: string,
  name: string,
  whereValueIs: QuerySafeValues | QuerySafeValues[],
): string => {
  const query = parseSearch(rawQuery)
  if (!query[name]) return rawQuery

  query[name] = query[name].filter(v =>
    Array.isArray(whereValueIs)
      ? !whereValueIs.includes(v)
      : v !== whereValueIs,
  )
  if (query[name].length === 0) {
    delete query[name]
  }
  return deparseSearch(query)
}

export const toggleQueryValue = (
  rawQuery: string,
  name: string,
  whereValueIs: QuerySafeValues,
): string => {
  const query = parseSearch(rawQuery)
  if (!query[name]) {
    query[name] = [whereValueIs]
  } else {
    if (query[name].includes(whereValueIs)) {
      query[name] = query[name].filter(v => v !== whereValueIs)
      if (query[name].length === 0) {
        delete query[name]
      }
    } else {
      query[name] = query[name].concat(whereValueIs)
    }
  }

  return deparseSearch(query)
}

const _curry = (f: Function, order: number[], _taken?: any[], called = 0) => (
  arg: any,
) => {
  let taken = _taken ? _taken : []
  taken[order[called]] = arg
  if (called === order.length - 1) {
    return f(...taken)
  } else {
    return _curry(f, order, taken, called + 1)
  }
}

const qf2 = [0, 1]
const qf3 = [0, 1, 2]
export const queryFirst = {
  getQueryValue: _curry(getQueryValue, qf2),
  getSingleQueryValue: _curry(getSingleQueryValue, qf2),
  hasQueryValue: _curry(hasQueryValue, qf2),
  setQueryValue: _curry(setQueryValue, qf3),
  omitQueryValue: _curry(omitQueryValue, qf2),
  appendToQueryValue: _curry(appendToQueryValue, qf3),
  removeFromQueryValue: _curry(removeFromQueryValue, qf3),
  toggleQueryValue: _curry(toggleQueryValue, qf3),
}

const nf2 = [1, 0]
const nf3 = [1, 0, 2]
export const nameFirst = {
  getQueryValue: _curry(getQueryValue, nf2),
  getSingleQueryValue: _curry(getSingleQueryValue, nf2),
  hasQueryValue: _curry(hasQueryValue, nf2),
  setQueryValue: _curry(setQueryValue, nf3),
  omitQueryValue: _curry(omitQueryValue, nf2),
  appendToQueryValue: _curry(appendToQueryValue, nf3),
  removeFromQueryValue: _curry(removeFromQueryValue, nf3),
  toggleQueryValue: _curry(toggleQueryValue, nf3),
}
