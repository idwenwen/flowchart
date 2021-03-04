import { each, toArray } from '../tools/extension/iteration'
import { Exception } from '../tools/exception'
import { isObject, remove, throttle } from 'lodash'
import Player from '../controller/action/player'
import { toActable } from '../controller/action/index'

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
    this.finishObser = this._deleteFinished()

    setting && this.add(setting)
  }

  add (name, func = false, once = false) {
    // 如果传递的是配置对象
    const _t = this
    if (isObject(name)) {
      // 遍历添加配置对象内容。
      each(name)(function (val, key) {
        _t.add(key, val, func)
      })
    } else {
      // 获取原有的动画列表
      const list = this.animations.get(name) || []
      func = toArray(func)
      each(func)(function (op) {
        let act = op
        if (op instanceof Player) {
          act.setContext(_t.context)
        } else {
          act = toActable(Object.assign({}, { context: _t.context }, op))
        }
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

  _operation (name, opera, running) {
    try {
      // 获取相关的动画函数
      const actions = !running ? this.animations.get(name) : this.running.get(name)
      if (!actions) {
        throw new Exception(
          'DonotExist',
          `There has no animation nameed ${name} can be dispatch`,
          Exception.level.Warn,
          false
        )
      } else {
        opera(actions)
      }
    } catch (err) {
      void 0
    }
  }

  _notifyManager (name, opera, addToRunning = false) {
    const _t = this
    this._operation(name, function (actions) {
      let willRemove = []

      // 将当前内容添加到运行列表
      if (addToRunning) {
        _t.running.set(name, actions)
      }
      // 并进行遍历执行。
      each(actions)((player, index) => {
        opera(player.action)
        addToRunning && player.once && willRemove.push(index)
      })
      if (willRemove.length > 0) {
        // 删除单次运行动画
        remove(actions, (_val, index) => willRemove.find(i => i === index))
        _t.animations.set(name, actions) // 更新当前的映射内容
      }
      _t.finishObser() // 删除运行列表中已经运行完的动作。
    }, false)
  }

  // 私有函数 TODO: 当前，单词运行动画不可控制，不可操作，应该在动画完成之后才全部删除才是。
  _notifyRunning (name, opera) {
    this._operation(name, (actions) => {
      // 并进行遍历执行。
      each(actions)((player, index) => {
        opera(player.action)
      })
    }, true)
  }

  // 删除已经完成的动作。
  _deleteFinished () {
    const _t = this
    return throttle(function () {
      each(_t.running)(function (val, key) {
        const res = remove(toArray(val), item => item.action.finished)
        _t.running.set(key, res) // 更新删除完成内容之后的数据给running列表。
      })
    }, 1000)
  }

  // 执行动画
  dispatch (name, ...meta) {
    // 运行当前动画。但是同时，
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
}

export default Animate
