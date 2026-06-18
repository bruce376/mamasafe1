require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');

async function analyzeCollections() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'mamacare';

    if (!uri) {
        throw new Error('MONGODB_URI is required');
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        
        console.log(`Analyzing collections in database: ${dbName}\n`);

        const collections = await db.listCollections().toArray();
        console.log(`Total collections: ${collections.length}\n`);

        const analysis = [];

        for (const collection of collections) {
            const collName = collection.name;
            const coll = db.collection(collName);
            
            const count = await coll.countDocuments({});
            
            // Use aggregation to get collection stats
            const statsResult = await coll.aggregate([{$collStats: {}}]).toArray();
            const stats = statsResult[0] || {};
            
            const sizeBytes = stats.size || 0;
            const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
            const storageSizeBytes = stats.storageSize || 0;
            const storageSizeMB = (storageSizeBytes / (1024 * 1024)).toFixed(2);
            
            analysis.push({
                name: collName,
                documentCount: count,
                sizeBytes,
                sizeMB,
                storageSizeBytes,
                storageSizeMB,
                avgDocSize: stats.avgObjSize ? (stats.avgObjSize / 1024).toFixed(2) + ' KB' : 'N/A'
            });
        }

        // Sort by storage size (descending)
        analysis.sort((a, b) => b.storageSizeBytes - a.storageSizeBytes);

        console.log('Collection Analysis (sorted by storage size):\n');
        console.log('='.repeat(100));
        console.log(sprintf('%-40s %12s %12s %12s %12s', 'Collection Name', 'Documents', 'Size (MB)', 'Storage (MB)', 'Avg Doc Size'));
        console.log('='.repeat(100));

        let totalStorageMB = 0;
        for (const item of analysis) {
            console.log(sprintf('%-40s %12d %12s %12s %12s', 
                item.name.length > 38 ? item.name.substring(0, 38) + '..' : item.name,
                item.documentCount,
                item.sizeMB,
                item.storageSizeMB,
                item.avgDocSize
            ));
            totalStorageMB += parseFloat(item.storageSizeMB);
        }

        console.log('='.repeat(100));
        console.log(`Total Storage Used: ${totalStorageMB.toFixed(2)} MB`);
        console.log('='.repeat(100));

        // Identify potential candidates for deletion
        console.log('\n\nPotential Candidates for Deletion:\n');
        const candidates = analysis.filter(item => {
            // Collections with 0 documents
            if (item.documentCount === 0) return true;
            // Very small collections (< 1KB)
            if (item.storageSizeBytes < 1024) return true;
            // Test/temp collections (by naming convention)
            if (item.name.includes('test') || item.name.includes('temp') || item.name.includes('tmp')) return true;
            return false;
        });

        if (candidates.length > 0) {
            console.log('Collections with 0 documents or very small size:');
            candidates.forEach(item => {
                console.log(`  - ${item.name} (${item.documentCount} docs, ${item.storageSizeMB} MB)`);
            });
        } else {
            console.log('No obvious candidates found (0-doc or very small collections)');
        }

        // Show largest collections
        console.log('\n\nLargest Collections (top 10):\n');
        analysis.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. ${item.name}: ${item.storageSizeMB} MB (${item.documentCount} documents)`);
        });

    } finally {
        await client.close();
    }
}

// Simple sprintf implementation
function sprintf(format, ...args) {
    return format.replace(/%[-+0-9.]*[a-zA-Z]/g, (match) => {
        const arg = args.shift();
        switch(match.slice(-1)) {
            case 's': return String(arg);
            case 'd': return parseInt(arg);
            case 'f': return parseFloat(arg);
            default: return arg;
        }
    });
}

analyzeCollections().catch(error => {
    console.error('Error analyzing collections:', error.message);
    process.exitCode = 1;
});
