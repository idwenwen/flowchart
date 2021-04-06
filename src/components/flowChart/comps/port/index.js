import { each } from '../../../tools/extension/iteration'
import { getPortConfig } from './portConfig'

export default class Ports {
  constructor (type, allSingleMode = false, role) {
    this.container = container
    const _t = this
    each(ports)((ports, key) => {
      _t[key] = each(ports)((port) => {
        return new Port(port.name, port.type, port.tip, port.multiple, role, _t.container)
      })
    })
  }

  // 获取相关端口配置
  getPorts (type, single = false) {
    return getPortConfig(type, single)
  }

  createPortNode (config) {

  }
}
