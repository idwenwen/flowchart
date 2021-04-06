import Border from './containerBorder'
import ContainerContent from './containerContent'

class Container {
  constructor (container) {
    this.container = container
  }

  getParameter () {
    return {
      linking: false
    }
  }

  getSetting () {
    return {
      data: this.getParameter(),
      children: [
        new ContainerContent().toSetting(),
        new Border().toSetting()]
    }
  }
}

export default Container
