# 🔧 Timeout Fix Guide

## **🎯 Root Cause Identified**

From your logs, the issue is clear:
- ✅ ObjectID validation is working perfectly
- ❌ **Pa11y is timing out after 30 seconds** instead of 5 minutes
- ❌ The timeout configuration wasn't properly applied

## **🔍 What the Logs Show**

```
[2025-08-25T17:47:17.404Z] INFO: Starting task run
[68a76a1921c651005a22bab9]  > Running Pa11y on URL https://docs.pydantic.dev/latest/
[68a76a1921c651005a22bab9]  > Launching Headless Chrome
model:task:runById failed, with id: 68a76a1921c651005a22bab9
Pa11y timed out (30000ms)  ← This should be 300000ms (5 minutes)
```

## **🔧 Fixes Applied**

### **1. Fixed Webservice Timeout Configuration**
```javascript
// In config.js - Changed from 6000ms to 300000ms
timeout: Number(env('WEBSERVICE_TIMEOUT', '300000')),
workers: Number(env('WEBSERVICE_WORKERS', '2'))
```

### **2. Fixed Task Creation Default Timeout**
```javascript
// In route/new.js - Changed from undefined to 300000ms
timeout: body.timeout || 300000, // Default to 5 minutes
```

### **3. Enhanced Logging**
- Added timeout tracking in task creation
- Shows timeout in minutes for easier debugging

## **🚀 Deployment Steps**

### **Step 1: Deploy the Fixes**
```bash
git add .
git commit -m "Fix Pa11y timeout configuration - set to 5 minutes"
git push
```

### **Step 2: Update Existing Tasks (if needed)**
After deployment, if you have existing tasks, run:
```bash
node fix-existing-tasks.js
```

This will update all existing tasks to use the 5-minute timeout.

### **Step 3: Set Render Environment Variables**
In your Render dashboard, set these environment variables:
```
NODE_ENV=production
WEBSERVICE_TIMEOUT=300000
WEBSERVICE_WORKERS=2
```

## **📊 Expected Results**

After the fixes:

### **New Tasks:**
- Will automatically get 5-minute timeout (300000ms)
- Logs will show: `timeoutInMinutes: 5`

### **Existing Tasks:**
- Will be updated to 5-minute timeout
- No more 30-second timeouts

### **Logs Will Show:**
```
[timestamp] INFO: Task data prepared {
  timeout: 300000,
  timeoutInMinutes: 5
}
```

## **🔍 Verification**

After deployment, test with a new task:

1. **Create a new task** - should show 5-minute timeout in logs
2. **Run the task** - should have 5 minutes to complete
3. **Check logs** - should see timeout in minutes

## **🐛 Why It Was Taking So Long**

The issue wasn't MongoDB Atlas - it was:

1. **Webservice timeout**: Set to 6 seconds instead of 5 minutes
2. **Task timeout**: Set to undefined instead of 5 minutes
3. **Pa11y default**: Falling back to 30 seconds when no timeout specified

## **⚡ Performance Impact**

- **Before**: Tasks failed after 30 seconds
- **After**: Tasks have 5 minutes to complete
- **Complex websites**: Will now have enough time to load and test
- **Simple websites**: Will complete faster, not using full 5 minutes

## **🔄 Next Steps**

1. **Deploy the fixes**
2. **Test with a new task**
3. **Monitor logs for timeout settings**
4. **Run fix script if you have existing tasks**

The timeout issue should be completely resolved after these changes!
