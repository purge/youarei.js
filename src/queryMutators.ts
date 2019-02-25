import memoize from "mem";
import { QueryStruct, QueryValue } from "./query";

export const replace = memoize(
  (
    queryStruct: QueryStruct,
    name: string,
    value: QueryValue[]
  ): QueryStruct => {
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
  }
);

export const omit = memoize(
  (queryStruct: QueryStruct, name: string): QueryStruct => {
    if (queryStruct[name]) {
      return {
        ...queryStruct,
        [name]: [undefined],
      };
    } else {
      return queryStruct;
    }
  }
);

export const removeValue = memoize(
  (
    queryStruct: QueryStruct,
    name: string,
    value: QueryValue[]
  ): QueryStruct => {
    if (queryStruct[name]) {
      const newValue: QueryValue[] = queryStruct[name].filter(
        v => !value.includes(v)
      );
      return {
        ...queryStruct,
        [name]: newValue.length === 0 ? [undefined] : newValue,
      };
    } else {
      return queryStruct;
    }
  }
);

export const appendValue = memoize(
  (
    queryStruct: QueryStruct,
    name: string,
    value: QueryValue[]
  ): QueryStruct => {
    return {
      ...queryStruct,
      [name]: [...(queryStruct[name] || []), ...value],
    };
  }
);
