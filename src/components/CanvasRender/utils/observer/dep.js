import UUID from '../uuid/index'
import { each } from '../extension/iteration'

// 唯一ID
const DepId = new UUID()

/**
 * 记录当前observer的订阅者内容，并分发相关的内容。
 */
class Dep {
  // Watcher暂存
  static target = null;

  // uuid: string | number | symbol; 唯一标识
  // sub: Watcher[]; 订阅者集合
  constructor () {
    this.uuid = DepId.get()
    this.sub = []
  }

  /**
   * 添加新的订阅者
   * @param watcher 订阅者实例
   */
  addSub (watcher) {
    // 确定不存在当前的订阅者的时候进行添加。
    if (!this.sub.find((val) => val.uuid === watcher.uuid)) { this.sub.push(watcher) }
  }

  /**
   * 删除已经有的订阅者，通过比对的方式。
   * @param watcher 订阅者实例
   */
  remove (watcher) {
    const pos = this.sub.findIndex((val) => val.uuid === watcher.uuid)
    return pos >= 0 ? this.sub.splice(pos, 1) : void 0
  }

  /**
   * 取消所有的订阅
   */
  clear () {
    each(this.sub)((watcher) => {
      watcher.removeDep(this)
    })
    this.sub = []
  }

  /**
   * 确定订阅者与发布者之间的依赖关系
   */
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /**
   * 通知当前的发布者的更新
   */
  notify () {
    each(this.sub)((watcher) => {
      watcher.updated()
    })
  }
}

Dep.target = null
const targetStack = []

export function pushTarget (watcher) {
  targetStack.push(watcher)
  Dep.target = watcher
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

export default Dep
