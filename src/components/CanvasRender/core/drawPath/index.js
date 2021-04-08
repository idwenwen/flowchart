import { each, toArray } from '../../tools/iteration'
import { isObject, isString, isFunction } from 'lodash'
import Brushing from '../brush/index'
import { defNoEnum } from '../../tools/define'
import { pathList } from './path'
import { record } from '../../tools/exception'

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
    // 当前name内容为object的时候
    if (isObject(name)) {
      each(name)((val, key) => {
        DrawPath.set(key.toString(), val)
      })
    } else {
      let content = null
      // route的为{path: Function, param: ?object} param主要存储的是当前的参数校验内容。
      if (isFunction(route)) content = { path: route }
      else content = route
      DrawPath.PATH.set(name, content)
    }
  }
  // 全局PATH对象的获取方法。
  static get (name) {
    const result = DrawPath.PATH.get(name)
    if (!result) {
      record('DoNotMatched',
        `There has no value related to ${name}`)
      return null
    } else {
      return result
    }
  }

  /** ****************实例参数与方法 ******************/
  // drawPath: PathDependence;  图形绘制方法 与 参数过滤条件。
  // drawPath: 可以是string, 绘制函数，或者是{path: 绘制函数，param: 参数过滤条件}
  constructor (drawPath, lc) {
    // 存储一份原始样本，方便之后数据设置的时候的对比。
    defNoEnum(this, '_origin', '')
    this.lifeCycle = lc || {} // 设置默认的绘制生命周期
    this.setPath(drawPath)
  }

  // 对当前路径进行绘制。
  drawing (ctx, parameter, lifeCycle = {}) {
    const brush = new Brushing(ctx) // 绘制工作模板
    // 生命周期函数最终内容
    const cycle = Object.assign({}, this.lifeCycle, lifeCycle)

    // 添加表的生命周期内容，用于判定当前的参数的可行性
    if (cycle.beforeSave) {
      cycle.beforeSave = [
        ...toArray(cycle.beforeSave),
        () => {
          if (this.drawPath.paramFilter) {
          // TODO: 判定当前传递对象是否符合预设要求,丰富filter之后可以添加逻辑。
          }
        }
      ]
    }
    brush.drawing(this.drawPath.path, parameter, cycle)
  }

  // 设置更新绘制路径
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

  // 获取绘制路径函数
  getPath () {
    return this.drawPath.path
  }
}

// 设置默认的绘制路径，路径内容从同层path之中获取
function initDefaultPaths () {
  each(pathList)((val) => {
    DrawPath.set(val.name, val.draw)
  })
}

initDefaultPaths()

export default DrawPath
