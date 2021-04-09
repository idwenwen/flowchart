import { defNoEnum } from '../define'
import { each } from '../iteration'
import { record } from '../exception'
import UUID from '../uuid'
import { popTarget, pushTarget } from './dep'
import { eq, isObject, isFunction, isArray } from 'lodash'

// 唯一ID
const WatcherId = new UUID()

class Watcher {
  // uuid: string | number | symbol;
  // deps: Dep[];

  // active: boolean; 当前的订阅者是否起作用
  // getter: object | Function; 映射关系，可是多重映射关系，当然也可以是一个getter函数
  // callback: Function[]; 当获取了相关结果的时候，将会自动调用的回调函数。
  // context: any; getter调用时候的上下文环境

  // lazy: boolean; 是否支持懒加载
  // dirty: boolean; 懒加载的情况下单签数据是否需要更新

  // cache: object; 缓存结果
  constructor (context, getter, cb, lazy = false) {
    // 当前对象之中的变量，除cache之外不对外，不可遍历
    defNoEnum(this, {
      uuid: WatcherId.get(),
      active: true,

      deps: [], // 订阅的观察者

      _context: context,
      _getter: getter,
      _callback: cb ? (!isArray(cb) ? [cb] : cb) : [],

      lazy: lazy,
      dirty: true
    })
    this.run() // 内容可以进行对外获取以及
  }

  /**
   * 添加发布内容
   * @param dep
   */
  addDep (dep) {
    if (!this.deps.find((val) => val.uuid === dep.uuid)) {
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  /**
   * 删除发布内容。
   * @param dep
   */
  remove (dep) {
    // 依据id查找dep的位置，或是否存在
    const pos = this.deps.findIndex((val) => val.uuid === dep.uuid)
    if (pos >= 0) {
      this.deps.splice(pos, 1)
      dep.remove(this)
    }
  }

  /**
   * 清除所有的发布内容
   */
  clear () {
    each(this.deps)((dep) => {
      dep.remove(this)
    })
    this.deps = []
  }

  /**
   * 确定当前的dep的订阅关系
   */
  depend () {
    each(this.deps)((dep) => {
      dep.depend()
    })
  }

  /**
   * 获取对应的内容情况。
   */
  get (getter) {
    // 推入当前的订阅者入栈，方便发布者得知订阅对象
    pushTarget(this)

    let result
    // 如果是对象的情况，对象之中的所有数据定义的如果是数值，则
    if (isFunction(getter)) {
      result = getter.call(this._context)
    } else if (isObject(getter)) {
      result = {}
      each(getter)((get, key) => {
        try {
          result[key] = isFunction(get) // 如果是函数的话，直接调用获取现相关的参数内容。
            ? get.call(this._context)
            : isObject(get) // 如果是对象的话，则进行对其内容的遍历，返回最终结果。
              ? this.get(get)
              : get
        } catch (err) {
          // 当前context之中不存在相应的内容的时候，计算出现错误。
          result[key] = get
        }
      })
    } else {
      result = getter
    }
    popTarget()
    return result
  }

  /**
   * 运行当前的获取方法，更新缓存内容，并调用回调函数。
   */
  run () {
    try {
      const _t = this
      if (this.active && this._context) {
        // 当前内容订阅者是否运行
        if (this.dirty) {
          // 是否已经更新
          this.dirty = false
          this.cache = this.get(this._getter)
          // 更新之后调用回调函数
          if (this._callback.length > 0) {
            each(this._callback)(function (cb) {
              cb.call(_t._context, _t.cache)
            })
          } else if (isFunction(this._callback)) {
            this._callback.call(this._context, this.cache)
          }
        }
      } else {
        record(
          'UnactiveWatcher',
          'Current watcher is not working'
        )
      }
    } catch (err) {
      void 0
    } finally {
      void 0
    }
  }

  // 强制内容更新
  evaluate () {
    this.dirty = true
    this.run()
  }

  // 上下文内容有更新, 同时原有dep将会被重置
  context (cont) {
    if (!eq(cont, this._context)) {
      this.clear() // 清除旧的依赖，并重新运行当前watcher
      this._context = cont
      this.evaluate()
    }
  }

  // 完全更新getter对象内容。则自动重新获取cache内容，同时也影响相关的关联关系。
  getters (getOperation) {
    if (!eq(getOperation, this._getter)) {
      this.clear()
      this.getter = getOperation
      this.evaluate()
    }
  }

  getter (key, value) {
    if (isObject(this._getter) && !eq(this._getter[key], value)) {
      this._getter[key] = value
      this.evaluate()
    }
  }

  // 发布者有更新了
  updated () {
    this.dirty = true
    if (!this.lazy) {
      this.run()
    }
  }

  // 当前watcher是否启用
  able () {
    this.active = true
  }
  disable () {
    this.active = false
  }
}

export default Watcher
