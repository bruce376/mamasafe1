// MongoDB Atlas Connection Setup Helper
// This file helps you set up the actual database password

const fs = require('fs');
const path = require('path');

// Configuration template with password placeholder
const configTemplate = {
    mongodb: {
        connectionString: 'mongodb+srv://ug2424887_db_user:YOUR_PASSWORD@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
        username: 'ug2424887_db_user',
        cluster: 'cluster0.ofrzq1d.mongodb.net',
        database: 'mamacare'
    }
};

// Instructions for setting up the password
console.log('='.repeat(60));
console.log('MONGODB ATLAS CONNECTION SETUP');
console.log('='.repeat(60));
console.log('\nTo complete your MongoDB Atlas connection:');
console.log('\n1. Replace YOUR_PASSWORD in the connection string with your actual database password');
console.log('2. Update the following files:');
console.log('   - config.js (line 4)');
console.log('   - server.js (line 15)');
console.log('   - .env (line 2)');
console.log('   - backend-api.js (line 11)');
console.log('\n3. Your connection string format should be:');
console.log('   mongodb+srv://ug2424887_db_user:YOUR_ACTUAL_PASSWORD@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0');
console.log('\n4. Test the connection:');
console.log('   npm start');
console.log('   Then visit: http://localhost:3000/api/health');
console.log('\n' + '='.repeat(60));

// Function to update all files with the password
function updateConnectionFiles(password) {
    const files = [
        { path: 'config.js', placeholder: '<db_password>' },
        { path: 'server.js', placeholder: '<db_password>' },
        { path: '.env', placeholder: '<db_password>' },
        { path: 'backend-api.js', placeholder: '<db_password>' }
    ];

    files.forEach(file => {
        try {
            const filePath = path.join(__dirname, file.path);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace the placeholder with the actual password
            content = content.replace(file.placeholder, password);
            
            fs.writeFileSync(filePath, content);
            console.log(`Updated: ${file.path}`);
        } catch (error) {
            console.error(`Error updating ${file.path}:`, error.message);
        }
    });
}

// Export for use if needed
module.exports = {
    updateConnectionFiles,
    configTemplate
};

// If you want to run this directly with a password:
// node setup-connection.js YOUR_PASSWORD
if (process.argv.length === 3) {
    const password = process.argv[2];
    console.log(`\nUpdating connection files with password...`);
    updateConnectionFiles(password);
    console.log('\nAll files updated successfully!');
    console.log('You can now start your server with: npm start');
}
