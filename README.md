# Platziverse

### About
A IoT plataform with Nodejs

**Platziverse** is a IoT platafrom develped in Node js in wich is posible registry metrics from iot agents and visializate the that metrics in grapich generates dinamically.

The metrics can be visualizates on a web inteface, developed in the microservice **platziverse-web**
or on the terminal with the package **platziverse-cli**.

### Tech Stack

###### platziverse-agent
> A custom IoT event emmiter. Send and recives data from agents

- Agent emitter --- Class extended from the builtin EventEmmiter object of node/js
- Message protocol --- MQTT (The client used by the Agent)

###### platziverse-api
> API server to make CRUD operation on the db

- Server App --- Builded with Express js
- Authentication --- API key token through jwt
- Authorization --- API key token-permission-scope through express-jwt-permissions
- DB --- **platziverse-db** (postgresql)

###### platziverse-cli
> Grapical terminal interface to monitor metrics sent by agents 

- Graphic interface --- Blessed js
- Monitoring --- platziverse-agent (event emitter - mqtt protocol)

###### platziverse-db
> DB services to store metrics from the agents

- DB --- Postgresql
- DB client --- squelize (and pg pg-hstore)

###### platziverse-mqtt
> MQTT server subscribed to the agents emmiters

- MQTT Server --- ades library
- Semi-persistance --- Redis
- DB --- **platziverse-db**


###### platziverse-web
> A web interface to monitoring the connected agents and the metrics sent by these

- SSR --- Static Express js server
- Frontend framework --- Vue
- Monitorign --- platziverse-agent (event emitter - mqtt protocol)

## Demo

#### UI - CLI

<img src="/images/ui-terminal.PNG" >

#### UI - WEB

<img src="/images/ui-web.png" >