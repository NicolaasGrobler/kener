// @ts-nocheck
import { json } from "@sveltejs/kit";
import {
  GetTriggerByID,
  CreateUpdateTrigger,
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
 * GET /manage/app/api/triggers/[id]
 * Retrieve a specific trigger by ID
 */
export async function GET({ params, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const triggerId = parseInt(params.id, 10);

    if (isNaN(triggerId)) {
      return json({ error: "Invalid trigger ID" }, { status: 400 });
    }

    // Fetch trigger from database
    const trigger = await GetTriggerByID(triggerId);

    if (!trigger) {
      return json({ error: `Trigger with ID ${triggerId} not found` }, { status: 404 });
    }

    return json(trigger, { status: 200 });
  } catch (error) {
    console.error("Error fetching trigger:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /manage/app/api/triggers/[id]
 * Update a specific trigger
 *
 * Body: {
 *   name?: string,
 *   trigger_type?: "webhook" | "discord" | "slack" | "email",
 *   trigger_desc?: string,
 *   trigger_status?: "ACTIVE" | "INACTIVE",
 *   trigger_meta?: string (JSON)
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

    const triggerId = parseInt(params.id, 10);

    if (isNaN(triggerId)) {
      return json({ error: "Invalid trigger ID" }, { status: 400 });
    }

    // Parse request body
    const updates = await request.json();

    // Fetch existing trigger
    const existingTrigger = await GetTriggerByID(triggerId);

    if (!existingTrigger) {
      return json({ error: `Trigger with ID ${triggerId} not found` }, { status: 404 });
    }

    // Validate trigger_type if provided
    if (updates.trigger_type) {
      const validTypes = ["webhook", "discord", "slack", "email"];
      if (!validTypes.includes(updates.trigger_type)) {
        return json({
          error: `Invalid trigger type. Must be one of: ${validTypes.join(", ")}`
        }, { status: 400 });
      }
    }

    // Validate trigger_meta is valid JSON if provided
    if (updates.trigger_meta) {
      try {
        if (typeof updates.trigger_meta === "string") {
          JSON.parse(updates.trigger_meta);
        }
      } catch (e) {
        return json({ error: "trigger_meta must be valid JSON" }, { status: 400 });
      }
    }

    // Merge updates with existing trigger
    const updatedTrigger = {
      id: triggerId,
      name: updates.name !== undefined ? updates.name.trim() : existingTrigger.name,
      trigger_type: updates.trigger_type || existingTrigger.trigger_type,
      trigger_desc: updates.trigger_desc !== undefined ? updates.trigger_desc : existingTrigger.trigger_desc,
      trigger_status: updates.trigger_status || existingTrigger.trigger_status,
      trigger_meta: updates.trigger_meta !== undefined ? updates.trigger_meta : existingTrigger.trigger_meta
    };

    // Validate name is not empty
    if (!updatedTrigger.name || updatedTrigger.name.length === 0) {
      return json({ error: "Trigger name cannot be empty" }, { status: 400 });
    }

    // Update trigger using existing controller function
    const result = await CreateUpdateTrigger(updatedTrigger);

    return json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating trigger:", error);

    // Handle unique constraint errors
    if (error.message && error.message.includes("unique")) {
      return json({ error: "A trigger with this name already exists" }, { status: 409 });
    }

    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /manage/app/api/triggers/[id]
 * Partially update a trigger (same as PUT but more semantically correct)
 */
export async function PATCH({ params, request, cookies }) {
  return PUT({ params, request, cookies });
}

/**
 * DELETE /manage/app/api/triggers/[id]
 * Delete a specific trigger
 */
export async function DELETE({ params, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const userDB = isLoggedIn.user;

    // Check permissions
    AdminEditorCan(userDB.role);

    const triggerId = parseInt(params.id, 10);

    if (isNaN(triggerId)) {
      return json({ error: "Invalid trigger ID" }, { status: 400 });
    }

    // Fetch existing trigger to verify it exists
    const existingTrigger = await GetTriggerByID(triggerId);

    if (!existingTrigger) {
      return json({ error: `Trigger with ID ${triggerId} not found` }, { status: 404 });
    }

    // Delete trigger from database
    await db.deleteTrigger(triggerId);

    return json({
      success: true,
      message: `Trigger '${existingTrigger.name}' deleted successfully`,
      deleted: existingTrigger
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting trigger:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
