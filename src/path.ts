import memoize from "mem"

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
  if (slashes[1]) stringPath = stringPath + "/"
  return stringPath
}

export const pathDir = memoize(
  (rawPath: string): string => {
    const [path, slashes] = pathParse(rawPath)
    if (!slashes[1]) {
      path.pop()
      //add a trailing slash.
      path.push("")
    }

    return _pathToString(path, slashes)
  },
)

export const pathBasenameSet = (rawPath: string, baseName: string) => {
  const [path, slashes] = pathParse(rawPath)
  if (slashes[1]) {
    path.push(baseName)
  } else {
    path[path.length - 1] = baseName
  }
  return _pathToString(path, [slashes[0], false])
}
