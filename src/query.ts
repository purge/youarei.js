import memoize from "mem"
import { replace, omit, appendValue, removeValue } from "./queryMutators"
export { replace, omit, appendValue, removeValue }

const qp_re = /^([^=]+)(?:=(.*))?$/

const cleanValue = (v?: string): string | true =>
  v ? decodeURIComponent(v.replace(/\+/g, " ")) : true

export type SearchString = string
export type QueryValueBoolean = boolean
export type QueryValueString = string | undefined
export type QueryValueAllTypes = QueryValueBoolean | QueryValueString
export type QueryValue<ResultType = QueryValueAllTypes> = ResultType
export type QueryStruct = { [name: string]: Array<QueryValue> }

export const parseSearch = memoize(
  (_searchString: string): QueryStruct => {
    const output: QueryStruct = {}
    const searchString =
      _searchString[0] === "?" ? _searchString.substr(1) : _searchString
    const pairs = searchString.split(/&|;/)

    for (var j = 0; j < pairs.length; j++) {
      const pair = pairs[j].match(qp_re)
      if (pair) {
        const [, k, v] = pair
        if (output[k]) {
          output[k].push(cleanValue(v))
        } else {
          output[k] = [cleanValue(v)]
        }
      }
    }

    return output
  },
)

export const deparseSearch = memoize((queryObject: QueryStruct) => {
  const pairs: string[] = []
  Object.keys(queryObject).forEach(k => {
    const vArr = queryObject[k]
    vArr.forEach(v => {
      if (v === undefined || v === false) {
        return
      } else if (v === true) {
        pairs.push(encodeURIComponent(k))
      } else {
        pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v))
      }
    })
  })
  return pairs.length > 0 ? `?${pairs.join("&")}` : ""
})

export type QueryResultAsSingle<ResultType = QueryValueAllTypes> = [
  QueryValue<ResultType>,
  (input: ResultType, ...args: any) => string,
  { name: string }
]

export const nameDoesntExist = []

export const getQueryValue = (
  rawQuery: SearchString,
  name: string,
): QueryValue[] => {
  const query = parseSearch(rawQuery)
  return query[name] || nameDoesntExist
}

type SetQueryValue = (
  rawQuery: SearchString,
  name: string,
  value: QueryValue[],
  operation?: Function,
) => SearchString

export const setQueryValue: SetQueryValue = (
  rawQuery,
  name,
  value,
  operation = replace,
) => {
  const query = operation(parseSearch(rawQuery), name, value)
  return deparseSearch(query)
}

export type QueryResultAsArray<ResultType = QueryValueAllTypes> = [
  QueryValue<ResultType>[],
  Function,
  { name: string }
]

const _useQueryValue = (
  rawQuery: SearchString,
  name: string,
): QueryResultAsArray => {
  return [
    getQueryValue(rawQuery, name),
    (
      value: QueryValue[],
      operationOrRawQuery?: string | Function,
      nextRawQuery?: string,
    ): SearchString => {
      let operation = undefined
      let query = nextRawQuery || rawQuery

      if (operationOrRawQuery && typeof operationOrRawQuery === "function") {
        operation = operationOrRawQuery
      }

      if (operationOrRawQuery && typeof operationOrRawQuery === "string") {
        query = operationOrRawQuery
      }

      return setQueryValue(query, name, value, operation)
    },
    { name },
  ]
}

export const useQueryValue = memoize(_useQueryValue)

export const castToString = ([get, set, meta]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueString> => {
  return [
    get.map(v => (typeof v === "string" ? v : undefined)),
    (values: QueryValueString[], ...args: any) => set(values, ...args),
    meta,
  ]
}

export const castToBoolean = ([get, set, meta]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueBoolean> => {
  return [
    get.map(v => (typeof v === "boolean" ? v : false)),
    (value: QueryValueBoolean[], ...args: any) => set(value, ...args),
    meta,
  ]
}

export function castToSingle<ValueType>([get, set, meta]: QueryResultAsArray<
  ValueType
>): QueryResultAsSingle<ValueType> {
  return [
    get[0],
    (value: QueryValue<ValueType>, ...args: any) => set([value], ...args),
    meta,
  ]
}

const string = (rawQuery: SearchString, name: string) =>
  castToSingle(castToString(useQueryValue(rawQuery, name)))

const stringArray = (rawQuery: SearchString, name: string) =>
  castToString(useQueryValue(rawQuery, name))

const boolean = (rawQuery: SearchString, name: string) =>
  castToSingle(castToBoolean(useQueryValue(rawQuery, name)))

const booleanArray = (rawQuery: SearchString, name: string) =>
  castToBoolean(useQueryValue(rawQuery, name))

export const types = {
  string,
  boolean,
  "boolean[]": booleanArray,
  "string[]": stringArray,
}

export const mergeRight = (toCombine: Array<Function>): string => {
  let result = ""
  toCombine.forEach(f => {
    result = f(result)
  })
  return result
}

// type ValueOf<A> = A[keyof A]

// FIXME needs queryFirst option
export const useSearchValue = (queries: {
  [name: string]: keyof typeof types
}) => {
  return (
    search: SearchString,
  ): [{ [name: string]: typeof types }, { [name: string]: Function }] => {
    const values: { [name: string]: any } = {}
    const setters: any = (toRun: any) => mergeRight(toRun)
    Object.keys(queries).forEach(q => {
      const fn = types[queries[q]]
      const [get, set] = fn(search, q)
      values[q] = get
      setters[q] = set
    })

    return [values, setters]
    //     const value: { [key: string]: QueryValue[] } = {}
    //     const setters: any = (toRun: any) => mergeRight(toRun)
    //     // queries.forEach(q => {
    //     //   const [get, set, meta] = q(search)
    //     //   value[meta.name] = get
    //     //   setters[meta.name] = (...args: any) => (lastValue: string) =>
    //     //     set(...args, lastValue)
    //     // })
    //     return [value, setters]
  }
}
