import { isArray, isNil, isObject } from 'lodash'
import record, { Exception } from '../../exception'

// 遍历对象内容
function iterationObject (object, operation) {
  const reduce = {}

  // 遍历当前对象之中的可遍历内容
  try {
    for (const key in object) {
      const res = operation(object[key], key, object) // 针对每一个对象的遍历结果
      if (!isNil(res)) reduce[key] = res
    }
    return reduce
  } catch (err) {
    // 可以给定breaking方案，只需要抛出错误。
    return reduce
  }
}

// 映射的遍历
function iterationMap (map, operation) {
  const reduce = new Map()
  try {
    for (const item of map) {
      const res = operation(item[1], item[0], map)
      if (!isNil(res)) reduce.set(item[0], res)
    }
    return reduce
  } catch (err) {
    return reduce
  }
}

function iterationArray (arr, operation) {
  const reduce = []
  try {
    for (let i = 0, l = arr.length; i < l; i++) {
      reduce.push(operation(arr[i], i, arr)) // 针对每一个对象的遍历结果
    }
    return reduce
  } catch (error) {
    return reduce
  }
}

function iterationArrayRight (arr, operation) {
  const reduce = []
  try {
    for (let i = arr.length - 1, l = 0; i >= l; i--) {
      reduce.push(operation(arr[i], i, arr)) // 针对每一个对象的遍历结果
    }
    return reduce
  } catch (err) {
    return reduce
  }
}

export function each (origin) {
  if (origin instanceof Map || Array.isArray(origin) || isObject(origin)) {
    return (operation) => {
      if (origin instanceof Map) {
        return iterationMap(origin, operation)
      } else if (Array.isArray(origin)) {
        return iterationArray(origin, operation)
      } else if (isObject(origin)) {
        return iterationObject(origin, operation)
      }
    }
  } else {
    // 不支持map， object， array之外的数据类行进行遍历。
    record(
      new Exception('NotSupport',
        'Do not support to iterate this kind of data currently',
        Exception.level.Warn,
        false)
    )
  }
}

export function eachRight (origin) {
  if (Array.isArray(origin)) {
    return (operation) => {
      iterationArrayRight(origin, operation)
    }
  } else {
    // 不支持array之外的数据类行进行反向遍历。
    record(
      new Exception('NotSupport',
        'Do not support to iterate this kind of data currently',
        Exception.level.Warn,
        false)
    )
  }
}

export function toArray (items) {
  return isArray(items) ? items : [items]
}
