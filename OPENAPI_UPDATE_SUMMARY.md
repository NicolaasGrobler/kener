# OpenAPI Specification Update Summary

## Overview

The Kener OpenAPI specification has been successfully updated to include the new **Category Management API** endpoints.

## Files Updated

1. **[openapi.yaml](openapi.yaml)** - Main OpenAPI 3.0.0 specification (YAML format)
2. **[openapi.json](openapi.json)** - JSON version (auto-generated from YAML)

## What Was Added

### 1. New Tag: Categories

Added a new API category tag for organizing the category management endpoints:

```yaml
- name: Categories
  description: APIs to manage category groups for the home page
```

### 2. New Schemas

Added three new component schemas:

- **`Category`** - Main category object schema
  - `name` (string, required) - Category name
  - `description` (string) - Category description
  - `isHidden` (boolean) - Visibility flag

- **`CategoryCreateRequest`** - Request body for creating categories
  - Same fields as Category but as a create request

- **`CategoryUpdateRequest`** - Request body for updating categories
  - All fields optional (for partial updates)

### 3. New Response Definitions

Added standard HTTP response schemas:

- **`Response403`** - Forbidden (insufficient permissions)
- **`Response404`** - Not Found (resource doesn't exist)
- **`Response409`** - Conflict (duplicate resource)

### 4. New Examples

Added example request/response bodies:

- `CategoriesListResponse` - Array of categories
- `CategoryCreateRequest` - Create category example
- `CategoryUpdateRequest` - Update category example

### 5. New API Endpoints

Added 6 new endpoints under the `/manage/app/api/categories` path:

#### GET /manage/app/api/categories
- **Operation ID**: `getAllCategories`
- **Description**: Retrieve all category groups
- **Auth**: Bearer token (session-based)
- **Responses**: 200 (success), 401 (unauthorized)

#### POST /manage/app/api/categories
- **Operation ID**: `createCategory`
- **Description**: Create a new category
- **Auth**: Bearer token (admin/editor only)
- **Responses**: 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 409 (conflict)

#### PUT /manage/app/api/categories
- **Operation ID**: `bulkUpdateCategories`
- **Description**: Replace all categories with a new list
- **Auth**: Bearer token (admin/editor only)
- **Responses**: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden)

#### GET /manage/app/api/categories/{name}
- **Operation ID**: `getCategory`
- **Description**: Get a specific category by name
- **Auth**: Bearer token (session-based)
- **Responses**: 200 (success), 401 (unauthorized), 404 (not found)

#### PUT /manage/app/api/categories/{name}
- **Operation ID**: `updateCategory`
- **Description**: Update a category's properties
- **Auth**: Bearer token (admin/editor only)
- **Responses**: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict)

#### PATCH /manage/app/api/categories/{name}
- **Operation ID**: `patchCategory`
- **Description**: Partially update a category
- **Auth**: Bearer token (admin/editor only)
- **Responses**: Same as PUT

#### DELETE /manage/app/api/categories/{name}
- **Operation ID**: `deleteCategory`
- **Description**: Delete a category (except 'Home')
- **Auth**: Bearer token (admin/editor only)
- **Responses**: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found)

## Security

All category endpoints use Bearer authentication:
```yaml
security:
  - bearerAuth: []
```

**Permission Requirements**:
- **Read operations** (GET): Any authenticated user
- **Write operations** (POST, PUT, PATCH, DELETE): Admin or Editor role only

## Special Rules Documented

1. **Home Category Protection**:
   - Cannot be deleted
   - Cannot be renamed
   - Must always be the first category in bulk updates

2. **URL Encoding**:
   - Category names in path parameters should be URL-encoded
   - Example: "API Services" → "API%20Services"

3. **Uniqueness**:
   - Category names must be unique
   - Creating duplicate names returns 409 Conflict

## Viewing the Specification

### Option 1: Use Swagger Editor

1. Go to https://editor.swagger.io/
2. File → Import File → Select `openapi.yaml` or `openapi.json`
3. View the interactive documentation

### Option 2: Use Swagger UI (if installed)

```bash
# Install Swagger UI globally
npm install -g swagger-ui-dist

# Serve the spec
swagger-ui serve openapi.yaml
```

### Option 3: Use Redoc

```bash
npx @redocly/cli preview-docs openapi.yaml
```

### Option 4: VSCode Extension

Install the "OpenAPI (Swagger) Editor" extension in VSCode and open the YAML file.

## Validation

To validate the OpenAPI specification:

```bash
# Using Redocly CLI
npx @redocly/cli lint openapi.yaml

# Using Swagger CLI
npx swagger-cli validate openapi.yaml
```

## Integration

This OpenAPI spec can be used to:

1. **Generate Client SDKs** - Use OpenAPI generators to create client libraries in various languages
2. **API Documentation** - Host with Swagger UI, Redoc, or other documentation tools
3. **API Testing** - Import into Postman, Insomnia, or other API testing tools
4. **Type Generation** - Generate TypeScript types with `openapi-typescript`
5. **Mock Servers** - Create mock API servers for development

## Example Usage with OpenAPI Generator

Generate a client library:

```bash
# TypeScript Fetch
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./generated/typescript-client

# Python
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./generated/python-client

# Go
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g go \
  -o ./generated/go-client
```

## Change Log

### Version 3.0.0 (2026-01-29)

**Added**:
- New "Categories" tag and endpoints
- 6 new category management endpoints
- 3 new schemas (Category, CategoryCreateRequest, CategoryUpdateRequest)
- 3 new response definitions (403, 404, 409)
- 3 new example definitions
- Full CRUD operations for category groups
- Role-based access control documentation
- Special rules and constraints documentation

**Modified**:
- None (backwards compatible addition)

**Deprecated**:
- None

## Notes

- The specification follows OpenAPI 3.0.0 standard
- All endpoints use JSON for request/response bodies
- Authentication uses session-based bearer tokens
- The spec is backwards compatible with existing Monitors and Incidents endpoints
- Validation rules are documented in endpoint descriptions

## Related Documentation

- [Category API Documentation](CATEGORY_API_DOCUMENTATION.md) - Detailed API usage guide
- [Quick API Test Guide](QUICK_API_TEST.md) - Browser console and cURL examples
- [Test HTML Interface](static/test-category-api.html) - Interactive test page

## Maintenance

To keep the specification up to date:

1. Edit the YAML file (`openapi.yaml`)
2. Regenerate JSON: `npx js-yaml openapi.yaml > openapi.json`
3. Validate: `npx @redocly/cli lint openapi.yaml`
4. Update version number if making breaking changes

---

**Last Updated**: 2026-01-29
**Specification Version**: 3.0.0
**OpenAPI Version**: 3.0.0
