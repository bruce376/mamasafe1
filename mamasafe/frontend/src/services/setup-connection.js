// MongoDB Atlas setup notes
// Keep Atlas credentials in backend/.env only. Frontend files must never contain the connection string.

console.log('MongoDB Atlas setup');
console.log('1. Copy backend/.env.example to backend/.env if backend/.env does not exist.');
console.log('2. Set MONGODB_URI to your Atlas connection string.');
console.log('3. Set MONGODB_DB_NAME=mamasafe.');
console.log('4. Start the backend from mamasafe/backend with: npm start');
console.log('5. Check http://localhost:5000/api/health for database status.');

module.exports = {
    requiredEnv: ['MONGODB_URI', 'MONGODB_DB_NAME'],
    healthUrl: 'http://localhost:5000/api/health'
};
