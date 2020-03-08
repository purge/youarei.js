# youarei

#### This documentation refers to the `next` branch of youarei which is under alpha release

URL queries are useful, underused, shareable application state. This library is designed to let you define that shape and use it throughout your application, for instance a pagination shape can defined as follows:

```js
const pageQuery = fromSearchShape({
  page_number: Y.String,
  per_page: Y.String,
  filter: Y.StringArray,
  search: Y.String,
});
```

In your component, you can use this to get the current state by passing in the location search string.

```js
// you would normally use window.location.search here,
// or your router location object.
const [getPageParams, setPageParams] = pageQuery(
  "?page_number=1&per_page=10&search=test&filter=prime&filter=completed"
);
```

`getPageParams` is a fully typed object

```json
{
  "page_number": "1",
  "per_page": "10",
  "search": "test",
  "filter": ["prime", "completed"]
}
```

later you can update the query using the setter, which is chainable so you can set multiple at once.

```js
const newSearch = setPageParams.page_number("6");
// "?page_number=6&per_page=10&search=test&filter=prime&filter=completed"
// or, using a mutator:
const newSearch = setPageParams.filter("prime", omit);
// "?page_number=6&per_page=10&search=test&filter=completed"
```

### Examples

[Mutators](#mutators)

[React Router](#react-router)

### API

[Query String](#example-usage-plain)

[Path](#example-usage-plain)

[Installing](#installing)

### React Router

While this example uses React, youarei is framework agnostic.

```tsx
import {useSearchValue, appendValue, removeValue, string, stringArray, boolean} from 'youarei'

const pageParams = useSearchValue({
  page: string, // ?page=1
  filter: stringArray, // ?filter=a&filter=b
  showDetails: boolean, // ?showDetails
})

const ToggleComponent = ({history, location: {search}}) => {
  const [value, set] = pageParams(search)
  const setSearch = search => history.push({search})

  const {
    showDetails, // typed as 'boolean'
    filter, // typed as 'string[]'
    page, //typed as 'string'
  } = value

  const handleChecked = (checked: boolean) => setSearch(set.showDetails(checked));
  const handlePageChange = e => setSearch(set.page(e.currentTarget.value));
  const toggleFilter = (filterValue: number) => (checked: boolean) =>
    setSearch(set.filter(
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

```js
const pageParams = useSearchValue({
  x: string,
  y: string,
})("x=100&y=100");
set.x("150", set.y("150"));
```

If you only want to get a single query value, there is a short-hand option

```js
const [value, set] = useSearchValue("foo", string)("foo=bar");
value === "bar";
set("gorch") === "foo=gorch";
```

### Mutators

The following mutators for query data are provided. You can also provide your own confirming to the exported `Mutator` type.

#### omit

Omit the named query completely, i.e

```js
set("test", omit)("?a=b&test=1&test=2") === "?a=b";
```

#### replace

Replace or add the name + value to the query (default mutator)

```js
set("test", ["value"], replace)("?a=b&test=1&test=2") === "?a=b&test=value";
set("new", ["value"], replace)("?a=b&test=&test=2") ===
  "?a=b&test=&test=2&new=value";
```

#### appendValue

Append (or create) a value to a named query

```js
set("test", ["value"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&test=value";
set("test", ["value", "value2"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&test=value&test=value2";
set("new", ["value"], appendValue)("?a=b&test=1&test=2") ===
  "?a=b&test=1&test=2&new=value";
```

#### removeValue

remove value from a named query

```js
set("test", ["1"], removeValue)("?a=b&test=1&test=2") ===
  "?a=b&test=2&test=value";
set("test", ["1", "2"], removeValue)("?a=b&test=1&test=2") === "?a=b";
```

### Install

```
$ yarn add youarei
```

### Licence

MIT &copy; Simon Elliott
