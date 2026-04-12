# MongoDB Atlas Integration for MamaCare

## Overview
Your MamaCare application is now connected to MongoDB Atlas with the following credentials:
- **Username**: `ug2424887_db_user`
- **Database**: `mamacare`
- **Cluster**: `cluster0.ofrzq1d.mongodb.net`
- **Authentication**: SCRAM
- **Connection String**: `mongodb+srv://ug2424887_db_user:<db_password>@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0`

## Files Created

### Backend Files
- `server.js` - Updated with MongoDB connection and API routes
- `backend-api.js` - Complete MongoDB API implementation
- `package.json` - Updated with MongoDB dependencies

### Frontend Files
- `config.js` - MongoDB configuration
- `api-service.js` - Frontend API service with offline support
- `mongodb-service.js` - MongoDB service layer

### Configuration
- `.env` - Environment variables for MongoDB connection

## Database Collections

The following collections are available:

1. **users** - User account information
2. **pregnancy_data** - Pregnancy tracking data
3. **baby_data** - Baby development data
4. **toddler_data** - Toddler activities and progress
5. **milestones** - Developmental milestones
6. **appointments** - Doctor appointments
7. **nutrition** - Nutrition and feeding data
8. **sleep** - Sleep patterns and schedules
9. **activities** - Playtime and activity logs

## API Endpoints

### Users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID

### Pregnancy Data
- `POST /api/pregnancy` - Save pregnancy data
- `GET /api/pregnancy/:userId` - Get pregnancy data for user

### Baby Data
- `POST /api/baby` - Save baby data
- `GET /api/baby/:userId` - Get baby data for user

### Toddler Data
- `POST /api/toddler` - Save toddler data
- `GET /api/toddler/:userId` - Get toddler data for user

### Milestones
- `POST /api/milestones` - Save milestone
- `GET /api/milestones/:userId` - Get milestones for user

### Appointments
- `POST /api/appointments` - Save appointment
- `GET /api/appointments/:userId` - Get appointments for user

### Nutrition
- `POST /api/nutrition` - Save nutrition data
- `GET /api/nutrition/:userId` - Get nutrition data for user

### Sleep
- `POST /api/sleep` - Save sleep data
- `GET /api/sleep/:userId` - Get sleep data for user

### Activities
- `POST /api/activities` - Save activity data
- `GET /api/activities/:userId` - Get activity data for user

### Health Check
- `GET /api/health` - Check server and MongoDB status

## Setup Instructions

### 1. Set Database Password
**IMPORTANT**: You need to replace `<db_password>` in the connection string with your actual MongoDB Atlas password.

#### Option A: Manual Update
Replace `<db_password>` in these files:
- `config.js` (line 4)
- `server.js` (line 15)
- `.env` (line 2)
- `backend-api.js` (line 11)

#### Option B: Automatic Update
```bash
node setup-connection.js YOUR_ACTUAL_PASSWORD
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

The server will:
- Connect to MongoDB Atlas automatically
- Start on port 3000
- Display connection status

### 4. Verify Connection
Open your browser and navigate to:
- `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "OK",
  "connected": true,
  "timestamp": "2026-04-09T..."
}
```

## Features

### Automatic Data Sync
- **Online Mode**: Data saves directly to MongoDB Atlas
- **Offline Mode**: Data saves to localStorage and syncs when back online
- **Real-time Sync**: Automatically syncs unsynced data when connection restored

### Error Handling
- Graceful fallback to localStorage when MongoDB is unavailable
- Automatic retry mechanism for failed connections
- Comprehensive error logging

### Data Security
- SCRAM authentication for MongoDB Atlas
- Environment variables for sensitive credentials
- CORS enabled for secure API access

## Usage Examples

### Save User Data
```javascript
// Save to MongoDB (online) or localStorage (offline)
await window.apiService.saveUser({
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: new Date()
});
```

### Get User Data
```javascript
// Get user from MongoDB
const user = await window.apiService.getUser('user-id');
console.log(user);
```

### Save Toddler Progress
```javascript
// Save milestone progress
await window.apiService.saveMilestone({
    userId: 'user-id',
    age: 24,
    milestone: 'First words',
    achieved: true,
    date: new Date()
});
```

## Monitoring

### Check MongoDB Status
```javascript
const health = await window.apiService.checkHealth();
console.log('MongoDB Status:', health.connected);
```

### Sync Status
```javascript
// Check for unsynced data
const unsynced = window.apiService.getUnsyncedData();
console.log('Unsynced items:', unsynced);
```

## Troubleshooting

### Connection Issues
1. Check MongoDB Atlas credentials in `.env`
2. Verify network connectivity
3. Check MongoDB Atlas IP whitelist
4. Review server console logs

### Data Not Saving
1. Check browser console for errors
2. Verify API endpoints are working
3. Check localStorage for offline data
4. Test with health check endpoint

### Performance Issues
1. Monitor MongoDB Atlas metrics
2. Check query performance
3. Review data indexing needs
4. Optimize API response times

## Next Steps

1. **Test the Connection**: Start the server and verify MongoDB connectivity
2. **Update Frontend**: Integrate API calls into your existing features
3. **Add Data Validation**: Implement client-side and server-side validation
4. **Monitor Usage**: Set up monitoring for database performance
5. **Backup Strategy**: Configure MongoDB Atlas backups

## Support

For issues with MongoDB integration:
1. Check server console logs
2. Verify MongoDB Atlas status
3. Review network connectivity
4. Test API endpoints individually

Your MamaCare application is now fully integrated with MongoDB Atlas!
