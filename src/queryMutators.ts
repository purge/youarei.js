import memoize from "mem";
import { QueryStruct, QueryValueAllTypes } from "./query";

export type Mutator = (
  queryStruct: QueryStruct,
  name: string,
  value?: QueryValueAllTypes[]
) => QueryStruct;

export const replace: Mutator = memoize(
  (queryStruct, name, value) => {
    if (value === undefined) return queryStruct;
    if (value.length === 1 && value[0] === undefined) {
      return {
        ...queryStruct,
        [name]: [undefined], // undefined are removed in the deparse
      };
    } else {
      return {
        ...queryStruct,
        [name]: value,
      };
    }
  },
  { cacheKey: JSON.stringify }
);

export const omit: Mutator = memoize(
  (queryStruct, name) => {
    if (queryStruct[name]) {
      return {
        ...queryStruct,
        [name]: [undefined],
      };
    } else {
      return queryStruct;
    }
  },
  { cacheKey: JSON.stringify }
);

export const removeValue: Mutator = memoize(
  (queryStruct, name, value) => {
    if (value === undefined) return queryStruct;
    if (queryStruct[name]) {
      const newValue: QueryValueAllTypes[] = queryStruct[name].filter(
        v => !value.includes(v)
      );
      return {
        ...queryStruct,
        [name]: newValue.length === 0 ? [undefined] : newValue,
      };
    } else {
      return queryStruct;
    }
  },
  { cacheKey: JSON.stringify }
);

export const appendValue: Mutator = memoize(
  (queryStruct, name, value) => {
    if (value === undefined) return queryStruct;
    return {
      ...queryStruct,
      [name]: [...(queryStruct[name] || []), ...value],
    };
  },
  { cacheKey: JSON.stringify }
);
