import { isFunction } from 'lodash'
import { throwing, Exception } from '../exception/index'

class Console {
  // _exhibition; 打印对象
  constructor () {
    // 当前打印对象直接设置成为console内容。
    this._exhibition = console
  }

  // 预设展示方法与方式。内部方法
  _presetOutput (funcName, operation) {
    return !!(!this[funcName]
      ? (this[funcName] = (content) => {
        operation(this.exhibition, content)
      })
      : void 0)
  }
}

function exhibiteProxy () {
  const handler = {
    set (target, key, func) {
      // 当且只当给定的内容是一个函数的时候才会进行添加。
      if (!isFunction(func)) {
        throwing(
          'IsNotFunction',
          'This instance only can add new function',
          Exception.level.Warn,
          false
        )
      }
      // 如果当前key值不在target之中，表明没有这种方法
      if (key in target) {
        // 添加新的方法。
        target._presetOutput(key, func)
      } else {
        // 当前名称的方法已经存在，将会有提示，并且替换当前已经存在的方法。
        throwing(
          'AlreadyHad',
          `There has exhibition operation called ${key}`,
          Exception.level.Warn,
          false
        )
      }
    },

    get (target, key) {
      if (!target[key]) {
        throwing(
          'DoNotExist',
          `There has no such function called ${key}`,
          Exception.level.Warn,
          false
        )
      } else {
        return target[key]
      }
    }
  }

  return new Proxy(new Console(), handler)
}

export default exhibiteProxy()
