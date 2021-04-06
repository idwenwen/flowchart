<template>
  <div
    id="CanvasComponent"
    class="canvas-panel"
  />
</template>

<script>
import Chart from './diagram/flowChart'
import { compareToPos } from '@/components/flowChart/diagram/flowChart/utils'
export default {
  name: 'DagRender',

  props: {
    role: {
      type: String,
      default: 'guest'
    }
  },

  data () {
    return {
      chartFlow: null
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.chartFlow = new Chart(document.getElementById('CanvasComponent'), this.role)
      this.chartFlow.flowPanel.afterChoosen((val) => { this.handleClickCom(val) })
    })
  },

  methods: {
    addComponent (data) {
      const {
        id: componentId,
        type: id,
        name: label,
        x: mouseX,
        y: mouseY,
        disable,
        status
      } = data
      const _t = this
      let origin = [data.mouseX, data.mouseY]
      origin = compareToPos(origin, null, document.getElementById('CanvasComponent'))
      this.chartFlow.addComp(
        data.id,
        status,
        disable,
        null,
        null,
        null,
        origin,
        data.componentId
      )
      this.chartFlow.flowPanel.afterChoosen((val) => { _t.handleClickCom(val) })
    },

    getDagJson () {
      return this.chartFlow.getCurrentInfo()
    },

    handleClickCom (val) {
      this.$emit('get', val)
    },

    setStatus (val) {
      this.chartFlow.setStatus(val)
    },

    loadConfig (conf) {
      this.chartFlow.loadInfo(conf)
    },

    beforeDelete (events) {
      this.chartFlow.setDelete(events)
    },

    rebuild (config) {
      this.chartFlow.rebuild(config)
    }
  }
}
</script>

<style scoped lang="scss">
.canvas-panel {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
