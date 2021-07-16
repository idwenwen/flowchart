import { each, toArray } from '../../tools/iteration'
import { isObject, remove } from 'lodash'
import Player from '../controller/action/player'
import { toActable } from '../controller/action/index'
import { record } from '../../tools/exception'

export const AnimationOperation = {
  Dispatch: 'dispatch',
  Pause: 'pause',
  Continue: 'continue',
  Finish: 'finish',
  End: 'end',
  Times: 'times',
  Repeat: 'repeat'
}

class Animate {
  // context: any;  动画的上下文环境。
  // animations: Mapping<string, AnimateNode[]>;  相关动画内容

  constructor (context, setting) {
    this.context = context // 动画播放时的全局上下文。
    this.animations = new Map() // 全部种类的animation内容。

    this.running = new Map() // 当前正在运行的动画。
    setting && this.add(setting)
  }

  /**
   * 添加新的动画内容
   * @param {String | Object} name 动画名称或者多个动画的配置对象
   * @param {Function} func 动画函数
   * @param {Boolean} once 动画是否只运行一次
   */
  add (name, func = false, once = false) {
    // 如果传递的是配置对象
    const _t = this

    // 当前内容为多个动画的配置对象
    if (isObject(name)) {
      // 遍历添加配置对象内容。
      each(name)(function (val, key) {
        _t.add(key, val, func)
      })
    } else {
      // 获取原有的动画列表
      const list = this.animations.get(name) || []
      func = toArray(func)

      // 遍历新增内容。
      each(func)(function (op) {
        let act = op
        // 判定是player对象还是配置对象。
        if (op instanceof Player) {
          act.setContext(_t.context)
        } else {
          // 转化成为actable对象内容。
          act = toActable(Object.assign({}, { context: _t.context }, op))
        }
        // 添加到list列表
        list.push({
          // 传递的内容为Player的实例，或者可以转变成实例的配置文件，具体配置见controller/action/index
          action: act,
          once
        })
      })
      this.animations.set(name, list)
    }
  }

  // 删除animate实例管理的动画。
  remove (name) {
    const _t = this
    name = toArray(name)
    each(name)(function (type) {
      _t.animations.delete(type)
    })
  }

  // 动画对象的操作
  _operation (name, opera, running) {
    // 获取actio对象
    try {
      const actions = !running ? this.animations.get(name) : this.running.get(name)
      if (!actions) {
        record('DonotExist',
          `There has no animation nameed ${name} can be dispatch`)
      } else {
        opera(actions)
      }
    } catch (err) {
      void 0
    }
  }

  // 节点动画的信息通知。
  _notifyManager (name, opera, addToRunning = false) {
    const _t = this

    this._operation(name, function (actions) {
      let willRemove = []
      // 删除运行列表中已经运行完的动作。
      _t._deleteFinished()

      if (!_t.running.get(name)) {
      // 将当前内容添加到运行列表
        if (addToRunning) {
          _t.running.set(name, actions)
        }
        // 并进行遍历执行opera方法。
        each(actions)((player, index) => {
          opera(player.action)
          addToRunning && player.once && willRemove.push(index)
        })

        // 确定当前是否有待删除的内容，一次性调用函数
        if (willRemove.length > 0) {
        // 删除单次运行动画
          remove(actions, (_val, index) => willRemove.find(i => i === index))
          _t.animations.set(name, actions) // 更新当前的映射内容
        }
      }
    }, false)
  }

  // 通知相关的在运行动作对象。
  _notifyRunning (name, opera) {
    this._operation(name, (actions) => {
      // 并进行遍历执行。
      each(actions)((player) => {
        opera(player.action)
      })
    }, true)
  }

  // 删除已经完成的动作。
  _deleteFinished () {
    const _t = this
    // 判定当前的action是否已经完成了，如果完成则删除running列表之中的内容
    each(_t.running)(function (val, key) {
      const res = remove(toArray(val), item => !item.action.finished)
      if (res.length !== 0) {
        _t.running.set(key, res) // 更新删除完成内容之后的数据给running列表。
      } else {
        _t.running.delete(key)
      }
    })
  }

  // 执行动画
  dispatch (name, ...meta) {
    // 运行当前动画。但是同时
    this._notifyManager(
      name,
      player => {
        player.start(...meta) // 当前动画开始。
      },
      true
    )
  }

  // 动画倍数播放
  times (name, t = 1) {
    this._notifyManager(name, act => {
      act.multiple(t)
    })
    this._notifyRunning(name, act => {
      act.multiple(t)
    })
  }

  // 动画重复播放
  repeat (name, rep = false) {
    this._notifyManager(name, act => {
      act.repeat = rep
    })
    this._notifyRunning(name, act => {
      act.repeat = rep
    })
  }

  // 动画暂停
  pause (name) {
    this._notifyRunning(name, act => {
      act.pause()
    })
  }

  // 动画继续
  continue (name) {
    this._notifyRunning(name, act => {
      act.continue()
    })
  }

  // 动画快速完成
  finish (name) {
    this._notifyRunning(name, act => {
      act.finish()
    })
  }

  // 动画马上结束
  end (name) {
    this._notifyRunning(name, act => {
      act.end()
    })
  }

  release () {
    this.context = null
    const runningList = this.running.keys()
    for (const val of runningList) {
      this.end(val)
    }
    this.animations.clear()
    this.running.clear()
  }
}

export default Animate
