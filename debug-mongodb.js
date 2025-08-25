#!/usr/bin/env node

// MongoDB Connection Debug Script
const { MongoClient } = require('mongodb');

const config = require('./config');

async function debugMongoDB() {
    console.log('🔍 MongoDB Connection Debug Script');
    console.log('=====================================');
    
    const webserviceConfig = config.webservice;
    const databaseUrl = webserviceConfig.database;
    
    console.log('📋 Configuration:');
    console.log(`Database URL: ${databaseUrl}`);
    console.log(`Host: ${webserviceConfig.host}`);
    console.log(`Port: ${webserviceConfig.port}`);
    console.log(`Timeout: ${webserviceConfig.timeout}ms`);
    console.log(`Workers: ${webserviceConfig.workers}`);
    
    try {
        console.log('\n🔌 Testing MongoDB connection...');
        const client = new MongoClient(databaseUrl, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000
        });
        
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        const db = client.db();
        console.log(`📊 Database name: ${db.databaseName}`);
        
        // Test ObjectID creation
        console.log('\n🔍 Testing ObjectID creation...');
        const { ObjectId } = require('mongodb');
        
        // Test valid ObjectID
        const validId = '68a729adc97e69005a96bbc2';
        try {
            const objectId = new ObjectId(validId);
            console.log(`✅ Valid ObjectID created: ${objectId}`);
        } catch (error) {
            console.log(`❌ Failed to create ObjectID from ${validId}:`, error.message);
        }
        
        // Test invalid ObjectID
        const invalidId = 'invalid-id';
        try {
            const objectId = new ObjectId(invalidId);
            console.log(`✅ ObjectID created from ${invalidId}: ${objectId}`);
        } catch (error) {
            console.log(`❌ Expected error for invalid ObjectID ${invalidId}:`, error.message);
        }
        
        // Check collections
        console.log('\n📁 Checking collections...');
        const collections = await db.listCollections().toArray();
        console.log('Collections found:', collections.map(c => c.name));
        
        // Check if pa11y collections exist
        const pa11yCollections = ['tasks', 'results'];
        for (const collectionName of pa11yCollections) {
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            console.log(`📊 ${collectionName}: ${count} documents`);
        }
        
        await client.close();
        console.log('\n✅ Debug completed successfully!');
        
    } catch (error) {
        console.error('\n❌ MongoDB connection failed:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if MongoDB Atlas is accessible from your Render app');
            console.log('2. Verify network access settings in MongoDB Atlas');
            console.log('3. Check if the connection string is correct');
            console.log('4. Ensure the database user has proper permissions');
        }
        
        if (error.message.includes('authentication')) {
            console.log('\n💡 Authentication issues:');
            console.log('1. Check username and password in connection string');
            console.log('2. Verify database user exists in MongoDB Atlas');
            console.log('3. Check if IP whitelist includes Render app IPs');
        }
    }
}

// Run the debug script
debugMongoDB().catch(console.error);
