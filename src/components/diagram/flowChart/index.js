import CanvasPanel from './canvas/index'
import Components from './components'

class Chart {
  constructor (dom, role, allSinglePort = false) {
    this.flowPanel = new CanvasPanel(dom) // 全局
    this.role = role
    this.allSinglePort = allSinglePort
  }

  addComp (type, status, disable, name) {
    const comp = new Components(type, status, disable, name, this.role, false, this.allSinglePort)
    comp.setParent(this.flowPanel)
    comp.render()
  }
}

export default Chart
