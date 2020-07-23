'use strinct';

const agent = {
  id: 1,
  uuid: 'yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  host: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAd: new Date(),
};

const extend = (obj, { id, uuid }) => {
  const connected = Boolean(Math.floor(Math.random() * 2));
  const clone = { ...obj, id, uuid, connected, username: 'test' };
  return clone;
};

const agentsArray = [
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyx' }),
  extend(agent, { id: 3, uuid: 'yyy-yyy' }),
  extend(agent, { id: 4, uuid: 'yyy-yyz' }),
  extend(agent, { id: 5, uuid: 'yyy-yya' }),
  extend(agent, { id: 6, uuid: 'yyy-yyb' }),
  extend(agent, { id: 7, uuid: 'yyy-yyc' }),
];

module.exports = {
  single: agent,
  all: agentsArray,
  connected: agentsArray.filter((item) => item.connected),
  platzi: agentsArray.filter((item) => item.username === 'platzi'),
  byUuid: (id) => agentsArray.filter((item) => item.uuid === id).shift(),
  byId: (id) => agentsArray.filter((item) => item.id === id).shift(),
};
