const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // አዲሱ የ Mongoose ቨርዥን URI ብቻ ነው የሚፈልገው
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Create indexes (ካለህ)
        if (typeof createIndexes === 'function') {
            await createIndexes(conn);
        }
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
        return conn;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1); // ስህተት ካለ ሰርቨሩ እንዲቆም
    }
};
const createIndexes = async (conn) => {
    try {
        const db = conn.connection.db;
        
        // Users collection indexes
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ createdAt: -1 });
        
        // History collection indexes
        await db.collection('histories').createIndex({ userId: 1, timestamp: -1 });
        await db.collection('histories').createIndex({ type: 1 });
        await db.collection('histories').createIndex({ timestamp: -1 });
        
        // Saints collection indexes
        await db.collection('saints').createIndex({ 'feastDay.month': 1, 'feastDay.day': 1 });
        await db.collection('saints').createIndex({ name: 'text', nameAmharic: 'text' });
        await db.collection('saints').createIndex({ category: 1 });
        
        // Readings collection indexes
        await db.collection('readings').createIndex({ 'date.month': 1, 'date.day': 1 });
        
        // Holidays collection indexes
        await db.collection('holidays').createIndex({ type: 1 });
        await db.collection('holidays').createIndex({ 'date.month': 1, 'date.day': 1 });
        
        // Quizzes collection indexes
        await db.collection('quizzes').createIndex({ category: 1, difficulty: 1 });
        await db.collection('quizzes').createIndex({ 'metadata.month': 1, 'metadata.day': 1 });
        await db.collection('quizzes').createIndex({ usedCount: -1 });
        
        // QuizAttempts collection indexes
        await db.collection('quizattempts').createIndex({ userId: 1, completedAt: -1 });
        await db.collection('quizattempts').createIndex({ category: 1 });
        
        // Chats collection indexes
        await db.collection('chats').createIndex({ participants: 1 });
        await db.collection('chats').createIndex({ group: 1 });
        await db.collection('chats').createIndex({ updatedAt: -1 });
        
        // Groups collection indexes
        await db.collection('groups').createIndex({ name: 'text', description: 'text' });
        await db.collection('groups').createIndex({ category: 1 });
        await db.collection('groups').createIndex({ 'members.user': 1 });
        await db.collection('groups').createIndex({ lastActivity: -1 });
        
        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

module.exports = connectDB;