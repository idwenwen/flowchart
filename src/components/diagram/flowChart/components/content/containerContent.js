import { Action } from '@cc/diagram'
import { toChain } from '@cc/diagram/controller/action/chain'
import { ComponentsStatus } from '..'

const CHOOSE = '#4159D1'
const SUCCESS = '#0EC7A5'
const PROGRESS = 'rgba(36,182,139,0.6)'
const DISABLE_PROGRESS = 'rgba(187,187,200,0.6)'
const ERROR = '#FF4F38'
const UNRUN = '#e8e8ef'
const COULDNOTRUN = '#BBBBC8'

function contentColor (choosed, status, disable) {
  if (choosed) {
    if (status === ComponentsStatus.running) {
      return disable ? DISABLE_PROGRESS : PROGRESS
    }
    return CHOOSE
  } else if (disable && status !== ComponentsStatus.unrun) {
    return UNRUN
  } else if (disable && status === ComponentsStatus.unrun) {
    return COULDNOTRUN
  } else if (status === ComponentsStatus.success) {
    return SUCCESS
  } else if (status === ComponentsStatus.running) {
    if (disable) {
      return DISABLE_PROGRESS
    } else {
      return PROGRESS
    }
  } else if (status === ComponentsStatus.fail) {
    return ERROR
  } else if (status === ComponentsStatus.unrun) {
    return UNRUN
  }
}

class ContainerContent {
  toParameter () {
    return {
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
        return contentColor(this.choosed, this.status, this.disable)
      },
      center () {
        return this.center
      },
      fill: true,
      progress: 1
    }
  }

  loading () {
    let originColor
    const getOpacity = () => {
      return parseFloat(originColor.split(',')[3])
    }
    return toChain({
      list: [
        {
          variation (_progress) {
            this.color = originColor
            this.progress = 0
          },
          time: 0
        },
        {
          variation (progress) {
            this.progress = progress
          },
          time: 1000
        },
        {
          variation (progress) {
            if (!originColor) originColor = this.color
            const origin = this.color.split(',')
            const bet = getOpacity() * (1 - progress)
            origin[3] = origin[3].replace(/[0-9|\\.]+/, bet)
            return origin.join(',')
          },
          time: 500
        }
      ],
      repeat: true
    })
  }

  toStatus () {
    let originProgress, originColor
    return toChain({
      list: [
        {
          variation (progress, status) {
            if (this.type === ComponentsStatus.running) {
              (this['origin']).animationOperation('end')('loading')
            }
            if (!originProgress) originProgress = this.progress
            if (!originColor) originColor = this.color
            this.progress = originProgress + (1 - originProgress) * progress
            const target = contentColor(this.choosed, status, this.disable)
            this.color = Action.get('color')(progress, originColor, target)
          },
          time: 500
        },
        {
          variation () {
            originProgress = null
            originColor = null
          },
          time: 0
        }
      ]
    })
  }

  toSetting () {
    return {
      parameter: this.toParameter(),
      path: 'rect',
      animate: {
        loading: this.loading(),
        toStatus: this.toStatus()
      }
    }
  }
}

export default ContainerContent
