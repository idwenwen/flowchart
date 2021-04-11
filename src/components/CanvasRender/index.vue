<template>
  <div>
    <div
      id="CanvasComponent"
      class="canvas-panel"
    />
    <button @click="addOne">addOne</button>
  </div>
</template>

<script>
import ChartFlow from './flowChart'
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
      chartFlow: null,

      index: 0,

      defaultList: [{
        id: 'comp_0',
        type: 'binning',
        choose: false,
        disable: false,
        status: 'success',
        role: 'guest'
      }, {
        id: 'comp_1',
        type: 'reader',
        choose: false,
        disable: false,
        role: 'guest',
        status: 'success'
      }, {
        id: 'comp_2',
        type: 'secureboost',
        choose: false,
        disable: false,
        role: 'guest',
        status: 'success'
      }]
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.chartFlow = ChartFlow(document.getElementById('CanvasComponent'), {
        complete: '@/compoents/CanvasRender/flowChart/icon/complete.svg',
        disableComplete: '@/compoents/CanvasRender/flowChart/icon/disable_complete.svg',
        error: '@/compoents/CanvasRender/flowChart/icon/error.svg',
        disableError: '@/compoents/CanvasRender/flowChart/icon/disable_error.svg',
        multData: '@/compoents/CanvasRender/flowChart/icon/mult_data.svg',
        multModel: '@/compoents/CanvasRender/flowChart/icon/mult_model.svg'
      })
    })
  },

  methods: {
    addComponent (data) {
      this.chartFlow.appendComp(data)
    },
    addOne () {
      const set = this.defaultList[this.index]
      if (set) {
        this.addComponent(set)
        this.index++
      }
    }
  }
}
</script>

<style scoped>
.canvas-panel {
  width: 500px;
  height: 400px;
  position: relative;
  border: 1px solid black;
}
</style>
