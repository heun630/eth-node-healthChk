#!/usr/bin/env node

const ethers = require('ethers');
const http = require('http');
require('dotenv').config();

const config = {
    host: process.env.ETH_RPC_HOST || 'localhost',
    rpc_port: process.env.ETH_RPC_PORT || 8545,
    network: process.env.ETH_NETWORK || 'homestead',
    local_port: process.env.ETH_MONITOR_PORT || 50000,
    max_difference: process.env.MAX_BLOCK_DIFFERENCE || 3,
    server_name: process.env.SERVER_NAME || 'test-geth',
    server_ip: process.env.SERVER_IP || '127.0.0.1',
};

const provider = ethers.getDefaultProvider(config.network);
const localProvider = new ethers.providers.JsonRpcProvider(`http://${config.host}:${config.rpc_port}`);
localProvider.connection.timeout = 5000;

function setCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

async function getBlockNumbers() {
    try {
        const localBlockNum = await localProvider.getBlockNumber();
        const networkBlockNum = await provider.getBlockNumber();
        return { localBlockNum, networkBlockNum };
    } catch (e) {
        console.error(e);
        return null;
    }
}

function createHealthcheckResponse(localBlockNum, networkBlockNum, responseStatus) {
    const difference = (localBlockNum - networkBlockNum).toString();
    return JSON.stringify({
        difference,
        serverIpString: config.server_ip,
        netWork: config.network,
        responseStatus,
        server_name: config.server_name,
    });
}

const onHealthcheckRequest = async (req, res) => {
    setCORSHeaders(res);

    console.log(`>> checking ${config.host}:${config.rpc_port} (${config.network})`);

    const { localBlockNum, networkBlockNum } = await getBlockNumbers();

    if (!localBlockNum || !networkBlockNum) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end();
        return;
    }

    const responseStatus = networkBlockNum - localBlockNum > config.max_difference ? 500 : 200;
    res.writeHead(responseStatus, { 'Content-Type': 'application/json' });

    const healthcheckResponse = createHealthcheckResponse(localBlockNum, networkBlockNum, responseStatus);
    res.end(healthcheckResponse);
};

console.log(`Starting eth monitoring service for ${config.host}:${config.rpc_port} on ${config.local_port}...`);
http.createServer(onHealthcheckRequest).listen(config.local_port);
