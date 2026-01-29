# Triggers and Alerts API Documentation

Complete API documentation for managing notification triggers, alerts, and monitor trigger configurations.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Triggers API](#triggers-api)
4. [Alerts API](#alerts-api)
5. [Monitor Trigger Configuration API](#monitor-trigger-configuration-api)
6. [Data Models](#data-models)
7. [Usage Examples](#usage-examples)

---

## Overview

The Kener API provides comprehensive endpoints for managing:

- **Triggers**: Notification channels (webhook, Discord, Slack, email)
- **Alerts**: System-generated alert history from monitor checks
- **Monitor Trigger Configurations**: Alert settings on individual monitors

**Base URL**: `/manage/app/api`

---

## Authentication

All endpoints require session-based authentication (cookies).

**Permission Requirements**:
- **Read operations** (GET): Any authenticated user
- **Write operations** (POST, PUT, PATCH, DELETE): Admin or Editor role only

---

## Triggers API

Manage notification channels for sending alerts.

### 1. Get All Triggers

**Endpoint**: `GET /manage/app/api/triggers`

**Query Parameters**:
- `status` (optional): Filter by status (`ACTIVE` or `INACTIVE`)

**Response**:
```json
[
  {
    "id": 1,
    "name": "Production Webhook",
    "trigger_type": "webhook",
    "trigger_desc": "Main production webhook",
    "trigger_status": "ACTIVE",
    "trigger_meta": "{\"url\":\"https://example.com/webhook\",\"headers\":[]}",
    "created_at": "2025-01-20 10:00:00",
    "updated_at": "2025-01-20 10:00:00"
  }
]
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Not logged in
- `500 Internal Server Error` - Server error

---

### 2. Get Specific Trigger

**Endpoint**: `GET /manage/app/api/triggers/{id}`

**Path Parameters**:
- `id` (integer, required): Trigger ID

**Response**:
```json
{
  "id": 1,
  "name": "Production Webhook",
  "trigger_type": "webhook",
  "trigger_desc": "Main production webhook",
  "trigger_status": "ACTIVE",
  "trigger_meta": "{\"url\":\"https://example.com/webhook\"}",
  "created_at": "2025-01-20 10:00:00",
  "updated_at": "2025-01-20 10:00:00"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid trigger ID
- `401 Unauthorized` - Not logged in
- `404 Not Found` - Trigger not found
- `500 Internal Server Error` - Server error

---

### 3. Create New Trigger

**Endpoint**: `POST /manage/app/api/triggers`

**Authentication**: Admin or Editor role required

**Request Body**:
```json
{
  "name": "Slack Alerts",
  "trigger_type": "slack",
  "trigger_desc": "Slack notifications for production",
  "trigger_status": "ACTIVE",
  "trigger_meta": "{\"url\":\"https://hooks.slack.com/services/xxx\"}"
}
```

**Required Fields**:
- `name` (string): Trigger name (must be unique)
- `trigger_type` (string): One of: `webhook`, `discord`, `slack`, `email`

**Optional Fields**:
- `trigger_desc` (string): Description (default: "")
- `trigger_status` (string): `ACTIVE` or `INACTIVE` (default: "ACTIVE")
- `trigger_meta` (string): JSON configuration (default: "{}")

**Response**: Created trigger object (same as GET)

**Status Codes**:
- `201 Created` - Trigger created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Trigger name already exists
- `500 Internal Server Error` - Server error

---

### 4. Update Trigger

**Endpoint**: `PUT /manage/app/api/triggers/{id}`
**Alternative**: `PATCH /manage/app/api/triggers/{id}`

**Authentication**: Admin or Editor role required

**Path Parameters**:
- `id` (integer, required): Trigger ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Slack Alerts",
  "trigger_type": "slack",
  "trigger_desc": "Updated description",
  "trigger_status": "INACTIVE",
  "trigger_meta": "{\"url\":\"https://hooks.slack.com/services/yyy\"}"
}
```

**Response**: Updated trigger object

**Status Codes**:
- `200 OK` - Trigger updated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Trigger not found
- `409 Conflict` - Name already exists
- `500 Internal Server Error` - Server error

---

### 5. Delete Trigger

**Endpoint**: `DELETE /manage/app/api/triggers/{id}`

**Authentication**: Admin or Editor role required

**Path Parameters**:
- `id` (integer, required): Trigger ID

**Response**:
```json
{
  "success": true,
  "message": "Trigger 'Slack Alerts' deleted successfully",
  "deleted": {
    "id": 1,
    "name": "Slack Alerts",
    ...
  }
}
```

**Status Codes**:
- `200 OK` - Trigger deleted successfully
- `400 Bad Request` - Invalid trigger ID
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Trigger not found
- `500 Internal Server Error` - Server error

---

## Alerts API

View system-generated alert history (read-only).

### Get Alert History

**Endpoint**: `GET /manage/app/api/alerts`

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `limit` (integer, optional): Items per page (default: 20, min: 1, max: 100)

**Response**:
```json
{
  "alerts": [
    {
      "id": 123,
      "monitor_tag": "api-server",
      "monitor_status": "DOWN",
      "alert_status": "TRIGGERED",
      "health_checks": 3,
      "incident_number": 45,
      "created_at": "2025-01-28 14:30:00",
      "updated_at": "2025-01-28 14:35:00"
    },
    {
      "id": 122,
      "monitor_tag": "database",
      "monitor_status": "DEGRADED",
      "alert_status": "RESOLVED",
      "health_checks": 5,
      "incident_number": null,
      "created_at": "2025-01-28 12:00:00",
      "updated_at": "2025-01-28 12:15:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid pagination parameters
- `401 Unauthorized` - Not logged in
- `500 Internal Server Error` - Server error

**Note**: Alerts are system-generated and cannot be created, updated, or deleted via the API.

---

## Monitor Trigger Configuration API

Manage alert trigger settings for individual monitors.

### 1. Get Monitor Trigger Configuration

**Endpoint**: `GET /manage/app/api/monitors/{tag}/triggers`

**Path Parameters**:
- `tag` (string, required): Monitor tag (URL-encode if contains spaces)

**Response**:
```json
{
  "monitor_id": 5,
  "monitor_tag": "api-server",
  "monitor_name": "API Server",
  "down_trigger": {
    "trigger_type": "DOWN",
    "failureThreshold": 3,
    "successThreshold": 2,
    "description": "API Server is down",
    "createIncident": "YES",
    "active": true,
    "severity": "critical",
    "triggers": [1, 2, 5]
  },
  "degraded_trigger": {
    "trigger_type": "DEGRADED",
    "failureThreshold": 5,
    "successThreshold": 2,
    "description": "API Server is degraded",
    "createIncident": "NO",
    "active": true,
    "severity": "warning",
    "triggers": [2]
  }
}
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Not logged in
- `404 Not Found` - Monitor not found
- `500 Internal Server Error` - Server error

---

### 2. Update Monitor Trigger Configuration

**Endpoint**: `PUT /manage/app/api/monitors/{tag}/triggers`
**Alternative**: `PATCH /manage/app/api/monitors/{tag}/triggers`

**Authentication**: Admin or Editor role required

**Path Parameters**:
- `tag` (string, required): Monitor tag

**Request Body** (provide down_trigger and/or degraded_trigger):
```json
{
  "down_trigger": {
    "trigger_type": "DOWN",
    "failureThreshold": 3,
    "successThreshold": 2,
    "description": "Monitor is completely down",
    "createIncident": "YES",
    "active": true,
    "severity": "critical",
    "triggers": [1, 2]
  },
  "degraded_trigger": {
    "trigger_type": "DEGRADED",
    "failureThreshold": 5,
    "successThreshold": 3,
    "description": "Monitor performance is degraded",
    "createIncident": "NO",
    "active": false,
    "severity": "warning",
    "triggers": []
  }
}
```

**Trigger Configuration Fields**:
- `trigger_type` (string, required): Must be "DOWN" or "DEGRADED" (matching the config type)
- `failureThreshold` (integer, required): Consecutive failures before triggering (>= 1)
- `successThreshold` (integer, required): Consecutive successes before resolving (>= 1)
- `description` (string): Alert description
- `createIncident` (string): "YES" or "NO" - Auto-create incident when triggered
- `active` (boolean): Enable/disable alerting
- `severity` (string): Alert severity (e.g., "critical", "warning")
- `triggers` (array of integers): Array of trigger IDs to send notifications to

**Response**:
```json
{
  "success": true,
  "monitor_id": 5,
  "monitor_tag": "api-server",
  "monitor_name": "API Server",
  "down_trigger": { ... },
  "degraded_trigger": { ... }
}
```

**Status Codes**:
- `200 OK` - Configuration updated successfully
- `400 Bad Request` - Invalid configuration
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Monitor not found
- `500 Internal Server Error` - Server error

**Validation Rules**:
- `trigger_type` must match the configuration type (DOWN/DEGRADED)
- Thresholds must be positive integers
- `createIncident` must be "YES" or "NO"
- `active` must be a boolean
- `triggers` must be an array of positive integers

---

## Data Models

### Trigger Object

```typescript
{
  id: number;
  name: string;                    // Unique name
  trigger_type: "webhook" | "discord" | "slack" | "email";
  trigger_desc: string;            // Description
  trigger_status: "ACTIVE" | "INACTIVE";
  trigger_meta: string;            // JSON configuration
  created_at: string;              // ISO 8601 timestamp
  updated_at: string;              // ISO 8601 timestamp
}
```

### Trigger Metadata Structure

**Webhook**:
```json
{
  "url": "https://example.com/webhook",
  "headers": [
    {"key": "Content-Type", "value": "application/json"},
    {"key": "Authorization", "value": "Bearer token"}
  ],
  "has_webhook_body": false,
  "webhook_body": ""
}
```

**Discord/Slack**:
```json
{
  "url": "https://hooks.slack.com/services/xxx",
  "has_discord_body": false,
  "discord_body": ""
}
```

**Email**:
```json
{
  "email_type": "resend",
  "to": "admin@example.com, alerts@example.com",
  "from": "Kener Alerts <noreply@example.com>",
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "smtp_user": "user",
  "smtp_pass": "password",
  "smtp_secure": true
}
```

### Alert Object

```typescript
{
  id: number;
  monitor_tag: string;             // Monitor identifier
  monitor_status: "UP" | "DOWN" | "DEGRADED";
  alert_status: "TRIGGERED" | "RESOLVED";
  health_checks: number;           // Consecutive check count
  incident_number: number | null;  // Linked incident ID
  created_at: string;              // ISO 8601 timestamp
  updated_at: string;              // ISO 8601 timestamp
}
```

### Monitor Trigger Configuration

```typescript
{
  trigger_type: "DOWN" | "DEGRADED";
  failureThreshold: number;        // Min: 1
  successThreshold: number;        // Min: 1
  description: string;
  createIncident: "YES" | "NO";
  active: boolean;
  severity: string;
  triggers: number[];              // Array of trigger IDs
}
```

---

## Usage Examples

### JavaScript/Fetch

#### Get All Active Triggers
```javascript
const triggers = await fetch('/manage/app/api/triggers?status=ACTIVE', {
  credentials: 'include'
}).then(r => r.json());

console.log(triggers);
```

#### Create a Webhook Trigger
```javascript
const newTrigger = await fetch('/manage/app/api/triggers', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Production Webhook',
    trigger_type: 'webhook',
    trigger_desc': 'Main production alert webhook',
    trigger_status: 'ACTIVE',
    trigger_meta: JSON.stringify({
      url: 'https://example.com/webhook',
      headers: [
        { key: 'Content-Type', value: 'application/json' }
      ]
    })
  })
}).then(r => r.json());

console.log('Created trigger:', newTrigger);
```

#### Update a Trigger
```javascript
const updated = await fetch('/manage/app/api/triggers/1', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trigger_status: 'INACTIVE'
  })
}).then(r => r.json());

console.log('Updated trigger:', updated);
```

#### Delete a Trigger
```javascript
const deleted = await fetch('/manage/app/api/triggers/1', {
  method: 'DELETE',
  credentials: 'include'
}).then(r => r.json());

console.log(deleted.message);
```

#### Get Alert History
```javascript
const alerts = await fetch('/manage/app/api/alerts?page=1&limit=20', {
  credentials: 'include'
}).then(r => r.json());

console.log(`Total alerts: ${alerts.pagination.total}`);
console.log('Alerts:', alerts.alerts);
```

#### Get Monitor Trigger Configuration
```javascript
const config = await fetch('/manage/app/api/monitors/api-server/triggers', {
  credentials: 'include'
}).then(r => r.json());

console.log('Down trigger:', config.down_trigger);
console.log('Degraded trigger:', config.degraded_trigger);
```

#### Update Monitor Trigger Configuration
```javascript
const updated = await fetch('/manage/app/api/monitors/api-server/triggers', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    down_trigger: {
      trigger_type: 'DOWN',
      failureThreshold: 3,
      successThreshold: 2,
      description: 'API Server is down',
      createIncident: 'YES',
      active: true,
      severity: 'critical',
      triggers: [1, 2]  // Send to webhook and slack triggers
    }
  })
}).then(r => r.json());

console.log('Updated configuration:', updated);
```

---

### cURL Examples

#### Create Trigger
```bash
curl -X POST http://localhost:3000/manage/app/api/triggers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Slack Production",
    "trigger_type": "slack",
    "trigger_desc": "Slack notifications",
    "trigger_status": "ACTIVE",
    "trigger_meta": "{\"url\":\"https://hooks.slack.com/services/xxx\"}"
  }'
```

#### Get Alerts
```bash
curl -X GET "http://localhost:3000/manage/app/api/alerts?page=1&limit=10" \
  -b cookies.txt
```

#### Update Monitor Triggers
```bash
curl -X PUT http://localhost:3000/manage/app/api/monitors/api-server/triggers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "down_trigger": {
      "trigger_type": "DOWN",
      "failureThreshold": 3,
      "successThreshold": 2,
      "description": "API is down",
      "createIncident": "YES",
      "active": true,
      "severity": "critical",
      "triggers": [1]
    }
  }'
```

---

## Important Notes

1. **Trigger Metadata**: The `trigger_meta` field must be a valid JSON string. Each trigger type has its own metadata structure.

2. **Alert Lifecycle**: Alerts are automatically created by the monitoring system when monitors fail. They cannot be manually created or deleted via the API.

3. **Monitor Trigger Configuration**: Each monitor can have two separate trigger configurations:
   - `down_trigger`: Activated when monitor status is DOWN
   - `degraded_trigger`: Activated when monitor status is DEGRADED

4. **Auto-Incident Creation**: When `createIncident` is set to "YES", an incident will be automatically created and linked to the alert when triggered.

5. **Trigger IDs**: The `triggers` array in monitor configuration must reference existing active trigger IDs. Invalid IDs will cause validation errors.

6. **Threshold Behavior**:
   - `failureThreshold`: Number of consecutive failures before triggering an alert
   - `successThreshold`: Number of consecutive successes before resolving an alert

7. **URL Encoding**: Monitor tags in URLs should be URL-encoded if they contain special characters or spaces.

8. **Session Authentication**: All API calls must include session cookies (`credentials: 'include'` in fetch).

9. **Permission Levels**:
   - **Members**: Can view triggers and alerts
   - **Editors**: Can create/update/delete triggers and monitor configurations
   - **Admins**: Full access to all operations

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:
- 400: Invalid input, validation failure
- 401: Not authenticated
- 403: Insufficient permissions (not admin/editor)
- 404: Resource not found (trigger, monitor, etc.)
- 409: Conflict (duplicate name)
- 500: Server error

---

## Related Documentation

- [Category API Documentation](CATEGORY_API_DOCUMENTATION.md)
- [OpenAPI Specification](openapi.yaml)
- [Quick API Test Guide](QUICK_API_TEST.md)

---

**Last Updated**: 2026-01-29
**API Version**: 3.0.0
