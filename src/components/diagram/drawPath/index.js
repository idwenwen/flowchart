import { each, toArray } from '../tools/extension/iteration'
import { Exception } from '../tools/exception'
import { isObject, isString, isFunction } from 'lodash'
import Brushing from '../brush/index'
import { defNoEnum } from '../tools/extension/define'
import { pathList } from '../path'

/**
 * 绘制路径实例，存储用户对于绘制路径的设置。
 * 1.提供便捷的绘制工具以，以及自动的将当前的ctx进行存储重设等操作。开发只需要全心全意在绘制过程之中就可以。
 * 2.提供参数校验功能，帮助校验传递的参数是否符合预期。
 */
class DrawPath {
  // 全局预定义定义Path内容，记录用户的预定义的绘制路径。
  static PATH = new Map();

  // 对于全局的预定义Path方法的定义。
  static set (name, route) {
    if (isObject(name)) {
      each(name)((val, key) => {
        DrawPath.set(key.toString(), val)
      })
    } else {
      let content
      // route的为{path: Function, param: ?object} param主要存储的是当前的参数校验内容。
      if (isFunction(route)) content = { path: route }
      else content = route
      DrawPath.PATH.set(name, content)
    }
  }

  // 全局PATH对象的获取方法。
  static get (name) {
    const result = DrawPath.PATH.get(name)
    try {
      if (!result) {
        throw new Exception(
          'DoNotMatched',
          `There has no value related to ${name}`,
          Exception.level.Warn,
          false
        )
      } else {
        return result
      }
    } catch (err) {
      return void 0
    }
  }

  /** ****************实例参数与方法 ******************/
  // drawPath: PathDependence;  图形绘制方法 与 参数过滤条件。
  // drawPath: 可以是string, 绘制函数，或者是{path: 绘制函数，param: 参数过滤条件}
  constructor (drawPath) {
    // 存储一份原始样本，方便之后数据设置的时候的对比。
    defNoEnum(this, '_origin', '')
    this.setPath(drawPath)
  }

  // 对当前路径进行绘制。
  drawing (ctx, parameter, lifeCycle = {}) {
    const brush = new Brushing(ctx) // 绘制工作模板
    // 拷贝生命周期函数内容。
    const cycle = Object.assign({}, lifeCycle)

    // 添加表的生命周期内容，用于判定当前的参数的可行性
    if (cycle.beforeSave) {
      cycle.beforeSave = [
        ...toArray(cycle.beforeSave),
        () => {
          if (this.drawPath.paramFilter) {
          // TODO: 判定当前传递对象是否符合预设要求
          }
        }
      ]
    }
    brush.drawing(this.drawPath.path, parameter, cycle)
  }

  setPath (drawPath) {
    // 当传递的数据与原始样不相同的时候，对drawPath进行内容的更新
    // 更新之后的是否需要立即重回，将会依据外部调用的情况而视
    if (drawPath !== this._origin) {
      this._origin = drawPath
      this.drawPath = isString(drawPath)
        ? DrawPath.get(drawPath)
        : isFunction(drawPath)
          ? { path: drawPath }
          : drawPath
      return true
    }
    return false
  }

  getPath () {
    return this.drawPath.path
  }
}

function initDefaultPaths () {
  each(pathList)((val) => {
    DrawPath.set(val.name, val.draw)
  })
}

initDefaultPaths()

export default DrawPath
