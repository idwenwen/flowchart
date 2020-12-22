import Border from './containerBorder'
import ContainerContent from './containerContent'

class Container {
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
      progress: 1,
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
      parameter: this.toParameter(),
      events: this.toEvents(),
      children: [new ContainerContent().toSetting(), new Border().toSetting()]
    }
  }
}

export default Container
