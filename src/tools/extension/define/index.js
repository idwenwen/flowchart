/**
 * Common object operation.
 * 1. Define variable with descriptor
 * 2. Object iterator
 */

import { isObject, assign, eq } from 'lodash'
import { each } from '../iteration/index'

// 默认的属性描述符内容
const DEFAULT_SETTING = {
  configurable: true,
  enumable: true,
  writable: true
}

/**
 * 获取最终属性描述符
 * @param descriptor
 */
function toSetting (descriptor) {
  // 转变为标准的属性描述符对象内容
  descriptor = toObject(descriptor)
  descriptor =
    assign({}, DEFAULT_SETTING, descriptor)(descriptor.set || descriptor.get) &&
    delete descriptor.writable
  return descriptor
}

/**
 * 格式化属性描述符内容.
 * @param descriptor
 */
function toObject (descriptor) {
  // 判定当前内容是否为传统意义的属性描述符内容
  if (
    !isObject(descriptor) ||
    !descriptor.value ||
    !descriptor.set ||
    !descriptor.get
  ) {
    return { value: descriptor }
  }
  return descriptor
}

/**
 * 常规的属性定义方式
 * @param target
 * @param key
 * @param descriptor
 */
export function define (target, key, descriptor) {
  const setting = toSetting(descriptor)
  if (setting.set || setting.get) delete setting.writable
  return Reflect.defineProperty(target, key, setting)
}

/**
 * 设置单格或者同时设置多个属性内容.
 * @param target
 * @param key
 * @param descriptor
 */
function defOperation (target, keyOrDescriptors, descriptor) {
  return (setter) => {
    let result

    // 设置默认配置, 并定义新的变量内容
    const check = (des, key) => {
      const setting = toObject(des)
      setter(setting)
      return define(target, key, setting)
    }

    // 方便多数据内容的同时定义,keyOrDescriptors传递的内容对对象.
    if (isObject(keyOrDescriptors)) {
      result = each(keyOrDescriptors)((des, key) => {
        return !!check(des, key)
      })
    } else {
      result = check(descriptor, keyOrDescriptors)
    }
    return result
  }
}

/**
 * 设置不可遍历属性
 * @param target
 * @param key
 * @param descriptor
 */
export function defNoEnum (target, keyOrDescriptors, descriptor) {
  return defOperation(
    target,
    keyOrDescriptors,
    descriptor
  )((des) => {
    des.enumable = false
  })
}

export function defNoConfig (target, keyOrDescriptors, descriptor) {
  return defOperation(
    target,
    keyOrDescriptors,
    descriptor
  )((des) => {
    des.configurable = false
  })
}

export function defNoEnumConst (target, keyOrDescriptors, descriptor) {
  return defOperation(
    target,
    keyOrDescriptors,
    descriptor
  )((des) => {
    des.configurable = false
    des.enumable = false
  })
}

export function combineInto (origin, merge, willDelete = true) {
  const keys = Object.keys(origin)
  each(merge)((val, key) => {
    if (willDelete) {
      const index = keys.findIndex(item => item === key)
      if (index >= 0) {
        keys.splice(index, 1)
      }
    }
    if (!eq(origin[key], val)) {
      origin[key] = val
    }
  })
  if (willDelete && keys.length > 0) {
    each(keys)(item => {
      delete origin[item]
    })
  }
  return origin
}
