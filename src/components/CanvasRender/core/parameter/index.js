import { defNoEnum } from '../tools/extension/define'
import { each } from '../tools/extension/iteration'
import { isNil, isObject, isFunction, eq, remove } from 'lodash'
import Watcher from '../tools/observer/watcher'
import Observer from '../tools/observer'

/**
 * 参数对象, 不同的参数对象之间有相关性，通过发布订阅模式进行内容的关联。
 *
 * 1. imply: 当前对象的订阅者代理，记录了当前对象之中的原有映射，以及反馈映射之后的结果。
 * 2. cache: 结果缓存对象（发布者原对象的代理），可以作为下游parameter或者其他watcher的订阅对象。
 */
class Parameter {
  // imply: object;  原数据表
  // cache: object;  最终结果对象。

  constructor (origin, context) {
    const _t = this
    this.cache = null // 开始的时候还没有结果。
    this._hasProxy = false
    defNoEnum(this, {
      _imply: _t.initWatcher(origin, context)
    })
  }

  // 获取缓存的方法
  getCacheOperation (implying) {
    return function getCache () {
      if (!this) {
        return {}
      } else {
        const res = each(implying)((val, key) => {
          if (isFunction(val)) {
            return val.call(this)
          } else if (isObject(val) && key !== 'image') {
            return getCache(val)
          } else {
            return val
          }
        })
        return Object.assign({}, this, res)
      }
    }
  }

  setMemories () {
    // 判定当前cache属性，初始化当前的属性
    if (isNil(this.cache)) this.cache = {}

    // 返回cache的内容
    return function setCache (result) {
      // 表示当前cache内容已经被订阅了。此时修改cache不可以直接赋值，而是是需要进行内容合并入原对象内容
      if (this._hasProxy) {
        // 合并result进入原有的cache之中。
        const keys = Object.keys(this.cache)
        each(result)((val, key) => {
          if (!eq(this.cache[key], val)) this.cache[key] = val // 两值不相同的情况下
          remove(keys, (k) => k === key)
        })

        // 合并结束之后删除掉多余的内容，如果存在的话。
        if (keys.length > 0) {
        // 删除多余的展示内容。
          each(keys)((key) => {
            delete this.cache[key]
          })
        }
      } else {
        this.cache = result
      }
    }
  }

  /**
   * 初始化当对象的订阅形式。
   * @param implying 映射关系对象或者getter方法。
   * @param context 当前watcher的上下文内容。
   */
  initWatcher (implying, context) {
    const _t = this
    return new Watcher(context,
      // Getter方法，对象内容转换，并将context之中不同值赋予当前内容。
      _t.getCacheOperation(implying),
      // 回调函数。watcher之中的cache汇总至此、
      _t.setMemories()
    )
  }

  /**
   * 更新当前parameter依据的上下文环境。
   * @param para 发布对象
   */
  booking (para) {
    para.subscribe(this._imply)
  }

  notifier () {
    if (!this._hasProxy) {
      // 当前cache作为变动关联上游。
      this.cache = new Observer(this.cache).observer
      this._hasProxy = true
    }
  }

  /**
   * 确定下游变动 或者 组装当前cache为发布者。
   * @param watcher 订阅对象订阅可观察者
   */
  subscribe (watcher) {
    this.notifier()
    watcher && (watcher.context(this.cache)) // 修改订阅内容的相关上下文环境。
  }

  /**
   * 更新映射表内容
   * @param keyOrAll 对应字段的名称，或者新定义的映射表内容
   * @param imply 字段新参数
   */
  imply (keyOrAll, implying) {
    if (isObject(keyOrAll) || isFunction(keyOrAll)) {
      // 更新全部映射。
      this._imply.getters(implying)
    } else {
      // 更新单个字段内容
      this._imply.getter(keyOrAll, implying)
    }
  }

  /**
   * 修改上下文环境
   * @param {object} context 上下文对象。
   */
  context (context) {
    this._imply.context(context)
  }
}

export default Parameter
