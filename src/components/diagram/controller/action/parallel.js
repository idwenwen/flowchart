import { toAction } from './action'
import { eq, remove } from 'lodash'
import { each, toArray } from '../../../../tools/extension/iteration'
import Player from './player'

class Parallel extends Player {
  // list: ParallelNode[]; {action: Action | Chain | parallel, once: boolean}
  constructor (name, parallel, context, times, repeat) {
    super(name, repeat, times, context)
    this.list = []
    this.add(parallel)
  }

  setContext (newContent) {
    super.setContext(newContent)
    // 所有子动作的内容也将会设置上下文。
    each(this.list)((play) => {
      play.action.setContext(this._context)
    })
  }

  // 添加并行动作内容。
  add (para, once = false) {
    const _t = this
    if (Array.isArray(para)) {
      each(para)(function (action) {
        _t.add(action, once)
      })
    } else {
      let origin = para
      if (para instanceof Player) {
        para.setContext(this.getContext())
      } else {
        para.context = this.getContext()
        origin = toAction(para)
      }
      this.list.push({
        action: origin,
        once
      })
    }
  }

  remove (name) {
    name = toArray(name) // 没有指定名称的方法，可能将会不方便删除。
    remove(this.list, (item) => name.find((id) => eq(id, item.action.name)))
  }

  // 运行当前帧动作。
  act (...meta) {
    const _t = this
    let player = null
    return super.loading(
      (current) => {
        if (!player) {
          player = []
          each(_t.list)((act) => {
            player.push(act.act(...meta))
          })
        }
        const result = each(player)((play) => {
          return play(current)
        })
        remove(player, (_val, index) => !result[index])
        return player.length > 0
      },
      () => {
        player = null
      }
    )
  }
}

export default Parallel
// 配置转换称为实例的方法。
export function toParallel (setting) {
  return new Parallel(
    setting.name,
    setting.list,
    setting.context,
    setting.times,
    setting.repeat
  )
}
