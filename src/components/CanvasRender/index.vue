<template>
  <div>
    <div
      id="CanvasComponent"
      class="canvas-panel"
    />
    <button @click="addOne">addOne</button>
    <button @click="getInfo">getInfo</button>
    <button @click="clear">clear</button>
    <button @click="rebuild">rebuild</button>
    <button @click="changeStatus">status</button>
    <button @click="setOld">old</button>
    <button @click="caching">cache</button>
    <button @click="setSaved">unsave</button>
    <button @click="getOld">allOld</button>
    <button @click="getSaved">allSaved</button>
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
        type: 'secureboost',
        choose: false,
        disable: false,
        status: 'fail',
        role: 'host',
        old: true
      }, {
        id: 'comp_1',
        type: 'reader',
        choose: false,
        disable: false,
        role: 'guest',
        status: 'success'
      }, {
        id: 'comp_2',
        type: 'heteroSecureBoost',
        choose: false,
        disable: false,
        role: 'guest',
        status: 'success'
      }],

      statusChange: [
        {
          comp_0: 'running'
        },
        {
          comp_0: 'success'
        },
        {
          comp_0: 'unrun'
        },
        {
          comp_0: 'fail'
        },
        {
          comp_0: 'running'
        },
        {
          comp_0: 'success'
        }
      ],
      statusIndex: 0,

      comps: [
        [{'id': 'comp_0', 'type': 'binning', 'status': 'success|complete', 'disable': false, 'name': 'binning_0', 'role': 'guest', 'point': [116, 152], 'width': 240, 'height': 55, 'single': false, 'dependency': {'modelOutput': [{'componentName': 'secureboost_0', 'componentId': 'comp_2', 'from': ['model', 0], 'to': ['model', 0]}], 'dataOutput': [{'componentName': 'secureboost_0', 'componentId': 'comp_2', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_1', 'type': 'reader', 'status': 'success|complete', 'disable': false, 'name': 'reader_0', 'role': 'guest', 'point': [191, 33], 'width': 240, 'height': 55, 'single': false, 'dependency': {'dataOutput': [{'componentName': 'binning_0', 'componentId': 'comp_0', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_2', 'type': 'secureboost', 'status': 'success|complete', 'disable': false, 'name': 'secureboost_0', 'role': 'guest', 'point': [173, 284], 'width': 240, 'height': 55, 'single': false}],
        [{'id': 'comp_0', 'type': 'selection', 'status': 'success|complete', 'disable': false, 'name': 'selection_0', 'role': 'guest', 'point': [116, 152], 'width': 240, 'height': 55, 'single': false, 'dependency': {'dataOutput': [{'componentName': 'secureboost_0', 'componentId': 'comp_2', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_1', 'type': 'reader', 'status': 'success|complete', 'disable': false, 'name': 'reader_0', 'role': 'guest', 'point': [191, 33], 'width': 240, 'height': 55, 'single': false, 'dependency': {'dataOutput': [{'componentName': 'binning_0', 'componentId': 'comp_0', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_2', 'type': 'secureboost', 'status': 'success|complete', 'disable': false, 'name': 'secureboost_0', 'role': 'guest', 'point': [173, 284], 'width': 240, 'height': 55, 'single': false}]
      ],
      catchGlobal: null
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.chartFlow = new ChartFlow(document.getElementById('CanvasComponent'))
    })
  },

  methods: {
    addComponent (data) {
      this.chartFlow.append(data)
    },
    addOne () {
      const set = this.defaultList[this.index]
      if (set) {
        this.addComponent(set)
        this.index++
      }
    },
    getInfo () {
      console.log(this.chartFlow.getInfo())
    },
    clear () {
      this.chartFlow.clear()
    },
    rebuild (eve, setting) {
      const defSet = [{'id': 'comp_0', 'type': 'binning', 'status': 'success|complete', 'disable': false, 'name': 'binning_0', 'role': 'guest', 'point': [116, 152], 'width': 240, 'height': 55, 'single': false, 'dependency': {'modelOutput': [{'componentName': 'secureboost_0', 'componentId': 'comp_2', 'from': ['model', 0], 'to': ['model', 0]}], 'dataOutput': [{'componentName': 'secureboost_0', 'componentId': 'comp_2', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_1', 'type': 'reader', 'status': 'success|complete', 'disable': false, 'name': 'reader_0', 'role': 'guest', 'point': [191, 33], 'width': 240, 'height': 55, 'single': false, 'dependency': {'dataOutput': [{'componentName': 'binning_0', 'componentId': 'comp_0', 'from': ['data', 0], 'to': ['data', 0]}]}}, {'id': 'comp_2', 'type': 'secureboost', 'status': 'success|complete', 'disable': false, 'name': 'secureboost_0', 'role': 'guest', 'point': [173, 284], 'width': 240, 'height': 55, 'single': false}]
      this.chartFlow.rebuild(setting || defSet)
    },
    changeStatus () {
      if (this.statusChange[this.statusIndex]) {
        this.chartFlow.changeStatus(this.statusChange[this.statusIndex])
        this.statusIndex += 1
      }
    },
    setOld () {
      this.chartFlow.setOld('comp_0')
    },
    setSaved () {
      this.chartFlow.setUnsave('comp_0', false)
    },
    getOld () {
      console.log(this.chartFlow.getOld())
    },
    getSaved () {
      console.log(this.chartFlow.getUnsave())
    },
    caching () {
      const mid = this.cacheGlobal
      this.cacheGlobal = this.chartFlow.getCurrentGlobal()
      debugger
      this.chartFlow.setCurrentGlobal(mid)
      console.log(this.cacheGlobal)
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
