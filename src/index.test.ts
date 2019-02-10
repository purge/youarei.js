import {
  parse,
  parseSearch,
  queryFirst as qf,
  nameFirst as nf,
  pathParse,
  pathDir,
  pathBasenameSet,
  getQueryValue,
  getSingleQueryValue,
  hasQueryValue,
  deparseSearch,
  setQueryValue,
  omitQueryValue,
  appendToQueryValue,
  removeFromQueryValue,
  toggleQueryValue,
} from "."

const testSearch = "simple=1&array=2&array=3&boolean"
const testURI = `http://user:pass@www.example.com:3000/a/b/c?${testSearch}#fragment`

test("parse", () => {
  expect(parse(testURI)).toMatchObject({
    scheme: "http",
    auth: "user:pass",
    host: "www.example.com",
    port: "3000",
    path: "/a/b/c",
    search: testSearch,
    fragment: "fragment",
  })
})

test("pathParse", () => {
  expect(pathParse("/a/b/c")).toMatchObject([["a", "b", "c"], [true, false]])
  expect(pathParse("a/b/c")).toMatchObject([["a", "b", "c"], [false, false]])
  expect(pathParse("a/b/c/")).toMatchObject([["a", "b", "c"], [false, true]])
  expect(pathParse("/a/b/c/")).toMatchObject([["a", "b", "c"], [true, true]])
})

test("pathDir", () => {
  expect(pathDir("/a/b/c")).toBe("/a/b/")
  expect(pathDir("a/b/c")).toBe("a/b/")
})

test("pathBasenameSet", () => {
  expect(pathBasenameSet("/a/b/c", "d")).toBe("/a/b/d")
  expect(pathBasenameSet("/a/b/c/", "d")).toBe("/a/b/c/d")
  expect(pathBasenameSet("/a/b/c/", "d/e/f")).toBe("/a/b/c/d/e/f")
})

test("parseSearch", () => {
  expect(parseSearch(testSearch)).toMatchObject({
    simple: ["1"],
    array: ["2", "3"],
    boolean: [true],
  })
  expect(parseSearch("a=1&b")).toMatchObject({
    a: ["1"],
    b: [true],
  })
})

test("deparseSearch", () => {
  expect(
    deparseSearch({
      simple: ["1"],
      array: ["2", "3"],
      boolean: [true],
    }),
  ).toBe(testSearch)
  expect(
    deparseSearch({
      a: ["1"],
      b: [true],
    }),
  ).toBe("a=1&b")
})

test("getQueryValue", () => {
  expect(getQueryValue(testSearch, "simple")).toMatchObject(["1"])
  // expect(r.getQueryValue(testSearch)("simple")).toBe(expectedValue)
  expect(getQueryValue(testSearch, "madeup")).toMatchObject([])
})

test("getSingleQueryValue", () => {
  //   // return the first value i.e not as an array
  const expectedValue = "1"
  expect(getSingleQueryValue(testSearch, "array")).toBe("2")
  expect(getSingleQueryValue(testSearch, "simple")).toBe("1")
  expect(getSingleQueryValue("a", "a")).toBe(true)
  expect(getSingleQueryValue(testSearch, "madeup")).toBe(undefined)
})

// boolean
test("hasQueryValue", () => {
  expect(hasQueryValue(testSearch, "simple")).toBe(true)
  expect(hasQueryValue(testSearch, "array")).toBe(true)
  expect(hasQueryValue(testSearch, "dldld")).toBe(false)
})

test("setQuery", () => {
  expect(setQueryValue(testSearch, "simple", "2")).toBe(
    "simple=2&array=2&array=3&boolean",
  )

  expect(setQueryValue(testSearch, "array", "5")).toBe(
    "simple=1&array=5&boolean",
  )

  expect(setQueryValue(testSearch, "foo", "bar")).toBe(`${testSearch}&foo=bar`)

  expect(setQueryValue(testSearch, "boolean2", true)).toBe(
    "simple=1&array=2&array=3&boolean&boolean2",
  )
})

test("omitQueryValue", () => {
  expect(omitQueryValue(testSearch, "simple")).toBe("array=2&array=3&boolean")
  expect(omitQueryValue(testSearch, "boolean")).toBe("simple=1&array=2&array=3")
  expect(omitQueryValue(testSearch, "array")).toBe("simple=1&boolean")
  expect(omitQueryValue(testSearch, ["array", "simple"])).toBe("boolean")
  expect(omitQueryValue(testSearch, ["array", "simple", "boolean"])).toBe("")
})

test("appendToQueryValue", () => {
  expect(appendToQueryValue(testSearch, "simple", "2")).toBe(
    "simple=1&simple=2&array=2&array=3&boolean",
  )
  expect(appendToQueryValue(testSearch, "foo", "bar")).toBe(
    "simple=1&array=2&array=3&boolean&foo=bar",
  )
  expect(appendToQueryValue(testSearch, "foo", true)).toBe(
    "simple=1&array=2&array=3&boolean&foo",
  )
})

test("removeFromQueryValue", () => {
  expect(removeFromQueryValue(testSearch, "simple", "1")).toBe(
    "array=2&array=3&boolean",
  )
  expect(removeFromQueryValue(testSearch, "simple", "2")).toBe(
    "simple=1&array=2&array=3&boolean",
  )

  expect(removeFromQueryValue(testSearch, "array", "2")).toBe(
    "simple=1&array=3&boolean",
  )
  expect(removeFromQueryValue(testSearch, "array", ["2", "3"])).toBe(
    "simple=1&boolean",
  )
})

test("toggleQueryValue", () => {
  expect(toggleQueryValue(testSearch, "simple", "1")).toBe(
    "array=2&array=3&boolean",
  )
  expect(toggleQueryValue(testSearch, "simple", "2")).toBe(
    "simple=1&simple=2&array=2&array=3&boolean",
  )
  expect(toggleQueryValue(testSearch, "foo", "bar")).toBe(
    "simple=1&array=2&array=3&boolean&foo=bar",
  )
})

test("/fp (query-first)", () => {
  expect(qf.getQueryValue(testSearch)("simple")).toMatchObject(["1"])
  expect(qf.getQueryValue(testSearch)("simple")).toMatchObject(["1"])
  expect(qf.getSingleQueryValue(testSearch)("simple")).toBe("1")
  expect(qf.hasQueryValue(testSearch)("simple")).toBe(true)
  expect(qf.setQueryValue(testSearch)("simple")("2")).toBe(
    "simple=2&array=2&array=3&boolean",
  )
  expect(qf.omitQueryValue(testSearch)("simple")).toBe(
    "array=2&array=3&boolean",
  )
  expect(qf.appendToQueryValue(testSearch)("simple")("2")).toBe(
    "simple=1&simple=2&array=2&array=3&boolean",
  )
  expect(qf.removeFromQueryValue(testSearch)("simple")("1")).toBe(
    "array=2&array=3&boolean",
  )
})

test("/fp (name-first)", () => {
  expect(nf.getQueryValue("simple")(testSearch)).toMatchObject(["1"])
  expect(nf.getSingleQueryValue("simple")(testSearch)).toBe("1")
  expect(nf.hasQueryValue("simple")(testSearch)).toBe(true)
  expect(nf.setQueryValue("simple")(testSearch)("2")).toBe(
    "simple=2&array=2&array=3&boolean",
  )
  expect(nf.omitQueryValue("simple")(testSearch)).toBe(
    "array=2&array=3&boolean",
  )
  expect(nf.appendToQueryValue("simple")(testSearch)("2")).toBe(
    "simple=1&simple=2&array=2&array=3&boolean",
  )
  expect(nf.removeFromQueryValue("simple")(testSearch)("1")).toBe(
    "array=2&array=3&boolean",
  )
})
