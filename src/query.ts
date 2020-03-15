import memoize from "mem";
import {
  replace,
  omit,
  appendValue,
  removeValue,
  Mutator,
} from "./queryMutators";
export { replace, omit, appendValue, removeValue };

const qp_re = /^([^=]+)(?:=(.*))?$/;

const cleanValue = (v?: string): string | true =>
  v ? decodeURIComponent(v.replace(/\+/g, " ")) : true;

export type QueryName = string;
export type SearchString = string;
export type QueryValueBoolean = boolean;
export type QueryValueString = string | undefined;
export type QueryValueAllTypes = QueryValueBoolean | QueryValueString;
export type QueryStruct = { [name: string]: Array<QueryValueAllTypes> };

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

export const buildSearchString = memoize((queryObject: QueryStruct) => {
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

export const nameDoesntExist = [];

export const getQueryValue = (
  rawQuery: SearchString,
  name: QueryName
): QueryValueAllTypes[] => {
  const query = parseSearch(rawQuery);
  return query[name] || nameDoesntExist;
};

type SetQueryValue = (
  rawQuery: SearchString,
  name: QueryName,
  value: QueryValueAllTypes[],
  operation?: Mutator
) => SearchString;

export const setQueryValue: SetQueryValue = (
  rawQuery,
  name,
  value,
  operation = replace
) => buildSearchString(operation(parseSearch(rawQuery), name, value));

export type QueryResult<ResultType = QueryValueAllTypes> = [
  ResultType,
  (
    value: ResultType,
    operationOrRawQuery?: SearchString | Mutator,
    nextRawQuery?: SearchString
  ) => SearchString
];

export const useQueryValue = memoize(
  (
    rawQuery: SearchString,
    name: QueryName
  ): QueryResult<QueryValueAllTypes[]> => {
    return [
      getQueryValue(rawQuery, name),
      (value, operationOrRawQuery, nextRawQuery) => {
        let operation!: Mutator | undefined;
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

export const castToString = ([get, set]: QueryResult<
  QueryValueAllTypes[]
>): QueryResult<QueryValueString[]> => {
  return [
    get.map(v => (typeof v === "string" ? v : undefined)),
    (value, op, next) => set(value, op, next),
  ];
};

export const castToBoolean = ([get, set]: QueryResult<
  QueryValueAllTypes[]
>): QueryResult<QueryValueBoolean[]> => {
  return [
    get.map(v => (typeof v === "boolean" ? v : false)),
    (values, op, next) => set(values, op, next),
  ];
};

export function castToSingle<ValueType>([get, set]: QueryResult<
  ValueType[]
>): QueryResult<ValueType> {
  return [
    get[0],
    (value: ValueType, operationOrRawQuery, nextRawQuery) =>
      set([value], operationOrRawQuery, nextRawQuery),
  ];
}

export const stringFirst = (rawQuery: SearchString, name: string) =>
  castToSingle(castToString(useQueryValue(rawQuery, name)));

export const stringArray = (rawQuery: SearchString, name: string) =>
  castToString(useQueryValue(rawQuery, name));

export const booleanFirst = (rawQuery: SearchString, name: string) =>
  castToSingle(castToBoolean(useQueryValue(rawQuery, name)));

export const booleanArray = (rawQuery: SearchString, name: string) =>
  castToBoolean(useQueryValue(rawQuery, name));

export function useSearchValue(
  name: QueryName,
  kind: "string"
): (search: SearchString) => QueryResult<QueryValueString>;
export function useSearchValue(
  name: QueryName,
  kind: "string[]"
): (search: SearchString) => QueryResult<QueryValueString[]>;
export function useSearchValue(
  name: QueryName,
  kind: "boolean"
): (search: SearchString) => QueryResult<QueryValueBoolean>;
export function useSearchValue(
  name: QueryName,
  kind: "boolean[]"
): (search: SearchString) => QueryResult<QueryValueBoolean[]>;
export function useSearchValue(
  name: QueryName,
  kind: "string" | "string[]" | "boolean" | "boolean[]"
) {
  return (search: SearchString) => {
    switch (kind) {
      case "string":
        return stringFirst(search, name);
      case "string[]":
        return stringArray(search, name);
      case "boolean":
        return booleanFirst(search, name);
      case "boolean[]":
        return booleanArray(search, name);
    }
  };
}

type ConfigType = {
  [k: string]:
    | typeof stringFirst
    | typeof stringArray
    | typeof booleanFirst
    | typeof booleanArray;
};

export function fromSearchShape(config: ConfigType) {
  return (search: SearchString) => {
    const get: { [k: string]: unknown } = {};
    const set: { [k: string]: unknown } = {};
    for (const q in config) {
      [get[q], set[q]] = config[q](search, q);
    }

    return [get, set];
  };
}
