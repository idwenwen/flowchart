import { Action } from '@/components/diagram/controller/action/action'
import { toChain } from '@cc/diagram/controller/action'
import { ComponentsStatus } from '..'

const CHOOSE = '#4159D1'
const SUCCESS = '#0EC7A5'
const ERROR = '#FF4F38'
const UNRUN = '#e8e8ef'
const COULDNOTRUN = '#BBBBC8'

function borderStyle (choosed, status, disable) {
  if (choosed) {
    return CHOOSE
  } else if (disable && status !== ComponentsStatus.unrun) {
    return UNRUN
  } else if (disable && status === ComponentsStatus.unrun) {
    return COULDNOTRUN
  } else if (status === ComponentsStatus.success) {
    return SUCCESS
  } else if (status === ComponentsStatus.running) {
    return SUCCESS
  } else if (status === ComponentsStatus.fail) {
    return ERROR
  } else if (status === ComponentsStatus.unrun) {
    return UNRUN
  }
}

class Border {
  toStatus () {
    let originColor
    return toChain({
      list: [
        {
          variation (progress, status) {
            if (!originColor) originColor = this.color
            const target = borderStyle(this.choosed, status, this.disable)
            this.color = Action.get('color')(progress, originColor, target)
          },
          time: 500
        },
        {
          variation () {
            originColor = null
          },
          time: 0
        }
      ]
    })
  }

  toSetting () {
    return {
      parameter: {
        width () {
          return this.width
        },
        height () {
          return this.height
        },
        radius () {
          return this.radius
        },
        color () {
          return borderStyle(this.choosed, this.status, this.disable)
        },
        center () {
          return this.center
        },
        stroke: true
      },
      path: 'rect',
      animate: {
        toStatus: this.toStatus
      }
    }
  }
}

export default Border
