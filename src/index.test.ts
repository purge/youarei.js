import {
  parseURI,
  parseSearch,
  pathParse,
  pathDir,
  pathBasenameSet,
  replace,
  omit,
  removeValue,
  appendValue,
  useSearchValue,
} from ".";

import {
  castToSingle,
  castToString,
  castToBoolean,
  getQueryValue,
  buildSearchString,
  useQueryValue,
  stringArray,
  booleanArray,
  booleanFirst,
  stringFirst,
  fromSearchShape,
  QueryValueAllTypes,
} from "./query";
import { Mutator } from "./queryMutators";

const testSearch = "?simple=1&array=2&array=3&boolean";
test("parse", () => {
  expect(
    parseURI(
      `http://user:pass@www.example.com:3000/a/b/c${testSearch}#fragment`
    )
  ).toMatchObject({
    scheme: "http",
    auth: "user:pass",
    host: "www.example.com",
    port: "3000",
    path: "/a/b/c",
    search: testSearch,
    fragment: "#fragment",
  });

  expect(
    parseURI(`https://www.example.com/a/b/c${testSearch}#fragment`)
  ).toMatchObject({
    scheme: "https",
    auth: undefined,
    host: "www.example.com",
    port: undefined,
    path: "/a/b/c",
    search: testSearch,
    fragment: "#fragment",
  });

  expect(parseURI(`https://www.example.com`)).toMatchObject({
    scheme: "https",
    auth: undefined,
    host: "www.example.com",
    port: undefined,
    path: "",
    search: "",
    fragment: "",
  });

  expect(() => parseURI("")).toThrow();
});

test("pathParse", () => {
  expect(pathParse("/a/b/c")).toMatchObject([
    ["a", "b", "c"],
    [true, false],
  ]);
  expect(pathParse("a/b/c")).toMatchObject([
    ["a", "b", "c"],
    [false, false],
  ]);
  expect(pathParse("a/b/c/")).toMatchObject([
    ["a", "b", "c"],
    [false, true],
  ]);
  expect(pathParse("/a/b/c/")).toMatchObject([
    ["a", "b", "c"],
    [true, true],
  ]);
});

test("pathDir", () => {
  expect(pathDir("/a/b/c")).toBe("/a/b/");
  expect(pathDir("a/b/c")).toBe("a/b/");
  expect(pathDir("a/b/c/")).toBe("a/b/c/");
});

test("pathBasenameSet", () => {
  expect(pathBasenameSet("/a/b/c", "d")).toBe("/a/b/d");
  expect(pathBasenameSet("/a/b/c/", "d")).toBe("/a/b/c/d");
  expect(pathBasenameSet("/a/b/c/", "d/e/f")).toBe("/a/b/c/d/e/f");
});

test("parseSearch", () => {
  expect(parseSearch(testSearch)).toMatchObject({
    simple: ["1"],
    array: ["2", "3"],
    boolean: [true],
  });
  expect(parseSearch("a=1&b")).toMatchObject({
    a: ["1"],
    b: [true],
  });
  expect(parseSearch("")).toMatchObject({});
});

describe("deparseSearch", () => {
  test("deparseSearch", () => {
    expect(buildSearchString({})).toBe("");
    expect(
      buildSearchString({
        simple: ["1"],
        array: ["2", "3"],
        boolean: [true],
      })
    ).toBe(testSearch);
    expect(
      buildSearchString({
        a: ["1"],
        b: [true],
      })
    ).toBe("?a=1&b");
    expect(
      buildSearchString({
        a: [true, true],
      })
    ).toBe("?a&a");
  });
});

const parsed = Object.freeze(parseSearch(testSearch));
const testOperation = (
  f: Mutator,
  k: string,
  v?: QueryValueAllTypes[]
): string => buildSearchString(f(parsed, k, v));

describe("operations", () => {
  test("operation: replace", () => {
    expect(testOperation(replace, "simple")).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
    expect(testOperation(replace, "simple", ["2"])).toBe(
      "?simple=2&array=2&array=3&boolean"
    );

    expect(testOperation(replace, "array", ["5"])).toBe(
      "?simple=1&array=5&boolean"
    );

    expect(testOperation(replace, "foo", ["bar"])).toBe(
      `${testSearch}&foo=bar`
    );

    expect(testOperation(replace, "boolean2", [true])).toBe(
      "?simple=1&array=2&array=3&boolean&boolean2"
    );

    expect(testOperation(replace, "simple", [undefined])).toBe(
      "?array=2&array=3&boolean"
    );

    expect(testOperation(replace, "array", [undefined, undefined])).toBe(
      "?simple=1&boolean"
    );
  });

  test("operation: omit", () => {
    expect(testOperation(omit, "simple")).toBe("?array=2&array=3&boolean");
    expect(testOperation(omit, "doesntexist")).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
    expect(testOperation(omit, "boolean")).toBe("?simple=1&array=2&array=3");
    expect(testOperation(omit, "array")).toBe("?simple=1&boolean");
  });

  test("operation: appendValue", () => {
    expect(testOperation(appendValue, "simple")).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
    expect(testOperation(appendValue, "simple", ["2"])).toBe(
      "?simple=1&simple=2&array=2&array=3&boolean"
    );
    expect(testOperation(appendValue, "foo", ["bar"])).toBe(
      "?simple=1&array=2&array=3&boolean&foo=bar"
    );
    expect(testOperation(appendValue, "foo", [true])).toBe(
      "?simple=1&array=2&array=3&boolean&foo"
    );
    expect(testOperation(appendValue, "array", ["4", "5"])).toBe(
      "?simple=1&array=2&array=3&array=4&array=5&boolean"
    );
  });

  test("operation: removeValue", () => {
    expect(testOperation(removeValue, "simple")).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
    expect(testOperation(removeValue, "simple", ["1"])).toBe(
      "?array=2&array=3&boolean"
    );
    expect(testOperation(removeValue, "simple", ["2"])).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
    expect(testOperation(removeValue, "array", ["2"])).toBe(
      "?simple=1&array=3&boolean"
    );
    expect(testOperation(removeValue, "array", ["2", "3"])).toBe(
      "?simple=1&boolean"
    );
    expect(testOperation(removeValue, "doesntexist", ["1"])).toBe(
      "?simple=1&array=2&array=3&boolean"
    );
  });
});

test("getQueryValue", () => {
  expect(getQueryValue(testSearch, "simple")).toMatchObject(["1"]);
  expect(getQueryValue(testSearch, "madeup")).toMatchObject([]);
});

test("useQueryValue", () => {
  const [queryValue, setQueryValue] = useQueryValue(testSearch, "simple");
  expect(queryValue).toMatchObject(["1"]);
  expect(setQueryValue(["2"])).toBe("?simple=2&array=2&array=3&boolean");
});

test("useQueryValue with op", () => {
  const [queryValue, setQueryValue] = useQueryValue(testSearch, "array");
  expect(queryValue).toMatchObject(["2", "3"]);
  expect(setQueryValue(["2"], removeValue)).toBe("?simple=1&array=3&boolean");
});

test("useQueryValue with chained setters", () => {
  const [, set] = useQueryValue(testSearch, "array");

  expect(set(["2"], removeValue, set(["3"], removeValue))).toBe(
    "?simple=1&boolean"
  );

  expect(set(["4"], set(["5"]))).toBe("?simple=1&array=4&boolean");
});
test("castToSingle", () => {
  const [queryValue, setQueryValue] = castToSingle(
    useQueryValue(testSearch, "simple")
  );
  expect(queryValue).toBe("1");
  expect(setQueryValue("2")).toBe("?simple=2&array=2&array=3&boolean");
});

test("castToString", () => {
  const [queryValue] = castToString(useQueryValue("?boolean", "boolean"));
  expect(queryValue).toMatchObject([undefined]);
  expect(castToString(useQueryValue("?test=a", "test"))[0]).toMatchObject([
    "a",
  ]);
});

test("castToBoolean", () => {
  const [queryValue] = castToBoolean(useQueryValue("?boolean", "boolean"));
  expect(queryValue).toMatchObject([true]);
  expect(castToBoolean(useQueryValue("?test=a", "test"))[0]).toMatchObject([
    false,
  ]);
});

test("type 'string'", () => {
  const [value, set] = stringFirst(testSearch, "simple");
  expect(value).toBe("1");
  expect(set("2")).toBe("?simple=2&array=2&array=3&boolean");
});

test("type 'string[]'", () => {
  const [value, set] = stringArray(testSearch, "simple");
  expect(value).toMatchObject(["1"]);
  expect(set(["2"])).toBe("?simple=2&array=2&array=3&boolean");
});

test("type 'boolean'", () => {
  const [value, set] = booleanFirst(testSearch, "boolean");
  expect(value).toBe(true);
  expect(set(false)).toBe("?simple=1&array=2&array=3");
});

test("type 'boolean[]'", () => {
  const [value, set] = booleanArray(testSearch, "boolean");
  expect(value).toMatchObject([true]);
  expect(set([false])).toBe("?simple=1&array=2&array=3");
});

test("useSearchValue (single)", () => {
  const [get, set] = useSearchValue("simple", "string")(testSearch);
  const [get2, set2] = useSearchValue("boolean", "boolean")(testSearch);
  const [get3, set3] = useSearchValue("boolean", "boolean[]")(testSearch);
  const [get4] = useSearchValue("simple", "string[]")(testSearch);
  expect(get).toBe("1");
  expect(get2).toBe(true);
  expect(get3).toMatchObject([true]);
  expect(get4).toMatchObject(["1"]);
  expect(set("2")).toBe("?simple=2&array=2&array=3&boolean");
  expect(set2(false)).toBe("?simple=1&array=2&array=3");
  expect(set("2", set2(false))).toBe("?simple=2&array=2&array=3");
  expect(set3([true], omit, set("2"))).toBe("?simple=2&array=2&array=3");
});

test("useSearchValues", () => {
  const [get] = fromSearchShape({
    simple: stringFirst,
    array: stringArray,
    boolean: booleanFirst,
  })(testSearch);
  expect(get).toMatchObject({
    simple: "1",
    array: ["2", "3"],
  });
  // expect(set.simple("2")).toBe("?simple=2&array=2&array=3&boolean");
  // expect(set.simple("3", appendValue, set.simple("5"))).toBe(
  //   "?simple=5&simple=3&array=2&array=3&boolean"
  // );
});
