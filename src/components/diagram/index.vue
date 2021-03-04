<template>
  <div class="checked">
    <div :style="{
      width: '100%',
      height: '500px'
    }" id="flowTest">
      <div id="chart"/>
    </div>
    <button @click="addComponent">addComponent</button>
    <button @click="showConponentInfo">showConponentInfo</button>
    <button @click="checkDiagramByConfig">loadInfo</button>
    <button @click="changeStatus">changsStatus</button>
  </div>
</template>

<script>
import Chart from './flowChart'
export default {
  name: 'FlowChart',
  data () {
    return {
      chartFlow: null,
      index: 0
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.chartFlow = new Chart(document.getElementById('flowTest'), 'guest')
    })
  },
  methods: {
    addComponent () {
      const setting = [
        {
          type: 'reader',
          status: 'success',
          disable: false,
          name: 'reader_0',
          id: 'comp1'
        },
        {
          type: 'selection',
          status: 'running',
          disable: false,
          name: 'selection_0',
          id: 'comp2'
        },
        {
          type: 'binning',
          status: 'unrun',
          disable: false,
          name: 'binning_0',
          id: 'comp3'
        },
        {
          type: 'evaluation',
          status: 'fail',
          disable: false,
          name: 'evaluation_0',
          id: 'comp4'
        }
      ]
      const item = setting[this.index]
      if (item) {
        this.chartFlow.addComp(item.type, item.status, item.disable, item.name)
        this.index += 1
      }
    },

    showConponentInfo () {
      this.chartFlow.getCurrentInfo()
    },

    checkDiagramByConfig () {
      this.chartFlow.loadInfo()
    },

    changeStatus () {
      this.chartFlow.setStatus({
        selection_0: 'fail'
      })
    }
  }
}
</script>

<style lang="css" scoped>
  .checked {
    border: 1px solid #888;
    display:flex;
    flex-direction:column;
  }
</style>
