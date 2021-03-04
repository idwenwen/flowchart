import Border from './containerBorder'
import ContainerContent from './containerContent'

class Container {
  constructor (container) {
    this.container = container
  }

  toParameter () {
    return {
      width () {
        return this.width
      },
      height () {
        return this.height
      },
      center () {
        return this.center
      },
      radius () {
        return this.radius
      },
      linking: false,
      status () {
        return this.status
      },
      choosed () {
        return this.choosed
      },
      disable () {
        return this.disable
      }
    }
  }

  toEvents () {
    return {
    }
  }

  toSetting () {
    return {
      data: this.toParameter(),
      events: this.toEvents(),
      children: [new ContainerContent().toSetting(), new Border().toSetting()]
    }
  }
}

export default Container
