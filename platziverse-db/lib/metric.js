'use strict';

module.exports = function metricService(MetricModel, AgentModel) {

  async function findByAgentUuid(agentUuid) {
    const query = {
      attributes: ['type'],
      group: ['type'],
      include: [{
        attributes: [],
        model: AgentModel,
        where: { uuid: agentUuid },
      }],
      raw: true,
    };

    return MetricModel.findAll(query);
  };

  async function findByTypeAgentUuid(type, agentUuid) {
    const query = {
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: { type },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: { uuid: agentUuid },
      }],
      raw: true,
    };

    return MetricModel.findAll(query);
  };

  async function create(agentUuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid: agentUuid },
    });

    if (agent) {
      Object.assign(metric, { agentId: agent.id });
      const result = await MetricModel.create(metric);
      return result.toJSON();
    }

    return null;
  };

  return {
    findByAgentUuid,
    findByTypeAgentUuid,
    create,
  };
};
