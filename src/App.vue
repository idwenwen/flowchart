<template>
  <div id="app">
    <FlowChart/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import FlowChart from './components/diagram'

export default {
  name: 'App',
  components: {
    HelloWorld,
    FlowChart
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
