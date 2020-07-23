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

  function findByUuid(uuid) {
    return AgentModel.findOne({
      where: { uuid },
    });
  };

  function findAll() {
    return AgentModel.findAll();
  };

  function findByUsername(username) {
    return AgentModel.findAll({
      where: { username, connected: true },
    });
  };

  function findConnected() {
    return AgentModel.findAll({
      where: { connected: true },
    });
  };

  return {
    findAll,
    findById,
    findByUuid,
    findByUsername,
    findConnected,
    createOrUpdate,
  };
};
