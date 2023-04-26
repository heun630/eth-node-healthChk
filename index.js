#!/usr/bin/env node

const ethers = require('ethers');
const http = require('http');
require('dotenv').config();

const host = process.env.ETH_RPC_HOST || 'localhost';
const rpc_port = process.env.ETH_RPC_PORT || 8545;
const network = process.env.ETH_NETWORK || 'homestead';
const local_port = process.env.ETH_MONITOR_PORT || 50000;
const max_difference = process.env.MAX_BLOCK_DIFFERENCE || 3;
const server_name = process.env.SERVER_NAME || 'test-geth';
const server_ip = process.env.SERVER_IP || '127.0.0.1';

const provider = ethers.getDefaultProvider(network);
const localProvider = new ethers.providers.JsonRpcProvider(`http://${host}:${rpc_port}`);

localProvider.connection.timeout = 5000;

const onHealthcheckRequest = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log(`>> checking ${host}:${rpc_port} (${network})`);
    let hostUrl = `${host}:${rpc_port}`;

    let localBlockNum;
    let networkBlockNum;

    try {
        localBlockNum = await localProvider.getBlockNumber();
        networkBlockNum = await provider.getBlockNumber();
    } catch (e) {
        console.error(e);
        res.writeHead(500, {'Content-Type': 'application/json'})
        res.end();
    }

    let responseStatus = networkBlockNum - localBlockNum > max_difference ? 500 : 200;

    if (localBlockNum > 10000 && networkBlockNum <= 0) {
        responseStatus = 200;
    }

    res.writeHead(responseStatus, {'Content-Type': 'application/json'});

    let difference = (localBlockNum - networkBlockNum).toString();
    res.end(`{"difference":"${difference}", "serverIpString":"${server_ip}", "netWork":"${network}", "responseStatus":"${responseStatus}", "server_name":"${server_name}" }`);
};

console.log(`Starting eth monitoring service for ${host}:${rpc_port} on ${local_port}...`);
http.createServer(onHealthcheckRequest).listen(local_port);

