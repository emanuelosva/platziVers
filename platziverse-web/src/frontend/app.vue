<template>
  <div>
    <!-- <metric uuid="1694e258-0c16-4ca6-ba8b-094ca758e6d7" type="callbackMetric" :socket="socket"></metric> -->
    <agent uuid="c030211e-3ac8-4db8-a908-04419d250297" :socket="socket"></agent>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid"></agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
body {
  font-family: Arial;
  background: #f8f8f8;
  margin: 0;
}
</style>

<script>
const io = require("socket.io-client");
const socket = io();
module.exports = {
  data() {
    return {
      agents: [],
      error: null,
      socket,
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {},
  },
};
</script>