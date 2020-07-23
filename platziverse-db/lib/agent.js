'use strict';

module.exports = function agentService(AgentModel) {
  function findById(id) {
    return AgentModel.findById(id);
  };

  return {
    findById,
  };
};
