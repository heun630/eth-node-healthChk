# eth-node-lb-healthcheck

Little http node.js server to run along the ethereum node. Node needs to have JSONRPC enabled. Returns **500** if the last block number on the local node is off by 3 or more blocks from the last block number from Infura node. Otherwise returns **200**.

Supported networks:
  - homestead
  - rinkeby
  - ropsten
  - kovan
  - goerli

## Installation

```
npm install -g  @exiliontech/eth-node-lb-healthcheck
```

## Run

Configuration parameters (set as variables in .env file):

- ETH_RPC_HOST — hostname where your node JSON RPC is running. Default: `localhost`

- ETH_NETWORK — network name. Supported networks:
  - homestead
  - rinkeby
  - ropsten
  - kovan
  - goerli

- ETH_MONITOR_PORT — port to run this service on
- ETH_PORT - RPC port of JSON RPC service


Make sure the process is detached from the terminal. Make sure the port is open for incoming connections.

## License

MIT
# eth-node-healthChk
# eth-node-healthChk
