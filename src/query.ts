import memoize from "mem";
import { replace, omit, appendValue, removeValue } from "./queryMutators";
export { replace, omit, appendValue, removeValue };

const qp_re = /^([^=]+)(?:=(.*))?$/;

const cleanValue = (v?: string): string | true =>
  v ? decodeURIComponent(v.replace(/\+/g, " ")) : true;

export type SearchString = string;
export type QueryValueBoolean = boolean;
export type QueryValueString = string | undefined;
export type QueryValueAllTypes = QueryValueBoolean | QueryValueString;
export type QueryValue<ResultType = QueryValueAllTypes> = ResultType;
export type QueryStruct = { [name: string]: Array<QueryValue> };

export const parseSearch = memoize(
  (_searchString: string): QueryStruct => {
    const output: QueryStruct = {};
    const searchString =
      _searchString[0] === "?" ? _searchString.substr(1) : _searchString;
    const pairs = searchString.split(/&|;/);

    for (var j = 0; j < pairs.length; j++) {
      const pair = pairs[j].match(qp_re);
      if (pair) {
        const [, k, v] = pair;
        if (output[k]) {
          output[k].push(cleanValue(v));
        } else {
          output[k] = [cleanValue(v)];
        }
      }
    }

    return output;
  }
);

export const deparseSearch = memoize((queryObject: QueryStruct) => {
  const pairs: string[] = [];
  Object.keys(queryObject).forEach(k => {
    const vArr = queryObject[k];
    vArr.forEach(v => {
      if (v === undefined || v === false) {
        return;
      } else if (v === true) {
        pairs.push(encodeURIComponent(k));
      } else {
        pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    });
  });
  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
});

export type QueryResultAsSingle<ResultType = QueryValueAllTypes> = [
  QueryValue<ResultType>,
  (input: ResultType, ...args: any) => string
];

export const nameDoesntExist = [];

export const getQueryValue = (
  rawQuery: SearchString,
  name: string
): QueryValue[] => {
  const query = parseSearch(rawQuery);
  return query[name] || nameDoesntExist;
};

type SetQueryValue = (
  rawQuery: SearchString,
  name: string,
  value: QueryValue[],
  operation?: Function
) => SearchString;

export const setQueryValue: SetQueryValue = (
  rawQuery,
  name,
  value,
  operation = replace
) => {
  const query = operation(parseSearch(rawQuery), name, value);
  return deparseSearch(query);
};

export type QueryResultAsArray<ResultType = QueryValueAllTypes> = [
  QueryValue<ResultType>[],
  Function
];

export const useQueryValue = memoize(
  (rawQuery: SearchString, name: string): QueryResultAsArray => {
    return [
      getQueryValue(rawQuery, name),
      (
        value: QueryValue[],
        operationOrRawQuery?: string | Function,
        nextRawQuery?: string
      ): SearchString => {
        let operation = undefined;
        let query = nextRawQuery || rawQuery;

        if (operationOrRawQuery && typeof operationOrRawQuery === "function") {
          operation = operationOrRawQuery;
        }

        if (operationOrRawQuery && typeof operationOrRawQuery === "string") {
          query = operationOrRawQuery;
        }

        return setQueryValue(query, name, value, operation);
      },
    ];
  },
  { cacheKey: String }
);

export const castToString = ([get, set]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueString> => {
  return [
    get.map(v => (typeof v === "string" ? v : undefined)),
    (values: QueryValueString[], op: string | Function, next?: string) =>
      set(values, op, next),
  ];
};

export const castToBoolean = ([get, set]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueBoolean> => {
  return [
    get.map(v => (typeof v === "boolean" ? v : false)),
    (values: QueryValueBoolean[], op: string | Function, next?: string) =>
      set(values, op, next),
  ];
};

export function castToSingle<ValueType>([get, set]: QueryResultAsArray<
  ValueType
>): QueryResultAsSingle<ValueType> {
  return [
    get[0],
    (value: QueryValue<ValueType>, ...args: any) => set([value], ...args),
  ];
}

export const string = (rawQuery: SearchString, name: string) =>
  castToSingle(castToString(useQueryValue(rawQuery, name)));

export const stringArray = (rawQuery: SearchString, name: string) =>
  castToString(useQueryValue(rawQuery, name));

export const boolean = (rawQuery: SearchString, name: string) =>
  castToSingle(castToBoolean(useQueryValue(rawQuery, name)));

export const booleanArray = (rawQuery: SearchString, name: string) =>
  castToBoolean(useQueryValue(rawQuery, name));

export function useSearchValue(
  name: string,
  kind: "string"
): (search: SearchString) => QueryResultAsSingle<QueryValueString>;
export function useSearchValue(
  name: string,
  kind: "boolean"
): (search: SearchString) => QueryResultAsSingle<boolean>;
export function useSearchValue(
  name: string,
  kind: "boolean[]"
): (search: SearchString) => QueryResultAsArray<boolean>;
export function useSearchValue(
  name: string,
  kind: "string[]"
): (search: SearchString) => QueryResultAsArray<QueryValueString>;
export function useSearchValue(
  name: string,
  kind: "string" | "string[]" | "boolean" | "boolean[]"
) {
  return (search: SearchString) => {
    switch (kind) {
      case "string":
        return string(search, name);
      case "string[]":
        return stringArray(search, name);
      case "boolean":
        return boolean(search, name);
      case "boolean[]":
        return booleanArray(search, name);
    }
  };
}
