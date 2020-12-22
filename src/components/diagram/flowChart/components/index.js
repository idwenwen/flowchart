import { each, Exception } from '@cc/tools'
import { config } from './config'
import Content from './content'
import PanelManager from '../panelManager'
import Ports from './ports'
import Diagram from '../../diagram'
import PanelOperation from '../panelManager/panelOperation'
import SubCompManager from '../subCompManager'
import { getPos } from '../utils'
import { getCurrentLink, linkingFail } from '../canvas'
import { flatten } from 'lodash'

// 组件状态
export const ComponentsStatus = {
  unrun: 'unrun|waiting',
  running: 'running',
  fail: 'failed|error|canceled',
  success: 'success|complete'
}

export const Role = {
  Guest: 'guest',
  Host: 'host',
  Arbit: 'arbit'
}

function checkLinking (comp) {
  const res = []
  each(comp.into)(val => {
    const res = []
    res.push(val.from.name)
    res.push(...checkLinking(val.from))
  })
  return Array.from(new Set(flatten(res)))
}

class GlobalComponentsManage {
  // comps: Mapping<string, Components>;
  // count: object;
  constructor () {
    this.comps = new Map()
  }

  getDefaultName (type) {
    const count = this.count[type] || 0
    this.count[type] = count + 1
    return `${type}_${count}`
  }

  set (type, comp) {
    this.comps.set(type, comp)
  }

  get (name) {
    return this.comps.get(name)
  }
}

export const globalComponents = new GlobalComponentsManage()

class Components extends PanelOperation {
  // name: string; // 当前组件的名称
  // type: string; // 组件类型
  // status: ComponentsStatus;
  // disable: boolean; //当前组件是否运行
  // role: Role; // 当前组件展示的角色方
  // choosed: boolean; // 组件被选取的状态

  // allSingleType: boolean; // 组件单端口设置

  // panelManager: Panel;
  // diagram: Diagram
  constructor (
    type, // 组件类型
    status, // 当前组件的状态
    disable, // 当前组件是否是不需要运行的。

    name, // 当前组件名称
    role, // 当前组件针对的角色
    choosed = false, // 当前组件是否被选择

    allSingleType = false
  ) {
    super()
    this.name = name || globalComponents.getDefaultName(type)
    this.type = type

    this.status = this.matchStatus(status)
    this.role = this.matchRole(role)

    this.disable = disable
    this.choosed = choosed

    this.allSingleType = allSingleType
    this.panelManager = null
    this.into = new Map() // 连接进入Linking[]，相关内容为接口Figure对象。
    this.outto = new Map() // 连接输出Linking[]，相关内容为接口Figure对象。
    this.subConnect = new SubCompManager()
    globalComponents.set(this.type, this)

    // 当前组件状态记录
    this.isChoosing = false // 是否被选中的状态
    this.choosePoisiton = null
    this.currentPort = null
    this.isMoveing = false // 当前正在移动状态

    this.flowPanel = null
  }

  flowPanel (panel) {
    this.flowPanel = panel
    if (this.panelManager) {
      this.flowPanel.addComp(this.panelManager.dom)
    }
  }

  // 判定当前的展示状态
  matchStatus (status) {
    status = status.toLowerCase()
    let res
    each(ComponentsStatus)((val, key) => {
      if (val.search(status) >= 0) {
        res = key
        throw new Exception(
          'Breaking',
          'Breaking from iteration',
          Exception.level.Info,
          false
        )
      }
    })
    return ComponentsStatus[res]
  }
  // 匹配当前的用户内容
  matchRole (role) {
    role = role.toLowerCase()
    let res
    each(Role)((val, key) => {
      if (val.search(role) >= 0) {
        res = key
        throw new Exception(
          'Breaking',
          'Breaking from iteration',
          Exception.level.Info,
          false
        )
      }
    })
    return Role[res]
  }

  toEvents () {
    return {
      choose: {
        variation: () => { this.choosed = true },
        time: 0
      },
      disable: {
        variation: () => { this.disable = true },
        time: 0
      },
      able: {
        variation: () => { this.disable = false },
        time: 0
      },
      toStatus: {
        variation: (progress, status) => {
          if (progress >= 1) {
            this.status = status
            // 依据当前的运行状态判定是否添加相关的辅助组件。
          }
        },
        time: 600
      }
    }
  }

  toSetting () {
    return {
      parameter: {
        name: this.name,
        width () {
          return parseFloat(this.attrs.width) * (1 - config.panelBorder)
        },
        height () {
          return parseFloat(this.attrs.height) * (1 - config.panelBorder)
        },
        radius () {
          const times = 0.005
          const minRadius = 2
          const maxRadius = 20
          const width = parseFloat(this.attrs.width)
          let radius = width * times
          radius =
            radius < minRadius
              ? minRadius
              : radius > maxRadius
                ? maxRadius
                : radius
          return radius
        },
        choosed: this.choosed,
        status: this.status,
        disable: this.disable,
        center () {
          return [
            parseFloat(this.attrs.width) / 2,
            parseFloat(this.attrs.height) / 2
          ]
        }
      },
      children: [
        new Content(this).toSetting(),
        new Ports(this.type, this.allSingleType, this.role, this).toSetting()
      ]
    }
  }

  toSettingTree (width, height, point) {
    const _t = this
    let inPath = null
    let lastPoint = null
    let checkedLinkFrom = false
    const panel = new PanelManager().toSetting(width, height, point)
    panel.events = {
      'mousedown': (eve) => {
        _t.isChoosing = true
        _t.currentPort = null
        _t.isMoveing = false
        _t.choosePoisiton = getPos(eve)
        eve.stopPropagation()
      },
      'mouseMoving': (eve) => {
        const pos = getPos(eve)
        if (_t.isChoosing && (pos[0] !== _t.choosePoisiton[0] || pos[1] !== _t.choosePoisiton[1])) {
          // 坐标不同表示移动了。
          _t.isMoving = true
          // 判定当前是否有连出操作
          if (!checkedLinkFrom) {
            _t.diagram.animateDispatch('linkFrom', _t.choosePoisiton, pos)
            checkedLinkFrom = true
          }
          if (!_t.currentPort) {
            // 移动当前的组件展示位置。
            if (inPath === null) inPath = _t.diagram.isPointInFigure(_t.choosePoisiton)
            if (inPath) {
              if (!lastPoint) lastPoint = _t.choosePoisiton
              // 计算当前panel的移动。
              _t.panelManager.translate(pos[0] - lastPoint[0], pos[1] - lastPoint[1])
              lastPoint = pos
              // 通知所有的linking修改相关的数值内容。
            }
          }
        }
      },
      'mouseup': (eve) => {
        // 表示鼠标在当前component之中放开的情况。
        eve.stopPropagation()
        if (_t.currentPort) {
          linkingFail()
        } else if (getCurrentLink()) {
          // 如果连线连接到当前的组件之中, 触发当前的hint之中的事件
          _t.diagram.animateDispatch('linkInto', getPos(eve))
        }
        _t.isChoosing = false
        _t.currentPort = null
        _t.choosePoisiton = null
        checkedLinkFrom = false
        lastPoint = null
        inPath = null
      },
      'mouseout': () => {
        lastPoint = null
        inPath = null
      },
      'click': (eve) => {
        if (!_t.isMoveing && this.isPointInFigure(getPos(eve))) {
          _t.choosed = true
        }
        this.isMoveing = false
      }
    }
    return panel
  }

  linkOut (Linking) {
    const index = this.outto.findIndex(item => item.uuid === Linking.uuid)
    if (index < 0) {
      this.outto.push(Linking)
    }
  }

  linkIn (Linking) {
    const index = this.into.findIndex(item => item.uuid === Linking.uuid)
    if (index < 0) {
      this.into.push(Linking)
    }
  }

  render (width, height, point) {
    const panelSetting = this.toSettingTree(width, height, point)
    const diagramSetting = this.toSetting()
    this.diagram = new Diagram(panelSetting, diagramSetting)
    this.panelManager = this.diagram.panel
    if (this.flowPanel) {
      this.flowPanel.addComp(this.panelManager.dom)
    }
  }

  checkHint (type) {
    // 获取关联关系check哪一些是可以进行连接测试的，哪一些不行
    // 通过全局component判断剩余组件是否可以触发portHint事件。
    const notHint = checkLinking(this)
    each(globalComponents.comps)((val, key) => {
      if (!notHint.find(item => item === val.name)) {
        val.diagram.animateDispatch('linkHint', type)
      }
    })
  }

  hintFinished () {
    // 表示当前的提示阶段已经结束。
    // 结束所有的hint内容。
    const notHint = checkLinking(this)
    each(globalComponents.comps)((val, key) => {
      if (!notHint.find(item => item === val.name)) {
        val.diagram.animateDispatch('linkHide')
      }
    })
  }
}

export default Components
