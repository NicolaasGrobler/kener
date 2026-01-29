// @ts-nocheck
import { json } from "@sveltejs/kit";
import {
  GetSiteDataByKey,
  InsertKeyValue,
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
 * GET /manage/app/api/categories
 * Retrieve all categories
 */
export async function GET({ cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    // Fetch categories from database
    const categories = await GetSiteDataByKey("categories");

    if (!categories) {
      // Return default "Home" category if none exist
      return json([
        {
          name: "Home",
          description: "Monitors for Home Page",
          isHidden: false
        }
      ], { status: 200 });
    }

    return json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /manage/app/api/categories
 * Create a new category
 *
 * Body: {
 *   name: string,
 *   description?: string,
 *   isHidden?: boolean
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
    const newCategory = await request.json();

    // Validate required fields
    if (!newCategory.name || typeof newCategory.name !== "string" || newCategory.name.trim().length === 0) {
      return json({ error: "Category name is required and must be a non-empty string" }, { status: 400 });
    }

    // Fetch existing categories
    let categories = await GetSiteDataByKey("categories");

    if (!categories) {
      categories = [
        {
          name: "Home",
          description: "Monitors for Home Page",
          isHidden: false
        }
      ];
    }

    // Check if category already exists
    const existingCategory = categories.find(cat => cat.name === newCategory.name);
    if (existingCategory) {
      return json({ error: `Category '${newCategory.name}' already exists` }, { status: 409 });
    }

    // Prevent creating another "Home" category
    if (newCategory.name === "Home") {
      return json({ error: "Cannot create a category named 'Home' - it already exists as the default category" }, { status: 400 });
    }

    // Add new category with defaults
    const categoryToAdd = {
      name: newCategory.name.trim(),
      description: newCategory.description || "",
      isHidden: newCategory.isHidden === true
    };

    categories.push(categoryToAdd);

    // Save to database
    await InsertKeyValue("categories", JSON.stringify(categories));

    return json(categoryToAdd, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /manage/app/api/categories
 * Update all categories (bulk operation)
 *
 * Body: Array of category objects
 */
export async function PUT({ request, cookies }) {
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
    const newCategories = await request.json();

    // Validate it's an array
    if (!Array.isArray(newCategories)) {
      return json({ error: "Request body must be an array of categories" }, { status: 400 });
    }

    // Validate each category
    for (const cat of newCategories) {
      if (!cat.name || typeof cat.name !== "string" || cat.name.trim().length === 0) {
        return json({ error: "All categories must have a valid name" }, { status: 400 });
      }
    }

    // Ensure first category is "Home"
    if (newCategories.length === 0 || newCategories[0].name !== "Home") {
      return json({ error: "First category must be 'Home'" }, { status: 400 });
    }

    // Save to database
    await InsertKeyValue("categories", JSON.stringify(newCategories));

    return json({ success: true, categories: newCategories }, { status: 200 });
  } catch (error) {
    console.error("Error updating categories:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
