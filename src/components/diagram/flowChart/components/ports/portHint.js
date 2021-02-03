import { toRGBA } from '@/tools/extension/color'
import { portType } from '.'
import { setSuccess } from '../../canvas'
// import { getCurrentLink, LinkingSuccess } from '../../canvas'

class PortHint {
  // port: Port; // 归属于哪一个端口。
  constructor (port) {
    this.port = port
  }

  getParameter () {
    return {
      center: function () {
        return this.center
      },
      radius: function () {
        return this.width * 0.7 // 当前圆半径
      },
      lineWidth: function () {
        return this.radius
      },
      color: function () {
        return this.color
      }
    }
  }

  getEvents () {
    const _t = this
    return {
      linkHint (eve, type) {
        // 优先判定当前端口是否为入端口
        // 通过传递过来的组件类型判当前端口是否可以连接。如果过可以则展示当前的linkhint调用当前对象的exhibition事件
        const otype = _t.port.type
        if (!(_t.port.hasConnect && !_t.port.multiple)) {
          let dispatch = false
          if (type === portType.DataInput && otype === portType.DataOutput) {
            dispatch = true
          } else if (type === portType.DataOutput && otype === portType.DataInput) {
            dispatch = true
          } else if (type === portType.ModelInput && otype === portType.ModelOutput) {
            dispatch = true
          } else if (type === portType.ModelOutput && otype === portType.ModelInput) {
            dispatch = true
          }
          if (dispatch) {
          // if (process.env.NODE_ENV === 'development') {
            console.log(_t.port.container.name + ' ' + otype + ' port showing')
            // }
            this.origin.animateDispatch('exhibition')
          }
        }
      },
      linkInto (eve, pos) {
        // 触发port内容的连接事件
        if (this.isPointInFigure(pos) && this.origin.getDisplay()) {
          _t.port.container.diagram.dispatchEvents('linkIntoPort', eve, _t.port.name)
          // port 记录当前的连接情况
          setSuccess()
        }
      },
      linkHide () {
        if (this.origin.getDisplay()) {
          this.origin.animateDispatch('hidden')
        }
      }
    }
  }

  getAnimation () {
    const _t = this
    let originWidth
    return {
      // 展示当前的hint内容的动画
      exhibition: {
        variation: function (progress) {
          // if (process.env.NODE_ENV === 'development') {
          console.log(_t.port.container.name + ' port exhibition, process:' + progress)
          // }
          if (!this.origin.getDisplay()) this.origin.setDisplay(true)
          if (!originWidth) originWidth = this.radius
          this.radius = originWidth * progress
        },
        time: 200
      },
      hidden: {
        variation: function (progress) {
          this.radius = originWidth * (1 - progress)
          if (progress >= 1) {
            this.origin.setDisplay(false)
            this.radius = originWidth
            originWidth = null
          }
        },
        time: 100,
        progress: 'EaseIn'
      }
    }
  }

  childPath () {
    const defP = {
      color () {
        return this.color
      },
      radius () {
        return this.radius
      },
      center () {
        return this.center
      },
      lineWidth () {
        return this.lineWidth
      }
    }
    return [
      {
        data: Object.assign({}, defP, {
          fill () { return false },
          stroke () { return true }
        }),
        path: 'circle'
      },
      {
        data: Object.assign({}, defP, {
          fill () { return true },
          stroke () { return false },
          color () {
            const origin = toRGBA(this.color).split(',')
            origin[3] = origin[3].replace(/[0-9|\\.]+/, '0.2')
            return origin.join(',')
          }
        }),
        path: 'circle'
      }
    ]
  }

  toSetting () {
    return {
      data: this.getParameter(),
      display: false,
      events: this.getEvents(),
      animate: this.getAnimation(),
      children: this.childPath()
    }
  }
}

export default PortHint
