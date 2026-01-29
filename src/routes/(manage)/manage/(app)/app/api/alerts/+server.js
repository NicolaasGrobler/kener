// @ts-nocheck
import { json } from "@sveltejs/kit";
import {
  GetAllAlertsPaginated,
  IsLoggedInSession,
} from "$lib/server/controllers/controller.js";

/**
 * GET /manage/app/api/alerts
 * Retrieve paginated alert history
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 *
 * Note: Alerts are read-only as they are system-generated from monitor checks
 */
export async function GET({ url, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    // Get pagination params from query string
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    let limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Validate pagination params
    if (isNaN(page) || page < 1) {
      return json({ error: "Invalid page number. Must be >= 1" }, { status: 400 });
    }

    if (isNaN(limit) || limit < 1) {
      return json({ error: "Invalid limit. Must be >= 1" }, { status: 400 });
    }

    // Cap limit at 100
    if (limit > 100) {
      limit = 100;
    }

    // Fetch alerts from database
    const result = await GetAllAlertsPaginated({ page, limit });

    // Calculate pagination metadata
    const totalCount = result.total?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return json({
      alerts: result.alerts || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
