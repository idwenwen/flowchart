import { each } from '@/tools/extension/iteration'
// import { config } from '../config'
import Port from './port'
import { portConfig } from './portConfig'

export const portType = {
  DataInput: 'dataInput',
  DataOutput: 'dataOutput',
  ModelInput: 'modelInput',
  ModelOutput: 'modelOutput'
}

class Ports {
  // dataInput: Port[]; // 输入口
  // dataOutput
  // modelInput: Port[]; // 输出口
  // modelOutput
  constructor (type, allSingleMode = false, role, container) {
    const ports = portConfig(type, allSingleMode)
    this.container = container
    const _t = this
    each(ports)((ports, key) => {
      _t[key] = each(ports)((port) => {
        return new Port(port.name, port.type, port.tip, port.multiple, role, _t.container)
      })
    })
  }

  getParameter () {
    return {
      radius: function () {
        return this.radius
      },
      width: function () {
        const times = 0.02
        const min = 12
        let width = this.width * times
        width = width < min ? min : width
        return width
      },
      compWidth: function () {
        return this.width
      },
      height: function () {
        const times = 0.01
        const min = 4
        let width = this.width * times
        width = width < min ? min : width
        return width
      },
      compHeight: function () {
        return this.height
      },
      center: function () {
        return this.center
      },
      status () {
        return this.status
      },
      type () {
        return this.type
      },
      disable () {
        return this.disable
      }
    }
  }

  // 确定端口的位置信息
  getPortPositon (portList, top = true) {
    const setting = each(portList)((port, index) => {
      const origin = port.toSetting()
      const data = origin.data
      data.center = function () {
        const vertical =
          (this.compHeight / 2) * (top ? -1 : 1)
        const len = portList.length + 1
        const piece = (this.compWidth) / len
        const horizen = -(len / 2 - index - 1) * piece
        return [this.center[0] + horizen, this.center[1] + vertical]
      }
      return origin
    })
    return setting
  }

  toSetting () {
    return {
      data: this.getParameter(),
      children: [
        ...this.getPortPositon([...this.dataInput, ...this.modelInput], true),
        ...this.getPortPositon([...this.dataOutput, ...this.modelOutput], false)
      ]
    }
  }
}

export default Ports
