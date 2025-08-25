#!/usr/bin/env node

// Script to fix existing tasks with proper timeout settings
const { MongoClient } = require('mongodb');
const config = require('./config');

async function fixExistingTasks() {
    console.log('🔧 Fixing existing tasks with proper timeout...');
    console.log('==============================================');
    
    const webserviceConfig = config.webservice;
    const databaseUrl = webserviceConfig.database;
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        const client = new MongoClient(databaseUrl, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000
        });
        
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        const db = client.db();
        const tasksCollection = db.collection('tasks');
        
        // Find tasks that need timeout fixes
        const tasksToFix = await tasksCollection.find({
            $or: [
                { timeout: { $exists: false } },
                { timeout: null },
                { timeout: undefined },
                { timeout: { $lt: 300000 } } // Less than 5 minutes
            ]
        }).toArray();
        
        console.log(`📊 Found ${tasksToFix.length} tasks that need timeout fixes`);
        
        if (tasksToFix.length > 0) {
            console.log('\n🔧 Updating tasks with proper timeout (300000ms)...');
            
            const result = await tasksCollection.updateMany(
                {
                    $or: [
                        { timeout: { $exists: false } },
                        { timeout: null },
                        { timeout: undefined },
                        { timeout: { $lt: 300000 } }
                    ]
                },
                {
                    $set: { timeout: 300000 }
                }
            );
            
            console.log(`✅ Updated ${result.modifiedCount} tasks with proper timeout`);
            
            // Show details of updated tasks
            const updatedTasks = await tasksCollection.find({
                timeout: 300000
            }).toArray();
            
            console.log('\n📋 Updated tasks:');
            updatedTasks.forEach(task => {
                console.log(`  - ${task.name} (${task.url}) - ID: ${task._id}`);
            });
        }
        
        // Show summary
        const totalTasks = await tasksCollection.countDocuments();
        const tasksWithGoodTimeout = await tasksCollection.countDocuments({
            timeout: { $gte: 300000 }
        });
        
        console.log('\n📊 Summary:');
        console.log(`Total tasks: ${totalTasks}`);
        console.log(`Tasks with good timeout (≥5min): ${tasksWithGoodTimeout}`);
        console.log(`Tasks that need attention: ${totalTasks - tasksWithGoodTimeout}`);
        
        await client.close();
        console.log('\n✅ Task fixes completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Failed to fix tasks:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the fix script
fixExistingTasks().catch(console.error);
