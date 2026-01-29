# Quick API Testing Guide

## Method 1: Browser DevTools Console

1. Open your Kener management interface in the browser
2. Press F12 to open DevTools
3. Go to the Console tab
4. Copy and paste these commands:

### Get All Categories
```javascript
fetch('/manage/app/api/categories', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

### Create a Category
```javascript
fetch('/manage/app/api/categories', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Infrastructure',
    description: 'Cloud Infrastructure Monitoring',
    isHidden: false
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Get Specific Category
```javascript
fetch('/manage/app/api/categories/Infrastructure', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

### Update a Category
```javascript
fetch('/manage/app/api/categories/Infrastructure', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Updated: Cloud Infrastructure Monitoring'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Delete a Category
```javascript
fetch('/manage/app/api/categories/Infrastructure', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Method 2: cURL Commands

Open your terminal and run these commands (replace `localhost:3000` with your server URL):

### Get All Categories
```bash
curl -X GET http://localhost:3000/manage/app/api/categories \
  -H "Cookie: your_session_cookie_here" \
  -v
```

### Create a Category
```bash
curl -X POST http://localhost:3000/manage/app/api/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie_here" \
  -d '{
    "name": "Infrastructure",
    "description": "Cloud Infrastructure Monitoring",
    "isHidden": false
  }' \
  -v
```

### Update a Category
```bash
curl -X PUT http://localhost:3000/manage/app/api/categories/Infrastructure \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie_here" \
  -d '{
    "description": "Updated Description"
  }' \
  -v
```

### Delete a Category
```bash
curl -X DELETE http://localhost:3000/manage/app/api/categories/Infrastructure \
  -H "Cookie: your_session_cookie_here" \
  -v
```

**To get your session cookie:**
1. Open DevTools (F12) in your browser while logged into Kener
2. Go to Application/Storage tab → Cookies
3. Copy the session cookie value

---

## Method 3: Thunder Client / Postman

1. Install Thunder Client extension in VSCode (or use Postman)
2. Import this collection:

### Thunder Client Collection
```json
{
  "clientName": "Thunder Client",
  "collectionName": "Kener Category API",
  "requests": [
    {
      "name": "Get All Categories",
      "method": "GET",
      "url": "http://localhost:3000/manage/app/api/categories"
    },
    {
      "name": "Create Category",
      "method": "POST",
      "url": "http://localhost:3000/manage/app/api/categories",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"name\": \"Infrastructure\",\n  \"description\": \"Cloud Infrastructure Monitoring\",\n  \"isHidden\": false\n}"
      }
    },
    {
      "name": "Get Category by Name",
      "method": "GET",
      "url": "http://localhost:3000/manage/app/api/categories/Infrastructure"
    },
    {
      "name": "Update Category",
      "method": "PUT",
      "url": "http://localhost:3000/manage/app/api/categories/Infrastructure",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"description\": \"Updated Description\"\n}"
      }
    },
    {
      "name": "Delete Category",
      "method": "DELETE",
      "url": "http://localhost:3000/manage/app/api/categories/Infrastructure"
    }
  ]
}
```

---

## Method 4: Test HTML (Served from Kener)

Access the interactive test page at:
```
http://localhost:3000/test-category-api.html
```

**Important:** You must be logged into the Kener management interface first!

---

## Quick Test Sequence

Run these commands in DevTools Console to test the full workflow:

```javascript
// 1. Get all categories
await fetch('/manage/app/api/categories', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log('All Categories:', d));

// 2. Create a new category
await fetch('/manage/app/api/categories', {
  method: 'POST',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test API',
    description: 'Testing the Category API',
    isHidden: false
  })
}).then(r => r.json()).then(d => console.log('Created:', d));

// 3. Get the specific category
await fetch('/manage/app/api/categories/Test API', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log('Retrieved:', d));

// 4. Update it
await fetch('/manage/app/api/categories/Test API', {
  method: 'PUT',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    description: 'Updated via API!',
    isHidden: true
  })
}).then(r => r.json()).then(d => console.log('Updated:', d));

// 5. Delete it
await fetch('/manage/app/api/categories/Test API', {
  method: 'DELETE',
  credentials: 'include'
}).then(r => r.json()).then(d => console.log('Deleted:', d));

// 6. Verify it's gone
await fetch('/manage/app/api/categories', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log('Final Categories:', d));
```
