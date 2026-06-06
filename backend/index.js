const { onRequest } = require('firebase-functions/v2/https');
const app = require('./server');

let databaseReady;

async function ensureDatabaseReady() {
    if (!databaseReady) {
        databaseReady = app.connectToMongoDB().catch((error) => {
            console.error('MongoDB initialization failed:', error);
            databaseReady = null;
        });
    }

    await databaseReady;
}

exports.api = onRequest(
    {
        region: 'us-central1',
        memory: '512MiB',
        timeoutSeconds: 60
    },
    async (req, res) => {
        await ensureDatabaseReady();
        return app(req, res);
    }
);
