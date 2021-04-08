import { toAction } from './action'
import { eq, remove } from 'lodash'
import { each, toArray } from '../../../tools/iteration'
import UUID from '../../../tools/uuid'
import Player from './player'

// 动作链的唯一标识
const chainID = new UUID((index) => `Chian_${index}`)

/**
 * 多个动作串行组成的一个动作链内容。
 * 1. 多个动作分步进行。
 * 2. 可以对动作链进行操作，并影响当前的运行动作。
 * 3. 可以添加临时一次性的动作内容，帮助特异化当前链内容。
 */
class Chain extends Player {
  // list: ChainNode[];  运行链内容。{action: Action | chain | parallel, once: boolean}
  // current: number;
  constructor (name = chainID.get().toString(), chain, context, times, repeat) {
    super(name, repeat, times, context)
    this.list = []
    this.add(chain)
  }

  // 上下文设置
  setContext (newContent) {
    super.setContext(newContent)
    // 同步单个Action的上下文环境
    each(this.list)((play) => {
      play.action.setContext(this._context)
    })
  }

  // 添加Action内容。
  add (actions, fromIndex, once = false) {
    const _t = this
    // 判定当前的加入的位置。
    let start = fromIndex
      ? fromIndex < 0
        ? 0
        : fromIndex > this.list.length
          ? this.list.length
          : fromIndex
      : this.list.length

    // 添加新的动作内容
    if (Array.isArray(actions)) {
      each(actions)(function (action, index) {
        _t.add(action, start + index)
      })
    } else {
      let origin = actions
      if (actions instanceof Player) {
        actions.setContext(this.getContext())
      } else {
        actions.context = this.getContext()
        origin = toAction(actions)
      }
      this.list.splice(start, 0, {
        action: origin, // 设置好上下文环境并转换称为Playable类型
        once: once
      })
    }
  }

  // 依据动作名称删除当前的动作内容
  remove (name) {
    name = toArray(name) // 没有指定名称的方法，可能将会不方便删除。
    remove(this.list, (item) => name.find((id) => eq(id, item.action.name)))
  }

  // 帧内容播放
  act (...meta) {
    const _t = this
    this.current = 0
    let player = null
    return super.loading(
      (current) => {
        if (!player) player = _t.list[_t.current].action.act(...meta)
        const result = player(current)
        if (!result) {
          // 如果当前的帧动作为单次动作，则运行完成之后直接删除，否则当期action游标移动一位
          if (_t.list[_t.current].once) {
            _t.list.splice(_t.current, 1)
          } else {
            _t.current += 1
            player = null
          }
        }
        // 如果当前游标移动到末尾，则表示当前的内容结束。
        if (_t.current >= _t.list.length) return false
        else return true
      },
      () => {
        _t.current = 0
        player = null
      }
    )
  }
}

export default Chain

// 设置转化为对象实例
export function toChain (setting) {
  return new Chain(
    setting.name,
    setting.list,
    setting.context,
    setting.times,
    setting.repeat
  )
}
