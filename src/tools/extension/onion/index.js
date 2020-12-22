/**
 * 逻辑过滤器
 */
import { UUID } from '../../uuid/index'
import { Exception } from '../../exception'

const MiddlewareId = new UUID()

export default class Middleware {
  // 当前洋葱函数过滤层预设。
  static preset = new Map();

  static set (name, middleware) {
    // 添加新的预设内容.
    Middleware.preset.set(name, middleware)
  }
  static get (name) {
    return Middleware.get(name)
  }

  // middlewares: Array<onionOperation>;
  // uuid: string;
  constructor () {
    this.uuid = MiddlewareId.get().toString()
  }

  // 当前实例注册过滤器函数
  register (operation) {
    this.middlewares.push(operation)
  }

  // 当前过滤器实例作为预设内容添加
  preset (name) {
    Middleware.preset.set(name, this)
  }

  // 返回包装好的函数机制。
  compose () {
    const wares = this.middlewares
    const running = (context, next) => {
      let index = -1
      function dispatch (i) {
        if (i <= index) {
          Promise.reject(
            new Exception(
              'RepeatExecution',
              'Middleware has been ran before',
              Exception.level.Error,
              false
            )
          )
        } else {
          index++
          let fn = wares[i]
          if (i === wares.length) fn = next
          if (!fn) Promise.resolve()
          try {
            return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
          } catch (err) {
            return Promise.reject(err)
          }
        }
      }
      dispatch(0)
    }
    return running
  }
}
