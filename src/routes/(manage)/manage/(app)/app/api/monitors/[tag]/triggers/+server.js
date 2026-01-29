// @ts-nocheck
import { json } from "@sveltejs/kit";
import {
  UpdateTriggerData,
  IsLoggedInSession,
} from "$lib/server/controllers/controller.js";
import { db } from "$lib/server/db/db.js";

/**
 * Role-based access control helpers
 */
function AdminEditorCan(role) {
  if (role !== "admin" && role !== "editor") {
    throw new Error("Only Admins and Editors can perform this action");
  }
}

/**
 * GET /manage/app/api/monitors/[tag]/triggers
 * Retrieve trigger configuration for a specific monitor
 */
export async function GET({ params, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const monitorTag = decodeURIComponent(params.tag);

    // Fetch monitor from database
    const monitor = await db.getMonitorByTag(monitorTag);

    if (!monitor) {
      return json({ error: `Monitor with tag '${monitorTag}' not found` }, { status: 404 });
    }

    // Parse trigger configurations
    let downTrigger = null;
    let degradedTrigger = null;

    try {
      downTrigger = monitor.down_trigger ? JSON.parse(monitor.down_trigger) : null;
    } catch (e) {
      console.error("Error parsing down_trigger:", e);
    }

    try {
      degradedTrigger = monitor.degraded_trigger ? JSON.parse(monitor.degraded_trigger) : null;
    } catch (e) {
      console.error("Error parsing degraded_trigger:", e);
    }

    return json({
      monitor_id: monitor.id,
      monitor_tag: monitor.tag,
      monitor_name: monitor.name,
      down_trigger: downTrigger,
      degraded_trigger: degradedTrigger
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching monitor triggers:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /manage/app/api/monitors/[tag]/triggers
 * Update trigger configuration for a specific monitor
 *
 * Body: {
 *   down_trigger?: {
 *     trigger_type: "DOWN",
 *     failureThreshold: number,
 *     successThreshold: number,
 *     description: string,
 *     createIncident: "YES" | "NO",
 *     active: boolean,
 *     severity: string,
 *     triggers: number[]
 *   },
 *   degraded_trigger?: {
 *     trigger_type: "DEGRADED",
 *     failureThreshold: number,
 *     successThreshold: number,
 *     description: string,
 *     createIncident: "YES" | "NO",
 *     active: boolean,
 *     severity: string,
 *     triggers: number[]
 *   }
 * }
 */
export async function PUT({ params, request, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const userDB = isLoggedIn.user;

    // Check permissions
    AdminEditorCan(userDB.role);

    const monitorTag = decodeURIComponent(params.tag);

    // Parse request body
    const updates = await request.json();

    // Fetch monitor from database
    const monitor = await db.getMonitorByTag(monitorTag);

    if (!monitor) {
      return json({ error: `Monitor with tag '${monitorTag}' not found` }, { status: 404 });
    }

    // Validate trigger configurations if provided
    if (updates.down_trigger) {
      const validationError = validateTriggerConfig(updates.down_trigger, "DOWN");
      if (validationError) {
        return json({ error: `down_trigger: ${validationError}` }, { status: 400 });
      }
    }

    if (updates.degraded_trigger) {
      const validationError = validateTriggerConfig(updates.degraded_trigger, "DEGRADED");
      if (validationError) {
        return json({ error: `degraded_trigger: ${validationError}` }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      id: monitor.id
    };

    if (updates.down_trigger !== undefined) {
      updateData.down_trigger = JSON.stringify(updates.down_trigger);
    }

    if (updates.degraded_trigger !== undefined) {
      updateData.degraded_trigger = JSON.stringify(updates.degraded_trigger);
    }

    // Update monitor triggers using existing controller function
    await UpdateTriggerData(updateData);

    // Fetch updated monitor
    const updatedMonitor = await db.getMonitorByTag(monitorTag);

    // Parse and return updated trigger configurations
    let downTrigger = null;
    let degradedTrigger = null;

    try {
      downTrigger = updatedMonitor.down_trigger ? JSON.parse(updatedMonitor.down_trigger) : null;
    } catch (e) {
      console.error("Error parsing down_trigger:", e);
    }

    try {
      degradedTrigger = updatedMonitor.degraded_trigger ? JSON.parse(updatedMonitor.degraded_trigger) : null;
    } catch (e) {
      console.error("Error parsing degraded_trigger:", e);
    }

    return json({
      success: true,
      monitor_id: updatedMonitor.id,
      monitor_tag: updatedMonitor.tag,
      monitor_name: updatedMonitor.name,
      down_trigger: downTrigger,
      degraded_trigger: degradedTrigger
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating monitor triggers:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /manage/app/api/monitors/[tag]/triggers
 * Partially update trigger configuration (same as PUT)
 */
export async function PATCH({ params, request, cookies }) {
  return PUT({ params, request, cookies });
}

/**
 * Validate trigger configuration object
 */
function validateTriggerConfig(config, expectedType) {
  if (typeof config !== "object" || config === null) {
    return "Trigger configuration must be an object";
  }

  // Validate trigger_type
  if (config.trigger_type && config.trigger_type !== expectedType) {
    return `trigger_type must be "${expectedType}"`;
  }

  // Validate thresholds
  if (config.failureThreshold !== undefined) {
    if (typeof config.failureThreshold !== "number" || config.failureThreshold < 1) {
      return "failureThreshold must be a number >= 1";
    }
  }

  if (config.successThreshold !== undefined) {
    if (typeof config.successThreshold !== "number" || config.successThreshold < 1) {
      return "successThreshold must be a number >= 1";
    }
  }

  // Validate createIncident
  if (config.createIncident !== undefined) {
    if (config.createIncident !== "YES" && config.createIncident !== "NO") {
      return "createIncident must be 'YES' or 'NO'";
    }
  }

  // Validate active
  if (config.active !== undefined && typeof config.active !== "boolean") {
    return "active must be a boolean";
  }

  // Validate triggers array
  if (config.triggers !== undefined) {
    if (!Array.isArray(config.triggers)) {
      return "triggers must be an array";
    }
    if (!config.triggers.every(id => typeof id === "number" && id > 0)) {
      return "triggers array must contain positive numbers (trigger IDs)";
    }
  }

  return null; // No validation errors
}
