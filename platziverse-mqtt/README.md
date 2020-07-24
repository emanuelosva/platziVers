# platziverse-mqtt

## `agent/connected`

```
{
  agent: {
    uuid, // auto
    username, // defined by config
    name, // defined by config
    hostname, // obtained from operating system
    pid, // obtained from proccess
  }
}
```

## `agent/disconnected`

```
{
  agent: {
    uuid, // auto
  }
}
```

## `agent/message`

```
{
  agent,
  metric: [
    {
      type,
      value,
    }
  ],
  timestap, // unix timestamp generated on message creation
}
```