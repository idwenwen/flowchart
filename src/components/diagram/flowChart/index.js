import { toArray } from 'lodash'
import { Exception } from '../../../tools/exception'
import { each } from '../../../tools/extension/iteration'
import CanvasPanel, { setMainCanvas } from './canvas/index'
import Components, { globalComponents } from './components'
import { linkComps } from './linking'
import { loadImages } from './loadImage'

class Chart {
  constructor (dom, role, allSinglePort = false) {
    this.flowPanel = new CanvasPanel(dom) // 全局
    setMainCanvas(this.flowPanel)
    this.role = role
    this.allSinglePort = allSinglePort
    loadImages({
      complete: require('@/icon/complete.svg'),
      disableComplete: require('@/icon/disable_complete.svg'),
      disableError: require('@/icon/disable_error.svg'),
      error: require('@/icon/error.svg'),
      multData: require('@/icon/mult_data.svg'),
      multModel: require('@/icon/mult_model.svg')
    })
  }

  addComp (type, status, disable, name, width, height, position) {
    const comp = new Components(type, status, disable, name, this.role, false, this.allSinglePort)
    comp.setflowPanel(this.flowPanel)
    comp.render(width, height, position)
  }

  // 获取当前所有组件的配置信息内容。
  getCurrentInfo () {
    const res = []
    const all = globalComponents.comps
    each(all)(function (item, key) {
      each(toArray(item))(function (val) {
        res.push(val.getComponentInfo())
      })
    })
    console.log(res)
    return res
  }

  loadInfo (config) {
    config = config || [{'name': 'reader_0', 'module': 'reader', 'status': 'success|complete', 'disable': false, 'position': ['696.00', '50.00'], 'width': 300, 'height': 60, 'dependency': {'dataOutput': [{'componentName': 'selection_0', 'from': ['data', '0'], 'to': ['data', '0']}]}}, {'name': 'selection_0', 'module': 'selection', 'status': 'running', 'disable': false, 'position': ['349.00', '210.00'], 'width': 300, 'height': 60, 'dependency': {}}]
    function getComp (type, name) {
      let res = null
      globalComponents.getValue(type, (list) => {
        each(list)(val => {
          if (val.name === name) {
            res = val
            throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
          }
        })
      })
      return res
    }
    const _t = this
    function findValue (checkname) {
      return globalComponents.find(function (item) {
        return item.name === checkname
      })
    }
    each(config)(function (comp) {
      _t.addComp(comp.module, comp.status, comp.disable, comp.name, comp.width, comp.height, comp.position)
    })
    each(config)(function (comp) {
      if (Object.keys(comp.dependency).length > 0) {
        each(comp.dependency)((link, type) => {
          each(link)(item => {
            const fromComp = getComp(comp.module, comp.name)
            const toComp = findValue(item.componentName)
            const linking = linkComps(fromComp, toComp, item.from, item.to)
            fromComp.linkOut(linking)
            toComp.linkIn(linking)
          })
        })
      }
    })
  }
}

export default Chart
