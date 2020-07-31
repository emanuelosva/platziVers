<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400"
      :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
.metric {
  border: 1px solid white;
  margin: 0 auto;
}
.metric-type {
  font-size: 28px;
  font-weight: normal;
  font-family: "Roboto", sans-serif;
}
canvas {
  margin: 0 auto;
}
</style>

<script>
const axios = require("axios").default;
const moment = require("moment");
const randomColor = require("random-material-color");
const LineChart = require("./line-chart");

const request = async (url, method) => {
  const { data, status } = await axios({
    url,
    method,
  });
  return { data, status };
};

module.exports = {
  name: "metric",
  components: {
    LineChart,
  },
  props: ["uuid", "type", "socket"],
  data() {
    return {
      datacollection: {},
      error: null,
      color: null,
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      const { uuid, type } = this;
      this.color = randomColor.getColor();

      let result;
      try {
        const res = await request(`/metrics/${uuid}/${type}`, "GET");
        result = res.data;
      } catch (error) {
        console.log(error);
        error.data
          ? (this.error = error.data.message)
          : (this.error = "Internal server error");

        return;
      }

      const labels = [];
      const data = [];

      if (Array.isArray(result)) {
        result.forEach((m) => {
          labels.push(moment(m.createdAt).format("HH:mm:ss"));
          data.push(m.value);
        });
      }

      this.datacollection = {
        labels,
        datasets: [
          {
            backgroundColor: this.color,
            label: type,
            data,
          },
        ],
      };
      this.startRealtime();
    },

    startRealtime() {
      const { type, uuid, socket } = this;
      socket.on("agent/message", (payload) => {
        if (payload.agent.uuid === uuid) {
          const metric = payload.metrics.find((m) => m.type === type);

          // Copy currebt values
          const labels = this.datacollection.labels;
          const data = this.datacollection.datasets[0].data;

          // Remove first element id length >= 20
          const actualLength = labels.length || data.length;
          if (actualLength >= 20) {
            labels.shift();
            data.shift();
          }

          // Add the new element
          labels.push(moment(metric.createdAt).format("HH:mm:ss"));
          data.push(metric.value);

          this.datacollection = {
            labels,
            datasets: [
              {
                backgroundColor: this.color,
                label: type,
                data,
              },
            ],
          };
        }
      });
    },

    handleError(err) {
      this.error = err.message;
    },
  },
};
</script>