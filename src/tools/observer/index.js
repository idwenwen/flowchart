import Dep from './dep'
import { isObject, isArray, eq } from 'lodash'
import { defNoEnum } from '../extension/define'
import {Exception} from '../exception'
import {each} from '../extension/iteration'

/**
 * 当前订阅者的代理操作。
 * @param observer 订阅者实例
 */
const DefaultOperation = (observer) => {
  return {
    // 参数设置代理
    set (target, key, value) {
      if (!eq(target[key], value) || !target[key]) {
        const doIgnore = observer.doIgnore(key)
        // 当数据与原有数据不相同的时候，或者原本数据就不存在

        if ((isObject(key) || isArray(key)) && !doIgnore) {
          // 如果数据是对象的话进行监测，并且参数不需要忽视的时候
          value = observer.obser(value)
        }

        target[key] = value

        // 数据修改之后如果不是无效内容进行订阅通知。
        !doIgnore && observer.notify()
        return !!value
      }
      return false
    },

    // 数据删除代理
    delete (target, key) {
      let result
      const doIgnore = observer.doIgnore(key)
      try {
        if (Array.isArray(target)) {
          // 如果是数组
          result = target.splice(key, 1)
        } else if (isObject(target)) {
          // 如果是对象。
          result = delete target[key]
        } else {
          // 其他情况
          throw new Exception(
            'CannotDelete',
            `Cannot delete ${key.toString()} from ${target}`,
            Exception.level.Warn,
            false
          )
        }

        // 删除之后,如果非忽视参数，需要发布更新
        !doIgnore && observer.notify()
        return result
      } catch (err) {
        return false
      }
    },

    // 参数定义
    defineProperty (target, key, descriptor) {
      const doIgnore = observer.doIgnore(key)
      if (
        (isObject(descriptor.value) || isArray(descriptor.value)) &&
        !doIgnore
      ) {
        // 如果是数组或者对象的情况的话，需要进行监听。
        descriptor.value = observer.obser(descriptor.value)
      }
      const res = Reflect.defineProperty(target, key, descriptor)
      // 进行更新通知
      !doIgnore && observer.notify()
      return res
    },

    // 参数获取
    get (target, key) {
      const val = target[key]

      // 如果当前由watcher在调用。添加订阅列表
      if (Dep.target) {
        observer.depend()
      }
      return val
    }
  }
}

/**
 * 发布者，存在于订阅者之间的发布通知关系。
 *
 * 通过proxy的形式监听对象之中的变量内容。
 * 传递的内容是作为监听变化的 对象 内容。
 *
 * p.s. 所以当当前的对象没有被调用参数的时候，get方法不会被调用则不会添加到监听内容。
 */
class Observer {
  // dep: Dep;
  // observer: any; 代理对象。
  // _origin: any; 原对象拷贝备份。
  /**
   * 观察者的构造函数
   * @param {object} observed 待观察对象
   * @param {Array} ignore 忽视的对象参数
   */
  constructor (observed, ignore) {
    // 将当前参数设置成为不可便利
    defNoEnum(this, {
      dep: new Dep(),
      _ignore: ignore,
      _context: observed // 原映射对象
    })
    this.observer = this.obser(this._context, this._ignore)
  }

  /**
   * 深层代理发布对象内容。
   * @param observed 发布原对象
   * @param ignore 待忽视参数列表
   */
  obser (observed, ignore) {
    each(observed)((val, key) => {
      if (
        (isObject(val) || isArray(val)) && // 当前参数是兑现或者数组
        ignore.find((val) => key === val) // 当前变量不在val之中。
      ) {
        observed[key] = this.obser(val) // 深层遍历当前的对象确定其子内容有需要代理的内容。
      }
    })
    return new Proxy(observed, DefaultOperation(this))
  }

  // 修改当前的观察的对象。
  context (observed) {
    if (!eq(observed, this._context)) {
      this._context = observed
      this.observer = this.obser(observed)
      this.notify()
    }
  }

  // 设置新的ignore内容
  ignore (ignores) {
    this._ignore = ignores
    this.observer = this.obser(this._context, this._ignore)
    this.notify()
  }

  doIgnore (key) {
    // 测试当前关键子是否在ignore列表之中
    return this._ignore.find((val) => val === key)
  }

  notify () {
    // 发布更新通知
    this.dep.notify()
  }

  depend () {
    // 关联管理中心确定订阅者。
    this.dep.depend()
  }

  clear () {
    // 清除当前的订阅情况。
    this.dep.clear()
  }
}

export default Observer
