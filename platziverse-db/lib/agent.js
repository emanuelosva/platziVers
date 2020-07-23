'use strict';

module.exports = function agentService(AgentModel) {
  function findById(id) {
    return AgentModel.findById(id);
  };

  async function createOrUpdate(agent) {
    const query = {
      where: { uuid: agent.uuid },
    };

    const existingAgent = await AgentModel.findOne(query);

    if (existingAgent) {
      const updated = await AgentModel.update(agent, query);
      return updated ? AgentModel.findOne(query) : existingAgent;
    }

    const result = await AgentModel.create(agent);
    return result.toJSON();
  };

  return {
    findById,
    createOrUpdate,
  };
};
