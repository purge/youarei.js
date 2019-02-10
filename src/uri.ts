import memoize from "mem"

const uri_re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/
const auth_re = /^([^\@]+)\@/
const port_re = /:(\d+)$/

interface ParsedURL {
  scheme: string
  host: string
  port: string | null
  path: string
  search: string
  auth: string | null
  fragment: string
}

export const parseURI = memoize(
  (uri: string): ParsedURL => {
    // From RFC 3986
    var urlParts = uri.match(uri_re)
    if (!uri || !urlParts) {
      throw new Error("Invalid URI")
    }

    let authority = urlParts[4]
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
      scheme: urlParts[2],
      host: authority,
      auth,
      port,
      path: urlParts[5],
      search: urlParts[7] ? `?${urlParts[7]}` : "",
      fragment: urlParts[9] ? `#${urlParts[9]}` : "",
    }
  },
)
