import { toRGBA } from '@cc/tools'
import { getCurrentLink, LinkingSuccess } from '../../canvas'

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
        return this.width * 0.525 // 当前圆半径
      },
      borderWidth: function () {
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
        if (type === _t.port.type) {
          this.origin.animateDispatch('exhibition')
        }
      },
      linkInto (eve, pos) {
        // 触发port内容的连接事件
        if (this.isPointInFigure(pos) && this.origin.display) {
          _t.port.container.diagram.animateDispatch('linkIntoPort', _t.port.name)
          // port 记录当前的连接情况
          const link = getCurrentLink()
          link.changeEnd(this.center)
          LinkingSuccess() // 连接成功。
        }
        this.port.container.hintFinish()
      },
      linkHide (eve) {
        if (this.origin.display) {
          this.origin.animateDispatch('hidden')
        }
      }
    }
  }

  getAnimation () {
    let originWidth
    return {
      // 展示当前的hint内容的动画
      exhibition: {
        variation: function (progress) {
          if (!this.origin.display) this.origin.display = true
          if (!originWidth) originWidth = this.radius
          this.radius = originWidth * progress
        },
        time: 200,
        progress: 'EaseIn'
      },
      hidden: {
        variation: function (progress) {
          this.radius = originWidth * (1 - progress)
          if (progress >= 1) {
            this.origin.display = false
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
      strokeWidth () {
        return this.borderWidth
      }
    }
    return [
      {
        data: Object.assign(defP, {
          stroke: true
        }),
        path: 'circle'
      },
      {
        data: Object.assign(defP, {
          fill: true,
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
