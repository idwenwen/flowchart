import { ComponentsStatus } from '..'
import { toChain } from '../../../core/controller/action'
import Action from '../../../core/controller/action/action'
import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import { CHOOSE, COULDNOTRUN, DISABLE_PROGRESS, ERROR, PROGRESS, SUCCESS, UNRUN } from './config'

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

export default class ContentBody extends Tree {
  constructor () {
    super()
    this.figure = null
    this.progressing = 1
    this.toRender()
  }

  // 加载读条动画。
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

  // 状态修改动画
  changeStatus () {
    const _t = this
    let originProgress, originColor
    return toChain({
      list: [
        {
          variation (progress, status) {
            if (!originProgress) originProgress = this.progress
            if (!originColor) originColor = this.color
            const progressRes = originProgress + (1 - originProgress) * progress
            this.progress = progress >= 1 ? 1 : progressRes
            if (progress >= 1) _t.progressing = 1
            const target = contentColor(this.choose, status, this.disable)
            this.color = Action.get('color')(progress, originColor, target)
          },
          time: 500
        },
        {
          variation (_progress, status) {
            originProgress = null
            originColor = null
            this.origin.root().dispatchEvents('endChangeStatus', status)
          },
          time: 0
        }
      ]
    })
  }

  getParameter () {
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
        return contentColor(this.choose, this.status, this.disable)
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

  toRender () {
    this.figure = toFigure({
      data: this.getParameter(),
      path: 'rect',
      animate: {
        loading: this.loading(),
        changeStatus: this.changeStatus()
      }
    })
    return this.figure
  }
}
