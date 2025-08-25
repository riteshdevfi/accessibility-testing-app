# 🔍 Debugging Steps: ObjectID Creation & Failures

## **Current Status**
Based on your logs, you're experiencing:
- ✅ ObjectID validation is working (no more "ObjectID generation failed" errors)
- ❌ Pa11y timeout issues (30s instead of longer timeout)
- ❌ Task execution failures

## **Step 1: Deploy Enhanced Logging**

The enhanced logging system I've created will track:
- **ObjectID Creation**: When and where ObjectIDs are created
- **ObjectID Validation**: Every time an ObjectID is validated
- **Task Execution**: Start and completion of tasks
- **Error Details**: Full error context with request IDs

### **Deploy the changes:**
```bash
git add .
git commit -m "Add enhanced logging for ObjectID tracking"
git push
```

## **Step 2: Monitor Render Logs**

After deployment, check your Render logs for these new log entries:

### **ObjectID Creation Logs:**
```
[timestamp] OBJECTID: CREATED - 68ac99287951b2650ff1d43b
```

### **ObjectID Validation Logs:**
```
[timestamp] OBJECTID: VALIDATE - 68ac99287951b2650ff1d43b
[timestamp] OBJECTID: RUN_VALIDATE - 68ac99287951b2650ff1d43b
```

### **Task Execution Logs:**
```
[timestamp] INFO: Starting task run
[timestamp] INFO: Task run started successfully
```

## **Step 3: Run Local Analysis**

If you have access to the application locally, run:

```bash
# Install dependencies
npm install

# Run the application
npm start

# In another terminal, run the analysis
node analyze-logs.js
```

## **Step 4: Check Render Logs for These Patterns**

### **Look for these specific log entries:**

1. **ObjectID Creation:**
   ```
   [timestamp] OBJECTID: CREATED - [objectId]
   ```

2. **ObjectID Validation:**
   ```
   [timestamp] OBJECTID: VALIDATE - [objectId]
   [timestamp] OBJECTID: RUN_VALIDATE - [objectId]
   ```

3. **Task Execution:**
   ```
   [timestamp] INFO: Starting task run
   [timestamp] INFO: Task run started successfully
   ```

4. **Error Patterns:**
   ```
   [timestamp] ERROR: Error running task
   [timestamp] ERROR: Invalid ObjectID format
   ```

## **Step 5: Where ObjectIDs Are Created**

Based on the code analysis, ObjectIDs are created in these locations:

### **1. Task Creation (`route/new.js`)**
- **When**: User submits new task form
- **Where**: `app.webservice.tasks.create(newTask, callback)`
- **Log**: `OBJECTID: CREATED - [newObjectId]`

### **2. Task Validation (`route/task/index.js`)**
- **When**: User visits task page (`/:id`)
- **Where**: `isValidObjectId(request.params.id)`
- **Log**: `OBJECTID: VALIDATE - [objectId]`

### **3. Task Execution (`route/task/run.js`)**
- **When**: User clicks "Run" button (`/:id/run`)
- **Where**: `isValidObjectId(request.params.id)`
- **Log**: `OBJECTID: RUN_VALIDATE - [objectId]`

## **Step 6: Common Failure Points**

### **1. Invalid ObjectID Format**
- **Cause**: URL contains non-hex characters or wrong length
- **Example**: `/invalid-id/run` instead of `/68ac99287951b2650ff1d43b/run`
- **Log**: `ERROR: Invalid ObjectID format`

### **2. Task Not Found**
- **Cause**: ObjectID exists but task doesn't in database
- **Example**: Task was deleted but URL still exists
- **Log**: `ERROR: Error fetching task`

### **3. Webservice Connection Issues**
- **Cause**: Can't connect to Pa11y webservice
- **Example**: Webservice is down or misconfigured
- **Log**: `ERROR: Error running task`

### **4. Pa11y Timeout**
- **Cause**: Accessibility testing takes too long
- **Example**: Complex website or slow network
- **Log**: `Pa11y timed out (30000ms)`

## **Step 7: Debugging Commands**

### **Check MongoDB Connection:**
```bash
node debug-mongodb.js
```

### **Analyze Logs:**
```bash
node analyze-logs.js
```

### **Check Specific ObjectID:**
```bash
# Look for specific ObjectID in logs
grep "68ac99287951b2650ff1d43b" logs/*.log
```

## **Step 8: Render-Specific Debugging**

### **1. Check Render Environment Variables:**
- `NODE_ENV=production`
- `WEBSERVICE_TIMEOUT=300000`
- `WEBSERVICE_WORKERS=2`

### **2. Check Render Logs for:**
- Application startup errors
- MongoDB connection errors
- Pa11y webservice startup errors

### **3. Check Render Metrics:**
- Memory usage
- CPU usage
- Request count
- Error rate

## **Step 9: Expected Log Flow**

For a successful task run, you should see:

```
1. [timestamp] OBJECTID: CREATED - [objectId] (when task created)
2. [timestamp] OBJECTID: VALIDATE - [objectId] (when visiting task page)
3. [timestamp] OBJECTID: RUN_VALIDATE - [objectId] (when clicking run)
4. [timestamp] INFO: Starting task run
5. [timestamp] INFO: Task run started successfully
6. [timestamp] INFO: Task completed (from Pa11y webservice)
```

## **Step 10: Quick Fixes to Try**

### **1. Increase Timeout (if still timing out):**
```javascript
// In config.js, change timeout to 10 minutes
timeout: Number(env('WEBSERVICE_TIMEOUT', '600000')),
```

### **2. Check MongoDB Atlas:**
- Verify network access includes Render IPs
- Check database user permissions
- Verify connection string format

### **3. Check Pa11y Webservice:**
- Ensure webservice is starting properly
- Check if workers are configured correctly
- Verify timeout settings are applied

## **Next Steps**

1. **Deploy the enhanced logging**
2. **Monitor Render logs for the new log entries**
3. **Run the analysis script if possible**
4. **Share the specific log entries you see**
5. **We can then pinpoint exactly where the failure occurs**

The enhanced logging will show us exactly where ObjectIDs are created and where they're failing, making it much easier to debug the issue!
