import { defNoEnum } from '../tools/extension/define'
import { each } from '../tools/extension/iteration'
import Tree from '../tools/extension/tree'
import DrawPath from '../drawPath/index'
import { isObject, isFunction, isNil } from 'lodash'
import Events from '../events/index'
import Animate, { AnimationOperation } from '../animation/index'
import { acquistion } from '../tools/extension/proxy'
import Progress from '../controller/progress'
import { calculateCanvas } from '../panel'
import Watcher from '../tools/observer/watcher'
import Parameter from '../parameter'
import { Exception } from '../tools/exception'

class Figure extends Tree {
  static Progress = Progress; // 提供设置接口
  static Path = DrawPath; // 提供设置接口

  // _display: boolean;  当前figure是否展示。
  // drawPath?: DrawPath;  表示的是当前绘制路径内容。

  // transform?: Transform; 当前绘制路径变形设置。
  // parameter: any; 相关的对象内容。
  // events: Events;
  // animation: Animate;

  // diagram: Diagram[];

  constructor (
    name, // 当前内容的唯一标识符
    data, // 参数对象，内容可以是任意数值，或者函数，将会以上层data参数内容作为观察对象。
    path, // 当前内容不一定存在path内容。
    events, // 事件配置内容
    animate, // 动画配置内容
    display = true, // 当前内容是否展示。

    parent,
    children
  ) {
    super(parent, children)
    defNoEnum(this, {
      name: name,
      _display: display
    })

    // 当前层不一定需要绘制路径。
    this.drawPath = path ? new DrawPath(path) : null

    // 新增data内容，自动关联parent的parameter的内容。
    this.dataSupport(data)
    this.dataUpdate()

    this._proxy = this.figureProxy()
    this.events = new Events(this._proxy, events)

    this.animation = new Animate(this._proxy, animate)
    this.animateOperation()
  }

  // redefined operation
  findChild (opera) {
    let node = opera(this._proxy) ? this : null
    if (node) return node
    else {
      for (const val of this.getChildren()) {
        node = val.findChild(opera)
        if (node) return node
      }
    }
    return node
  }

  /** **************data 相关操作与关联关系 ********************/
  // 更新或者创建data内容。
  dataSupport (data, context) {
    context = context || (this.getParent() && this.getParent().data.cache) // 自动与上层的data相关联
    if (this.data) {
      this.data.context(context) // 更新当前的上下文环境 如果有改变的话。
    } else {
      // 生成新的data对象内容
      this.data = new Parameter(data, context)
    }
  }

  // 当参数变化的时候figure将会自动的通知当前的展示的更新（重绘工作）。
  dataUpdate () {
    const _t = this
    if (this.data) {
      this.data.subscribe(
        new Watcher(
          _t.data.cache, // 监听当前数据之中的cache存储模块。
          function () {
            // 拷贝当前参数数值。
            const keys = Object.keys(this)
            if (this[keys[0]] !== undefined) {
              void 0
            }
            return Object.assign({}, _t)
          },
          (_result) => {
            // TODO:需要将当前figure变动通知到drawing内容。
            _t.root().render()
          }
        )
      )
    }
  }

  // 更新当前Figure的参数映射内容
  imply (nameOrImply, value) {
    // 如果是对象内容的话，将会遍历更新当前的内容
    if (isObject(nameOrImply)) {
      each(nameOrImply)((val, key) => {
        this.data.imply(key, val)
      })
    } else if (isFunction(nameOrImply)) {
      // 如果是函数的话将会替换掉之前的内容
      this.data.imply(nameOrImply)
    } else {
      this.data.imply(nameOrImply, value)
    }
  }

  /** *********************路径参数管理与监听********************* */
  setPath (nPath) {
    let willUpdate = false
    if (!this.drawPath) {
      this.drawPath = nPath ? new DrawPath(nPath) : null
      willUpdate = true
    } else {
      willUpdate = this.drawPath.setPath(nPath)
    }
    willUpdate && this.pathUpdate()
  }
  get path () {
    return this.drawPath && this.drawPath.getPath()
  }

  // 监听path内容的变化。
  pathUpdate () {
    const _t = this
    return new Watcher(
      this.drawPath,
      function () {
        return _t.getPath()
      },
      (_result) => {
        // TODO:通知当前内容做更新
        _t.root().render()
      }
    )
  }

  /** 展示设置 */
  setDisplay (showing) {
    // 当前节点与子节点全部隐藏
    if (showing !== this._display) {
      this.notify(function () {
        this._display = showing
      }, false)
    }
    this.root().render()
  }

  getDisplay () {
    return this._display
  }

  /** *************************当前对象层级关系设置 **********************/
  // 设置父节点，并更新parameter的相关参数。
  setParent (pa) {
    super.setParent(pa)
    if (!pa.getDisplay()) { // 设置当前的绘制展示内容
      this.setDisplay(pa.getDisplay())
    }
    // this.connection() // 因为更新parameter的内容，所以自动调用回调通知。
    this.dataSupport() // 更新上下文之中的环境。
  }

  // 代理方法,开放指定的相关参数给到调用方，限制接口展示方便获取。
  figureProxy () {
    const CustomerHandler = {
      set (target, key, value) {
        target.data.cache[key] = value
        return true
      },
      get (target, key) {
        if (key === 'isPointInFigure') {
          return (point, ctx) => {
            return target.isPointInFigure(point, ctx)
          }
        } else {
          return target.data.cache[key]
        }
      }
    }
    return acquistion(this, CustomerHandler)
  }

  isPointInFigure (point, ctx = calculateCanvas.dom.getContext('2d')) {
    // ctx将直接使用计算绘板代替
    let result = false
    // const _t = this

    // 通知内容以进行绘制。
    this.notify(function () {
      const __t = this
      if (this.drawPath && this.getDisplay()) {
        this.drawPath.drawing(
          ctx,
          this.data.cache,
          {
          // 在afterDraw生命周期之中判定当前点内容是否在路径之中
            afterDraw: function (ctxx) {
              if (!__t.drawPath || __t.drawPath._origin !== 'icon') {
                result = ctxx.isPointInPath(point[0], point[1])
              } else {
                const data = __t.data.cache
                const center = data.center
                const width = data.width
                const height = data.height
                result = point[0] >= (center[0] - width / 2) &&
                  point[0] <= (center[0] + width / 2) &&
                  point[1] >= center[1] - height / 2 &&
                  point[1] <= center[1] + height / 2
              }
            }
          }
        )
        if (result) {
          throw new Exception(
            'BreakingException',
            'Has checked to be sure for result',
            Exception.level.Info,
            false
          )
        }
      }
    }, false)
    return result
  }

  // 传递画笔并绘制当前内容，树的层级越高，绘制的层级也相对越高。
  drawing () {
    // 以广度遍历的形式从下往上绘制内容。
    const _t = this
    return (ctx) => {
      _t.notify(
        function () {
          if (this && this.getDisplay && this.getDisplay()) {
            if (this.drawPath) {
              this.drawPath.drawing(ctx, this.data.cache)
            } // 当前节点的绘制
          }
        },
        true,
        false,
        true
      )
    }
  }

  /** **********************动画相关操作******************** */
  animateOperation () {
    const _t = this
    each(Object.assign({}, AnimationOperation, {
      Add: 'add',
      Remove: 'remove'
    }))((_val, key) => {
      _t['animate' + key] = _t.animating(key)
    })
  }

  // 动画操作
  animating (
    operation
  ) {
    // 当且仅当operation为add的时候name才可能是animateSetting的类型。
    return (name, ...meta) => {
      if (operation in AnimationOperation) {
        // 如果是动画进程
        this.notify(
          function () {
            // meta用来传递多个参数，但不一定有参数内容，依据的接口内容进行传递。
            this.animation[operation.toLowerCase()](name, ...meta)
          },
          false,
          false,
          false
        )
      } else {
        // 如果为remove的时候只有第一个参数有用，如果过为add方法的时候则需要多个参数。
        this.animation[operation](name, ...meta)
      }
    }
  }

  /** **********************事件相关操作******************** */
  // 事件触发。
  dispatchEvents (name, eve, ...meta) {
    this.notify(
      function () {
        this.events.dispatch(name, eve, ...meta)
      },
      false,
      false,
      false
    )
  }
}

export default Figure

// 依据获取内容。
export function toFigure (setting, parent) {
  // 如果setting是figure对象的化，
  if (setting instanceof Figure) {
    setting.setParent(parent)
    return setting
  }
  const figure = new Figure(
    setting.name,
    setting.data,
    setting.path,
    setting.events,
    setting.animate,
    setting.display
  )
  if (parent) figure.setParent(parent)
  if (setting.children && setting.children.length > 0) {
    each(setting.children)((set) => {
      if (!isNil(setting.display) && !setting.display) set.display = false
      toFigure(set, figure)
    })
  }
  return figure
}
