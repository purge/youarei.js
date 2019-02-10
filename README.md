# Youarei

### Synopsis

Youarei is a tiny fully-typed immutable and functional library that provides many helpful utility functions to help deal add, remove from querystrings, paths and parsing raw URIs.

It exports several FP modes to work the way you want it to.

### Installing

`yarn add youarei`

### Example Usage

Using the `nameFirst` mode we can compose useful functions for our react-router components. Youarei is completely library independent and just provides the building blocks.

```javascript
import {nameFirst: {getQueryValue, toggleQueryValue}} from 'youarei'

const togglePinned = toggleQueryValue("pinned")
  // always an array (or use getSingleQueryValue)
const getPinned = getQueryValue("pinned")

const MyComponent = ({history, location}) => {
  const togglePinnedItem = togglePinned(location.search);
  const pinnedValues = getPinned(location.search);

  return (
    <input
      checked={!!pinnedValues.includes('1234')}
      type="checkbox"
      onChecked={(checked) => history.push({search: togglePinnedItem('1234', checked)}
    />
  )
}

```

or query-first parameter permissions for easy usage with router libraries

```javascript
import {queryFirst: {getQueryValue}} from 'youarei'

const query = getQueryValue("?foo=bar&other=something");
query("foo") === "bar"

```

or plain declarative mode

```javascript
import { getQueryValue } from "youarei"

getQueryValue("?foo=bar&other=something", "foo") === "bar"
```
