import { Exception } from '../../tools/exception'
import Content from './content'
import PanelManager from '../panelManager'
import Ports from './ports'
import Diagram from '../../diagram'
import PanelOperation from '../panelManager/panelOperation'
import SubCompManager from '../subCompManager'
import { getPos } from '../utils'
import { getMainCanvas, linkingFail, setChoosen } from '../canvas'
import { flatten, remove } from 'lodash'
import { toArray, each } from '../../tools/extension/iteration'
import SubIcon from '../subCompManager/typeIcon'
import { icons } from '../loadImage'
import MovingIcon from '../subCompManager/movingIcon'

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
  const res = [comp.name]
  each(comp.into)(val => {
    each(toArray(val))((item) => {
      res.push(item.from.name)
      res.push(...checkLinking(item.from))
    })
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
    const count = this.comps.get(type) ? this.comps.get(type).length : 0
    return `${type}_${count}`
  }

  set (type, comp) {
    const origin = this.comps.get(type) || []
    origin.push(comp)
    this.comps.set(type, origin)
  }

  get (type) {
    return this.comps.get(type)
  }

  getValue (name, operation) {
    return operation && operation(toArray(this.get(name)))
  }

  find (operation) {
    let find = false
    each(this.comps)(val => {
      each(toArray(val))(item => {
        if (operation(item)) {
          find = item
          throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
        }
      })
      if (find) {
        throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
      }
    })
    return find
  }

  delete (type, name) {
    let origin = this.comps.get(type)
    remove(origin, (item) => item.name === name)
    this.comps.set(type, origin)
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

    this.firstTimeToStatus = status
    this.status = this.matchStatus('unrun')
    this.role = this.matchRole(role)

    this.disable = disable
    this.choosed = choosed

    this.allSingleType = allSingleType
    this.panelManager = null
    this.into = {} // 连接进入Linking[]，相关内容为接口Figure对象。
    this.outto = {} // 连接输出Linking[]，相关内容为接口Figure对象。
    this.subConnect = new SubCompManager()
    this.checkedLinkFrom = false
    globalComponents.set(type, this)

    // 当前组件状态记录
    this.isChoosing = false // 是否被选中的状态
    this.choosePoisiton = null
    this.currentPort = null
    this.accordingToWholePos = null
    this.isMoveing = false // 当前正在移动状态
    this.saved = false

    this.flowPanel = null
  }

  getComponentInfo () {
    const res = {
      name: this.name,
      module: this.type,
      status: this.status,
      disable: this.disable,
      position: (() => {
        const origin = this.panelManager.attrs.point
        const width = this.panelManager.attrs.width
        const height = this.panelManager.attrs.height
        return [
          (origin[0] + width / 2).toFixed(2),
          (origin[1] + height / 2).toFixed(2)
        ]
      })(),
      width: this.panelManager.attrs.width,
      height: this.panelManager.attrs.height
    }
    const dependency = {}
    if (Object.keys(this.outto).length > 0) {
      each(this.outto)(function (linkings, type) {
        dependency[type] = []
        each(linkings)(function (link) {
          dependency[type].push({
            componentName: link.end.name,
            from: (() => {
              const origin = link.fromPort.name.split('_')[0]
              return origin.split('|')
            })(),
            to: (() => {
              const origin = link.endPort.name.split('_')[0]
              return origin.split('|')
            })()
          })
        })
      })
    }
    res.dependency = dependency
    return res
  }

  setflowPanel (panel) {
    this.flowPanel = panel
    if (this.panelManager) {
      this.flowPanel.append(this.panelManager.domContainer)
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
    const _t = this
    return {
      isSaving () {
        _t.saved = false
        this.saved = false
      },
      hasSave () {
        _t.saved = true
        this.saved = true
      },
      choose () {
        _t.choosed = true
        this.choosed = true
      },
      unchoose () {
        _t.choosed = false
        this.choosed = false
      },
      disable () {
        _t.disable = true
        this.disable = true
      },
      able () {
        _t.disable = false
        this.disable = false
      },
      toStatus (status) {
        if (_t.status === ComponentsStatus.running) {
          _t.diagram.animationFinish('loading')
        }
        _t.status = status
        this.status = status
        if (status === ComponentsStatus.running) {
          _t.diagram.animateDispatch('loading')
        }
        let type = null
        if (this.status === ComponentsStatus.fail) {
          type = this.disable ? 'disableError' : 'error'
        } else if (this.status === ComponentsStatus.success) {
          type = this.disable ? 'disableComplete' : 'complete'
        }
        if (type) {
          _t.addStatusIcon(type)
        }
      },
      changeStatus (status) {
        const newStatus = _t.matchStatus(status)
        _t.diagram.animateDispatch('toStatus', newStatus)
      }
    }
  }

  toSetting () {
    const _t = this
    this.borderContent = new Content(this)
    this.borderPorts = new Ports(this.type, this.allSingleType, this.role, this)
    return {
      data: {
        name () {
          return _t.name
        },
        saved () {
          return _t.saved
        },
        width () {
          return parseFloat(this.attrs.width) - 10 * 2
        },
        height () {
          let portW = parseFloat(this.attrs.width) * 0.02
          portW = (portW < 12 ? 12 : portW) + 1
          return parseFloat(this.attrs.height) - portW * 2
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
        choosed () {
          return _t.choosed
        },
        status () {
          return _t.status
        },
        disable () {
          return _t.disable
        },
        center () {
          return [
            parseFloat(this.attrs.width) / 2,
            parseFloat(this.attrs.height) / 2
          ]
        }
      },
      events: this.toEvents(),
      children: [
        this.borderContent.toSetting(),
        this.borderPorts.toSetting()
      ]
    }
  }

  toSettingTree (width, height, point) {
    const _t = this
    let inPath = null
    let lastPoint = null
    const panel = new PanelManager().toSetting(width, height, point)
    panel.events = {
      'mousedown': function (eve) {
        _t.isChoosing = true
        _t.currentPort = null
        _t.isMoveing = false
        _t.choosePoisiton = getPos(eve)
        _t.accordingToWholePos = getPos(eve, getMainCanvas().container)
        eve.stopPropagation()
      },
      'mousemove': function (eve) {
        const pos = getPos(eve)
        if (_t.isChoosing && (pos[0] !== _t.choosePoisiton[0] || pos[1] !== _t.choosePoisiton[1])) {
          const posForWhole = getPos(eve, getMainCanvas().container)
          // 坐标不同表示移动了。
          _t.isMoveing = true
          // 判定当前是否有连出操作
          if (!_t.checkedLinkFrom) {
            _t.diagram.dispatchEvents('linkFrom', eve, _t.choosePoisiton, _t.accordingToWholePos, posForWhole)
            _t.checkedLinkFrom = true
          }
          if (_t.currentPort === false) {
            // 移动当前的组件展示位置。
            if (inPath === null) inPath = _t.diagram.isPointInFigure(_t.choosePoisiton)
            if (inPath) {
              if (!lastPoint) lastPoint = _t.accordingToWholePos
              // 计算当前panel的移动。
              const xDistance = posForWhole[0] - lastPoint[0]
              const yDistance = posForWhole[1] - lastPoint[1]
              const origin = _t.panelManager.attrs.point
              _t.panelManager.attrs.point = [
                origin[0] + xDistance,
                origin[1] + yDistance
              ]
              lastPoint = posForWhole
              _t.addMovingIcon()
              // 通知所有的linking修改相关的数值内容。
              each(_t.outto)(function (val) {
                each(val)(function (item) {
                  item.translateStart(xDistance, yDistance)
                })
              })
              each(_t.into)(function (val) {
                each(val)(function (item) {
                  item.translateEnd(xDistance, yDistance)
                })
              })
            }
          }
        }
      },
      'mouseup': function (eve) {
        // 表示鼠标在当前component之中放开的情况。
        eve.stopPropagation()
        if (_t.currentPort) {
          linkingFail()
        }
        _t.isChoosing = false
        _t.currentPort = null
        _t.choosePoisiton = null
        _t.checkedLinkFrom = false
        lastPoint = null
        inPath = null
      },
      'mouseout': function () {
        _t.isChoosing = false
        _t.checkedLinkFrom = false
        lastPoint = null
        inPath = null
      },
      'click': function (eve) {
        if (!_t.isMoveing && this.diagram.isPointInFigure(getPos(eve))) {
          setChoosen(_t)
        }
        _t.isMoveing = false
        _t.removeStatusIcon('movingIcon')
      }
    }
    return panel
  }

  clickedUpper (eve) {
    if (this.diagram.isPointInFigure(getPos(eve))) {
      setChoosen(this)
    }
  }

  linkOut (Linking) {
    const fromPort = Linking.fromPort
    this.outto[fromPort.type] = this.outto[fromPort.type] || []
    const index = this.outto[fromPort.type].findIndex(item => item.uuid === Linking.uuid)
    if (index < 0) {
      this.outto[fromPort.type].push(Linking)
    }
  }

  deleteLinkOut (type, link) {
    if (this.outto) {
      const list = this.outto[type]
      remove(list, (props) => props.uuid === link.uuid)
      if (list.length === 0) {
        delete this.outto[type]
      }
    }
  }

  linkIn (Linking) {
    const endPort = Linking.endPort
    this.into[endPort.type] = this.into[endPort.type] || []
    const index = this.into[endPort.type].findIndex(item => item.uuid === Linking.uuid)
    if (index < 0) {
      this.into[endPort.type].push(Linking)
    }
  }

  deleteLinkIn (type, link) {
    if (this.into) {
      const list = this.into[type]
      remove(list, (props) => props.uuid === link.uuid)
      if (list.length === 0) {
        delete this.into[type]
      }
    }
  }

  render (width, height, point) {
    const panelSetting = this.toSettingTree(width, height, point)
    const diagramSetting = this.toSetting()
    this.diagram = new Diagram(panelSetting, diagramSetting)
    this.panelManager = this.diagram.panel
    if (this.flowPanel) {
      this.flowPanel.append(this.panelManager.domContainer)
    }
    this.diagram.dispatchEvents('changeStatus', this.firstTimeToStatus)
  }

  checkHint (eve, type) {
    // 获取关联关系check哪一些是可以进行连接测试的，哪一些不行
    // 通过全局component判断剩余组件是否可以触发portHint事件。
    const notHint = checkLinking(this)
    each(globalComponents.comps)((val, key) => {
      each(val)(item => {
        if (!notHint.find(eachitem => eachitem === item.name)) {
          // val.diagram.animateDispatch('linkHint', type)
          item.diagram.dispatchEvents('linkHint', eve, type)
        }
      })
    })
  }

  hintFinished () {
    // 表示当前的提示阶段已经结束。
    // 结束所有的hint内容。
    checkLinking(this)
  }

  choose () {
    this.diagram.dispatchEvents('choose')
  }

  unchoose () {
    this.diagram.dispatchEvents('unchoose')
  }

  deleteComponent () {
    each(this.outto)(function (val, key) {
      while (val.length > 0) {
        val.deleteComponent()
      }
    })
    each(this.into)(function (val, key) {
      while (val.length > 0) {
        val.deleteComponent()
      }
    })
    this.outto = {}
    this.into = {}
    getMainCanvas().container.removeChild(this.panelManager.domContainer)
    this.panelManager = null
    this.diagram.clearTree && this.diagram.clearTree()
    globalComponents.delete(this.type, this.name)
  }

  addStatusIcon (type) {
    const key = 'statusIcon'
    this.removeStatusIcon(key)
    const width = this.panelManager.attrs.width
    const height = this.panelManager.attrs.height
    const iconPos = [
      width,
      height / 2
    ]
    this.subConnect.add(
      key, new SubIcon(this, 25, 25, iconPos, icons[type])
    )
  }

  removeStatusIcon (key) {
    this.subConnect.remove(key)
  }

  addMovingIcon () {
    const key = 'movingIcon'
    this.removeStatusIcon(key)
    const width = this.panelManager.attrs.width
    const iconPos = [
      width / 2,
      -10
    ]
    this.subConnect.add(
      key, new MovingIcon(this, 35, 35, iconPos)
    )
  }
}

export default Components
