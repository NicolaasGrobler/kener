# Category API Documentation

This document describes the RESTful API endpoints for managing category groups for the home page.

## Authentication

All endpoints require authentication via session cookies. Users must be logged in with either `admin` or `editor` role to create, update, or delete categories. All users can view categories.

## Endpoints

### 1. Get All Categories

Retrieve all category groups.

**Endpoint:** `GET /manage/app/api/categories`

**Authentication:** Required (any role)

**Response:**
```json
[
  {
    "name": "Home",
    "description": "Monitors for Home Page",
    "isHidden": false
  },
  {
    "name": "API",
    "description": "API Services",
    "isHidden": false
  },
  {
    "name": "Database",
    "description": "Database Monitors",
    "isHidden": true
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - User not logged in
- `500 Internal Server Error` - Server error

---

### 2. Get a Specific Category

Retrieve a single category by name.

**Endpoint:** `GET /manage/app/api/categories/[name]`

**Authentication:** Required (any role)

**Example:** `GET /manage/app/api/categories/API`

**Response:**
```json
{
  "name": "API",
  "description": "API Services",
  "isHidden": false
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - User not logged in
- `404 Not Found` - Category not found
- `500 Internal Server Error` - Server error

---

### 3. Create a New Category

Create a new category group.

**Endpoint:** `POST /manage/app/api/categories`

**Authentication:** Required (admin or editor role)

**Request Body:**
```json
{
  "name": "Frontend",
  "description": "Frontend Services",
  "isHidden": false
}
```

**Required Fields:**
- `name` (string) - Category name, must be unique and non-empty

**Optional Fields:**
- `description` (string) - Category description (default: "")
- `isHidden` (boolean) - Whether the category is hidden (default: false)

**Response:**
```json
{
  "name": "Frontend",
  "description": "Frontend Services",
  "isHidden": false
}
```

**Status Codes:**
- `201 Created` - Category created successfully
- `400 Bad Request` - Invalid input or trying to create "Home" category
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Category already exists
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Category name cannot be empty
- Cannot create a category named "Home" (reserved)
- Category name must be unique

---

### 4. Update a Specific Category

Update an existing category's properties.

**Endpoint:** `PUT /manage/app/api/categories/[name]`
**Alternative:** `PATCH /manage/app/api/categories/[name]`

**Authentication:** Required (admin or editor role)

**Example:** `PUT /manage/app/api/categories/API`

**Request Body:**
```json
{
  "name": "API Services",
  "description": "Backend API Monitors",
  "isHidden": true
}
```

**Optional Fields:**
- `name` (string) - New category name
- `description` (string) - New description
- `isHidden` (boolean) - New visibility state

**Response:**
```json
{
  "name": "API Services",
  "description": "Backend API Monitors",
  "isHidden": true
}
```

**Status Codes:**
- `200 OK` - Category updated successfully
- `400 Bad Request` - Invalid input or trying to rename "Home"
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Category not found
- `409 Conflict` - New name already exists
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Cannot rename the "Home" category
- If renaming, new name must be unique
- New name cannot be empty if provided

---

### 5. Delete a Category

Delete a category group.

**Endpoint:** `DELETE /manage/app/api/categories/[name]`

**Authentication:** Required (admin or editor role)

**Example:** `DELETE /manage/app/api/categories/API`

**Response:**
```json
{
  "success": true,
  "message": "Category 'API' deleted successfully",
  "deleted": {
    "name": "API",
    "description": "API Services",
    "isHidden": false
  }
}
```

**Status Codes:**
- `200 OK` - Category deleted successfully
- `400 Bad Request` - Trying to delete "Home" category
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Category not found
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Cannot delete the "Home" category (protected)

---

### 6. Bulk Update Categories

Replace all categories with a new list (advanced operation).

**Endpoint:** `PUT /manage/app/api/categories`

**Authentication:** Required (admin or editor role)

**Request Body:**
```json
[
  {
    "name": "Home",
    "description": "Monitors for Home Page",
    "isHidden": false
  },
  {
    "name": "API",
    "description": "API Services",
    "isHidden": false
  },
  {
    "name": "Database",
    "description": "Database Monitors",
    "isHidden": true
  }
]
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "name": "Home",
      "description": "Monitors for Home Page",
      "isHidden": false
    },
    {
      "name": "API",
      "description": "API Services",
      "isHidden": false
    },
    {
      "name": "Database",
      "description": "Database Monitors",
      "isHidden": true
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Categories updated successfully
- `400 Bad Request` - Invalid input or "Home" not first
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Request body must be an array
- All categories must have a valid name
- First category must be "Home"

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all categories
const response = await fetch('/manage/app/api/categories', {
  credentials: 'include' // Include session cookies
});
const categories = await response.json();

// Create a new category
const newCategory = await fetch('/manage/app/api/categories', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Infrastructure',
    description: 'Infrastructure Monitoring',
    isHidden: false
  })
});

// Update a category
const updated = await fetch('/manage/app/api/categories/Infrastructure', {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'Cloud Infrastructure Monitoring'
  })
});

// Delete a category
const deleted = await fetch('/manage/app/api/categories/Infrastructure', {
  method: 'DELETE',
  credentials: 'include'
});
```

### cURL

```bash
# Get all categories
curl -X GET http://localhost:3000/manage/app/api/categories \
  -b cookies.txt

# Create a new category
curl -X POST http://localhost:3000/manage/app/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Infrastructure",
    "description": "Infrastructure Monitoring",
    "isHidden": false
  }'

# Update a category
curl -X PUT http://localhost:3000/manage/app/api/categories/Infrastructure \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "description": "Cloud Infrastructure Monitoring"
  }'

# Delete a category
curl -X DELETE http://localhost:3000/manage/app/api/categories/Infrastructure \
  -b cookies.txt
```

---

## Important Notes

1. **"Home" Category Protection:**
   - The "Home" category is special and always required
   - Cannot be deleted
   - Cannot be renamed
   - Always appears first in the list

2. **URL Encoding:**
   - Category names in URLs should be URL-encoded
   - Example: "API Services" becomes "API%20Services"

3. **Case Sensitivity:**
   - Category names are case-sensitive
   - "API" and "api" are different categories

4. **Monitors Association:**
   - When you delete a category, monitors with that `category_name` won't be automatically updated
   - You may want to reassign monitors before deleting a category

5. **Session-based Authentication:**
   - These endpoints use the same authentication as the Kener management interface
   - Ensure cookies are included in requests (`credentials: 'include'` in fetch)

6. **Permissions:**
   - GET operations: Any authenticated user
   - POST/PUT/PATCH/DELETE: Admin or Editor roles only

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:
- Missing authentication
- Insufficient permissions
- Invalid input data
- Resource not found
- Conflict with existing data
