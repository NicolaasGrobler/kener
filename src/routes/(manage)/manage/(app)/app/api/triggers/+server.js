// @ts-nocheck
import { json } from "@sveltejs/kit";
import {
  GetAllTriggers,
  CreateUpdateTrigger,
  IsLoggedInSession,
} from "$lib/server/controllers/controller.js";

/**
 * Role-based access control helpers
 */
function AdminEditorCan(role) {
  if (role !== "admin" && role !== "editor") {
    throw new Error("Only Admins and Editors can perform this action");
  }
}

/**
 * GET /manage/app/api/triggers
 * Retrieve all triggers with optional status filter
 *
 * Query params:
 * - status: "ACTIVE" | "INACTIVE" (optional)
 */
export async function GET({ url, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    // Get optional status filter from query params
    const status = url.searchParams.get("status");

    const filterData = status ? { status } : {};

    // Fetch triggers from database
    const triggers = await GetAllTriggers(filterData);

    return json(triggers || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching triggers:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /manage/app/api/triggers
 * Create a new trigger
 *
 * Body: {
 *   name: string,
 *   trigger_type: "webhook" | "discord" | "slack" | "email",
 *   trigger_desc: string,
 *   trigger_status: "ACTIVE" | "INACTIVE",
 *   trigger_meta: string (JSON)
 * }
 */
export async function POST({ request, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const userDB = isLoggedIn.user;

    // Check permissions
    AdminEditorCan(userDB.role);

    // Parse request body
    const triggerData = await request.json();

    // Validate required fields
    if (!triggerData.name || typeof triggerData.name !== "string" || triggerData.name.trim().length === 0) {
      return json({ error: "Trigger name is required and must be a non-empty string" }, { status: 400 });
    }

    if (!triggerData.trigger_type) {
      return json({ error: "Trigger type is required" }, { status: 400 });
    }

    const validTypes = ["webhook", "discord", "slack", "email"];
    if (!validTypes.includes(triggerData.trigger_type)) {
      return json({
        error: `Invalid trigger type. Must be one of: ${validTypes.join(", ")}`
      }, { status: 400 });
    }

    // Validate trigger_meta is valid JSON if provided
    if (triggerData.trigger_meta) {
      try {
        if (typeof triggerData.trigger_meta === "string") {
          JSON.parse(triggerData.trigger_meta);
        }
      } catch (e) {
        return json({ error: "trigger_meta must be valid JSON" }, { status: 400 });
      }
    }

    // Set default values
    const newTrigger = {
      id: 0, // 0 indicates new trigger
      name: triggerData.name.trim(),
      trigger_type: triggerData.trigger_type,
      trigger_desc: triggerData.trigger_desc || "",
      trigger_status: triggerData.trigger_status || "ACTIVE",
      trigger_meta: triggerData.trigger_meta || "{}"
    };

    // Create trigger using existing controller function
    const result = await CreateUpdateTrigger(newTrigger);

    return json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating trigger:", error);

    // Handle unique constraint errors
    if (error.message && error.message.includes("unique")) {
      return json({ error: "A trigger with this name already exists" }, { status: 409 });
    }

    return json({ error: error.message }, { status: 500 });
  }
}
