import Action from '@/components/diagram/controller/action/action'
import { toChain } from '@/components/diagram/controller/action/chain'
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
  constructor () {
    this.progressing = 1
  }
  toParameter () {
    const _t = this
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
      progress () {
        return _t.progressing
      }
    }
  }

  loading () {
    const _t = this
    let originColor
    const getOpacity = () => {
      return parseFloat(originColor.split(',')[3])
    }
    return toChain({
      list: [
        {
          variation (_progress) {
            if (originColor) {
              this.color = originColor
            }
            this.progress = 0
            _t.progressing = 0
          },
          time: 0
        },
        {
          variation (progress) {
            this.progress = progress
            _t.progressing = progress
          },
          time: 2000
        },
        {
          variation (progress) {
            if (!originColor) originColor = this.color
            const origin = this.color.split(',')
            const bet = (getOpacity() * (1 - progress)).toFixed(2)
            origin[3] = origin[3].replace(/[0-9|\\.]+/, bet)
            this.color = origin.join(',')
          },
          time: 1000
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
            if (this.status === ComponentsStatus.running) {
              this.origin.animateEnd('loading')
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
          variation (_progress, status) {
            originProgress = null
            originColor = null
            this.origin.root().dispatchEvents('toStatus', status)
          },
          time: 0
        }
      ]
    })
  }

  toSetting () {
    return {
      data: this.toParameter(),
      path: 'rect',
      animate: {
        loading: this.loading(),
        toStatus: this.toStatus()
      }
    }
  }
}

export default ContainerContent
