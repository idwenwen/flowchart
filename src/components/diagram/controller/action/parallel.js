import { toAction } from './action'
import { toArray, eq, remove } from 'lodash'
import { each } from '../../../../tools/extension/iteration'
import Player from './player'

class Parallel extends Player {
  // list: ParallelNode[]; {action: Action | Chain | parallel, once: boolean}
  constructor (name, parallel, context, times, repeat) {
    super(name, repeat, times, context)
    this.list = []
    this.add(parallel)
  }

  set context (newContent) {
    super.context = newContent
    // 所有子动作的内容也将会设置上下文。
    each(this.list)((play) => {
      play.context = this._context
    })
  }

  // 添加并行动作内容。
  add (para, once = false) {
    if (Array.isArray(para)) {
      each(para)((action) => {
        this.add(action, once)
      })
    } else {
      para.context = this.context
      this.list.push({
        action: para instanceof Player ? para : toAction(para),
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
    let player = null
    return super.loading(
      (current) => {
        if (!player) {
          player = []
          each(this.list)((act) => {
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
