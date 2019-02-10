# youarei

> A composable and fully typed (typescript) libary for working with query strings and paths. If you're bored with writing
> `(typeof query.foo === 'string')` in your code this might be for you. Comes with some useful casting
> functions for ensuring you are always getting `boolean`, `boolean[]`, `string`, `string[]` or even a `Date` / `Date[]`.
> You can easily provide your own [type casting function](#custom-types) to work with your design. Extensively tested with 100% code coverage. Relevant functions are memoized for performance using `mem`

![](https://travis-ci.com/purge/youarei.js.svg?branch=next)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

### Examples

[Usage](#example-usage)

[Type Casting](#type-casting)

[Custom Type Casting](#custom-types)

[Mutators](#mutators)

### API

[Query String](#example-usage-plain)

[Path](#example-usage-plain)

[Installing](#installing)

### Example Usage

While this example uses React, youarei is framework agnostic. There is a react hook compatible
with react-router available if you would prefer to avoid the boilerplate `history.push` and passing of `location`
the example uses the long-hand method for clarity.

```jsx

import useSearchValue, {appendValue, removeValue} from 'youarei'

const pageParams = useSearchValue({
  page: "string", // ?page=1
  filter: "string[]", // ?filter=a&filter=b
  showDetails: "boolean", // ?showDetails
})

const ToggleComponent = ({history, location: {search}}) => {
  const [value, set] = pageParams(search)
  const setQuery = search => history.push({search})

  const {
    showDetails, // typed as 'boolean'
    filter, // typed as 'string[]'
    page, //typed as 'string'
  } = value

  const handleChecked = checked => setQuery(set.showDetails(checked))
  const handlePageChange = e => setQuery(set.page(e.currentTarget.value))
  const toggleFilter = filterValue => checked =>
    setQuery(set.filter(
      e.currentTarget.value,
      filterValue,
      checked ? removeValue : appendValue
    ))

  return (
    <div>
      <select onChange={handlePageChange}>
        <option value="1">Page 1</option>
        <option value="2">Page 2</option>
      </select>

      <input
        checked={showDetails} type="checkbox" onChecked={handleChecked}
      /> Toggle Full Details

      {[1,2,3,4].map(i => (
        <input
          checked={value.filters.contains(i)}
          type="checkbox"
          onChecked={toggleFilter(i)}
        /> Filter {i}
      ))}
    </div>
  )

```

You can also set several query parameters at once using the `set()` chain

```jsx
const pageParams = useSearchValue({
  x: "string",
  y: "string",
})("x=100&y=100")
set(set.x("150"), set.y("150"))
```

If you only want to get a single query value, there is a short-hand option

```jsx
const [value, set] = useSearchValue("foo", "string")("foo=bar")
value === "bar"
set("gorch") === "foo=gorch"
```

### Type Casting

These types can be provided as a value to the configurator `useSearchValue`

#### string / string[]

Will always return a string or array of strings

#### boolean / boolean[]

Will always return a string or array of booleans.

#### Date / Date[]

Will always return a string or array of Dates.

### Custom Types

You can write your own wrapper around an existing

### Mutators

The following mutators for query data are provided. You can also provide your own matching the same signature.

#### omit

Omit the named query completely, i.e

```jsx
set("test", omit)("?a=b&test=1&test=2") === "?a=b"
```

#### replace

Replace or add the name + value to the query (default mutator)

```jsx
set("test", ["value"], replace)("?a=b&test=1&test=2") === "?a=b&test=value"
set("new", ["value"], replace)("?a=b&test=&test=2") ===
  "?a=b&test=&test=2&new=value"
```

#### appendValue

Append (or create) a value to a named query

```jsx
set("test", ["value"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&test=value"
set("test", ["value", "value2"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&test=value&test=value2"
set("new", ["value"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&new=value"
```

#### removeValue

remove value from a named query

```jsx
set("test", ["1"], removeValue)("?a=b&test=1&test=2") ===
  "?a=b&test=2&test=value"
set("test", ["1", "2"], removeValue)("?a=b&test=1&test=2") === "?a=b"
```

### Install

```
$ yarn add youarei
```

### Licence

MIT &copy; Simon Elliott
