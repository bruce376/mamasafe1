const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 25;
const HOST = '0.0.0.0';

function toPort(value, fallback = DEFAULT_PORT) {
    const port = Number(value);
    return Number.isInteger(port) && port > 0 && port < 65536 ? port : fallback;
}

function isPortAvailable(port) {
    return new Promise(resolve => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close(() => resolve(true));
        });
        server.listen(port, HOST);
    });
}

async function findAvailablePort(startPort) {
    for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset += 1) {
        const port = startPort + offset;
        if (await isPortAvailable(port)) return port;
    }
    throw new Error(`No available frontend port found from ${startPort} to ${startPort + MAX_PORT_ATTEMPTS - 1}.`);
}

async function main() {
    const requestedPort = toPort(process.env.FRONTEND_PORT || process.env.PORT);
    const port = await findAvailablePort(requestedPort);
    const httpServerBin = path.join(__dirname, '..', 'node_modules', 'http-server', 'bin', 'http-server');

    if (port !== requestedPort) {
        console.log(`Frontend port ${requestedPort} is already in use. Using port ${port} instead.`);
    }

    console.log(`Frontend server: http://localhost:${port}`);

    const child = spawn(process.execPath, [httpServerBin, '-p', String(port)], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });

    const stop = signal => {
        if (!child.killed) child.kill(signal);
    };

    process.on('SIGINT', () => stop('SIGINT'));
    process.on('SIGTERM', () => stop('SIGTERM'));
    child.on('exit', code => process.exit(code || 0));
}

main().catch(error => {
    console.error(`Failed to start frontend server: ${error.message}`);
    process.exitCode = 1;
});
