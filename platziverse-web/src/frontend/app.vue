<template>
  <div>
    <!-- <metric uuid="1694e258-0c16-4ca6-ba8b-094ca758e6d7" type="callbackMetric" :socket="socket"></metric> -->
    <!-- <agent uuid="9d7b92ea-a7c6-4678-a89c-b423972eeb6a" :socket="socket"></agent> -->
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid" :socket="socket"></agent>
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
const axios = require("axios").default;

const request = async (url, method) => {
  const { data, status } = await axios({
    url,
    method,
  });
  return { data, status };
};
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
    async initialize() {
      let agents;
      let res;
      try {
        res = await request("/agents", "GET");
        agents = res.data;
      } catch (error) {
        error.data
          ? (this.error = error.data.message)
          : (this.error = "Internal server error");
      }

      this.agents = agents;

      socket.on("agent/connected", (payload) => {
        const { uuid } = payload.agent;
        const existing = this.agents.find((a) => a.uuid === uuid);
        if (!existing) {
          this.agents.unshift(payload.agent);
        }
      });
    },
  },
};
</script>