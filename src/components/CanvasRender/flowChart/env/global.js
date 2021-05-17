import { record } from '../../tools/exception'
import Component from '../content'
import Linking from '../linking'
import { compareToPos } from '../utils'
import Choosen from './choosen'
import { EventEmitter } from './eventEmitter'
import Icons from './icon'
import LinkingManager from './linking'
import Moving from './moving'
import BackendPanel from './panel'

export class Global extends EventEmitter {
  constructor () {
    super()
    this.choosen = new Choosen(this)
    this.linking = new LinkingManager()
    this.moving = new Moving()

    this.globalIcons = new Icons()
    this.globalComp = new Map()
    this.globalLinking = new Map()
    this.globalHint = new Map()

    // 全局dom内容
    this.globalPanel = new BackendPanel()
  }

  registerComp (id, comp) {
    this.globalComp.set(id, comp)
  }
  registerLinking (id, comp) {
    this.globalLinking.set(id, comp)
  }
  registerHint (id, comp) {
    this.globalHint.set(id, comp)
  }

  removeComp (id) {
    this.globalComp.delete(id)
  }
  removeLinking (id) {
    this.globalLinking.delete(id)
  }
  removeHint (id) {
    this.globalHint.delete(id)
  }
  clearHint () {
    for (const val of this.globalHint) {
      val[1].clearUp()
    }
  }

  // 比对当前所有属性内容是否是
  positionInHint (position) {
    for (const val of this.globalHint) {
      const port = val[1].linkInto(
        compareToPos(position, GLOBAL.globalPanel.getOrigin(), val[1].panel.getOrigin())
      )
      if (port) {
        return port
      }
    }
    return false
  }

  // 创建当前的可用连线
  createLinking (startPoint, endPoint, port) {
    const l = new Linking(startPoint, endPoint)
    let list = port.root().getConnection()
    const nextLevel = port.root().getNextLevel(port.type.match(/data/i) ? 'data' : 'model')
    list = list.concat(...nextLevel)
    // 开始连接
    this.dispatch('linkStart')
    l.linkStart() // 创建连线。
    this.createLinkHint(list, port.type)
    this.linking.link(l) // 设置当前的连线信息
    if (port.type.match(/output/i)) { // 当前端口是否是输出端口
      this.linking.from(port)
      l.from = port
    } else {
      this.linking.into(port)
      l.end = port
    }
  }
  // 创建连接。
  createConnection (position, port) {
    const l = this.linking.linking
    if (!l) {
      return void 0
    }
    // 确定当前可以连接的linking
    if (!port) {
      port = this.positionInHint(position)
    }
    if (!port) {
      l.clearUp()
      this.linking.clear()
      this.clearHint()
      // 连接失败
      this.dispatch('linkFailed')
      return void 0
    }

    // 连接成功的时候最后一次变更连线位置
    l.changing(port.currentPosition(this.globalPanel.getOrigin()))

    // 当前端口是否是输出端口
    if (port.type.match(/output/i)) {
      this.linking.from(port)
      l.from = port // 设置linking自身的启始或结束内容
    } else {
      this.linking.into(port)
      l.end = port
    }

    // 通知当前相关port的内容设置。
    l.from.linkOut(l)
    l.end.linkInto(l)
    l.linkEnd()

    // 清除当前可连接提示
    this.clearHint()
    this.linking.clear()

    // 连接成功
    this.dispatch('linkSuccessd', l)
  }
  createConnectionDir (startPos, endPos, from, end) {
    // 直接连线当前内容。
    const l = new Linking(startPos, endPos, from, end)
    from.linkOut(l)
    end.linkInto(l)
    l.linkEnd()
  }
  // 创建连接关联提示符。
  createLinkHint (list, type) {
    for (const val of this.globalComp) {
      val[1].checkHintForPort(list, type)
    }
  }

  // 添加组件信息内容
  appendComp (compSetting, trigger = true) {
    if (trigger) this.dispatch('beforeAddCompnent')
    const comp = new Component(compSetting)
    if (trigger) this.dispatch('afterAddComponent', comp)
    return comp
  }
  appendComps (compSettings) {
    this.dispatch('beforeAddComponents')
    for (const val of compSettings) {
      this.appendComp(val, false)
    }
    this.dispatch('afterAddComponents')
  }
  // 删除组件内容
  deleteComp (id, trigger = true, choosen) {
    let comp = id
    if (!comp.toString().match('object')) {
      comp = this.globalComp.get(id)
    }
    if (comp) {
      if (trigger) this.dispatch('beforeDeleteComponent', id, choosen)
      comp.clearUp()
      if (trigger) this.dispatch('afterDeleteComponent', id, choosen)
    }
  }
  deleteComps (ids) {
    this.dispatch('beforeDeleteComponents')
    for (const val of ids) {
      this.deleteComp(val, false)
    }
    this.dispatch('afterDeleteComponents')
  }

  deleteLink (link) {
    this.dispatch('beforeDeleteLink')
    let res = link
    if (!(link instanceof Linking)) {
      res = this.globalLinking.get('link')
    }
    if (res) {
      res.clearUp()
    }
    this.dispatch('afterDeleteLink', link)
  }

  // 设置ICON信息
  setIcons (setting) {
    this.globalIcons.loadImages(setting)
  }
  // 获取ICON内容
  getIcon (type) {
    return this.globalIcons.getIcon(type)
  }

  // 设置父类信息
  setParent (parent) {
    this.globalPanel.setParent(parent)
  }

  // 判定当前坐标点是属于哪一个组件或者连线的。
  belongTo (pos) {
    const checking = (map) => {
      for (const val of map) {
        if (val[1].figure.isPointInFigure(
          compareToPos(pos, GLOBAL.globalPanel.getOrigin(), val[1].panel.getOrigin())
        )) {
          return val[1]
        }
      }
      return false
    }
    let comp = checking(this.globalComp)
    if (comp) return comp
    comp = checking(this.globalLinking)
    if (comp) return comp
  }

  // 修改特定的组件的状态。
  changeStatusForComp (id, status, trigger = true) {
    const comp = this.globalComp.get(id)
    if (comp) {
      if (trigger) this.dispatch('beforeComponentChangeStatus', comp)
      comp.changeStatus(status)
      if (trigger) this.dispatch('afterComponentChangeStatus', comp)
    }
  }
  // 为多个组件修改状态。
  changeStatusForComps (setting) {
    this.dispatch('beforeCompoentsChangeStatus')
    for (const key in setting) {
      this.changeStatusForComp(key, setting[key], false)
    }
    this.dispatch('afterCompoentsChangeStatus', this.globalComp)
  }
  // 清除当前画布上面的内容
  clearCanvas () {
    for (const val of this.globalComp) {
      val[1].clearUp()
    }
    for (const val of this.globalLinking) {
      val[1].clearUp()
    }
  }
  // 获取当前的组件信息
  getInformation () {
    const list = []
    // 所有comp内容的获取。
    for (const val of this.globalComp) {
      list.push(val[1].getInformation())
    }
    // 遍历所有linking内容。
    for (const item of this.globalLinking) {
      // 添加linking内容
      const output = item[1].from.type.match(/data/) ? 'data' : 'model'
      const fromId = item[1].from.root()
      const endId = item[1].end.root()
      const compInfo = list.find((val) => val.id === fromId.id) // list之中查找到相关的组件内容。
      if (!compInfo.dependency) compInfo.dependency = {}
      if (!compInfo.dependency[output + 'Output']) compInfo.dependency[output + 'Output'] = []
      compInfo.dependency[output + 'Output'].push({
        componentName: item[1].end.root().name,
        componentId: endId.id,
        from: [output, item[1].from.getWhichPort().toString()],
        to: [output, item[1].end.getWhichPort().toString()]
      })
      compInfo[`${output}Output_count`] += 1
    }
    return list
  }
  // 依据配置添加组件内容
  setInformation (setting) {
    try {
      this.appendComps(setting)
      for (const val of setting) {
        const dep = val.dependency
        // 获取上层组件内容
        const fromComp = this.globalComp.get(val.id)

        // 如果有相关依赖表示有连接出现
        if (dep) {
          const list = []
          if (dep.dataOutput) list.push(...dep.dataOutput)
          if (dep.modelOutput) list.push(...dep.modelOutput)
          for (const dataO of list) {
            // 获取下层组件
            const endComp = this.globalComp.get(dataO.componentId)
            if (!endComp) {
              record('DoNotExistException',
                'There has no component named ' + dataO.componentName)
            }
            // 获取相关的两个port信息
            const endPort = endComp.getPort(parseInt(dataO.to[1]), dataO.to[0], false)
            const fromPort = fromComp.getPort(parseInt(dataO.from[1]), dataO.from[0], true)
            const startPos = fromPort.currentPosition(this.globalPanel.getOrigin())
            const endPos = endPort.currentPosition(this.globalPanel.getOrigin())
            this.createConnectionDir(startPos, endPos, fromPort, endPort)
          }
        }
      }
    } catch (err) {
      void 0
    }
  }
  // 重新构建当前图片内容。
  rebuild (setting) {
    this.clearCanvas()
    // 清除已有的文件内容
    Component.NamePool.clearRecord()
    this.setInformation(setting)
  }
  // 选择API
  choosing (comp) {
    this.choosen.choose(comp)
  }
}

let GLOBAL = new Global()

export default GLOBAL
