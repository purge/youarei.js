import memoize from "mem"
import { transpose } from "ramda/es/transpose"
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
  (input: ResultType, ...args: any) => string
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
  Function
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
  ]
}

export const useQueryValue = memoize(_useQueryValue)

export const castToString = ([get, set]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueString> => {
  return [
    get.map(v => (typeof v === "string" ? v : undefined)),
    (values: QueryValueString[], op: string | Function, next?: string) =>
      set(values, op, next),
  ]
}

export const castToBoolean = ([get, set]: QueryResultAsArray<
  QueryValueAllTypes
>): QueryResultAsArray<QueryValueBoolean> => {
  return [
    get.map(v => (typeof v === "boolean" ? v : false)),
    (values: QueryValueBoolean[], op: string | Function, next?: string) =>
      set(values, op, next),
  ]
}

export function castToSingle<ValueType>([get, set]: QueryResultAsArray<
  ValueType
>): QueryResultAsSingle<ValueType> {
  return [
    get[0],
    (value: QueryValue<ValueType>, ...args: any) => set([value], ...args),
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

interface Types {
  readonly string: typeof string
  readonly boolean: typeof boolean
  readonly "boolean[]": typeof booleanArray
  readonly "string[]": typeof stringArray
}

export const types: Types = {
  string,
  boolean,
  "boolean[]": booleanArray,
  "string[]": stringArray,
}

type Modifier = (a: SearchString, b: string, ...args: any) => any
type Configuration = { [name: string]: keyof Types | Modifier }
function isModifier(thing: keyof Types | Modifier): thing is Modifier {
  return typeof (<Modifier>thing) === "function"
}

type R1 =
  | ReturnType<typeof string>
  | ReturnType<typeof boolean>
  | ReturnType<typeof stringArray>
  | ReturnType<typeof booleanArray>

type R1Get = { [name: string]: R1[0] }
type R1Set = { [name: string]: R1[1] }

export const useSearchValue = (queries: Configuration) => {
  return (search: SearchString): [R1Get, R1Set] => {
    const get: R1Get = {}
    const set: R1Set = {}

    Object.keys(queries).forEach(q => {
      const value = queries[q]
      const fn = isModifier(value) ? value : types[value]
      const modifier = fn(search, q)
      if (value === "string") {
        ;[get[q], set[q]] = modifier as ReturnType<typeof string>
      } else if (value === "boolean") {
        ;[get[q], set[q]] = modifier as ReturnType<typeof boolean>
      } else if (value === "boolean[]") {
        ;[get[q], set[q]] = modifier as ReturnType<typeof booleanArray>
      } else if (value === "string[]") {
        ;[get[q], set[q]] = modifier as ReturnType<typeof stringArray>
      }
    })
    return [get, set]
  }
}
