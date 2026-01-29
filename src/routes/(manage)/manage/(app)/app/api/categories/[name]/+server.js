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
 * GET /manage/app/api/categories/[name]
 * Retrieve a specific category by name
 */
export async function GET({ params, cookies }) {
  try {
    // Check authentication
    const isLoggedIn = await IsLoggedInSession(cookies);
    if (!!isLoggedIn.error) {
      return json({ error: "User not logged in" }, { status: 401 });
    }

    const categoryName = decodeURIComponent(params.name);

    // Fetch categories from database
    const categories = await GetSiteDataByKey("categories");

    if (!categories) {
      return json({ error: "No categories found" }, { status: 404 });
    }

    // Find the specific category
    const category = categories.find(cat => cat.name === categoryName);

    if (!category) {
      return json({ error: `Category '${categoryName}' not found` }, { status: 404 });
    }

    return json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /manage/app/api/categories/[name]
 * Update a specific category
 *
 * Body: {
 *   name?: string,
 *   description?: string,
 *   isHidden?: boolean
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

    const categoryName = decodeURIComponent(params.name);

    // Parse request body
    const updates = await request.json();

    // Fetch existing categories
    let categories = await GetSiteDataByKey("categories");

    if (!categories) {
      return json({ error: "No categories found" }, { status: 404 });
    }

    // Find the category index
    const categoryIndex = categories.findIndex(cat => cat.name === categoryName);

    if (categoryIndex === -1) {
      return json({ error: `Category '${categoryName}' not found` }, { status: 404 });
    }

    // Prevent modifying the "Home" category name
    if (categoryName === "Home" && updates.name && updates.name !== "Home") {
      return json({ error: "Cannot rename the 'Home' category" }, { status: 400 });
    }

    // If renaming, check for conflicts
    if (updates.name && updates.name !== categoryName) {
      const existingCategory = categories.find(cat => cat.name === updates.name);
      if (existingCategory) {
        return json({ error: `Category '${updates.name}' already exists` }, { status: 409 });
      }

      // Validate new name
      if (typeof updates.name !== "string" || updates.name.trim().length === 0) {
        return json({ error: "Category name must be a non-empty string" }, { status: 400 });
      }
    }

    // Update category fields
    const updatedCategory = {
      ...categories[categoryIndex],
      ...(updates.name && { name: updates.name.trim() }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.isHidden !== undefined && { isHidden: updates.isHidden === true })
    };

    categories[categoryIndex] = updatedCategory;

    // Save to database
    await InsertKeyValue("categories", JSON.stringify(categories));

    return json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /manage/app/api/categories/[name]
 * Partially update a specific category (same as PUT but more semantically correct for partial updates)
 */
export async function PATCH({ params, request, cookies }) {
  return PUT({ params, request, cookies });
}

/**
 * DELETE /manage/app/api/categories/[name]
 * Delete a specific category
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

    const categoryName = decodeURIComponent(params.name);

    // Prevent deleting the "Home" category
    if (categoryName === "Home") {
      return json({ error: "Cannot delete the 'Home' category" }, { status: 400 });
    }

    // Fetch existing categories
    let categories = await GetSiteDataByKey("categories");

    if (!categories) {
      return json({ error: "No categories found" }, { status: 404 });
    }

    // Find the category index
    const categoryIndex = categories.findIndex(cat => cat.name === categoryName);

    if (categoryIndex === -1) {
      return json({ error: `Category '${categoryName}' not found` }, { status: 404 });
    }

    // Remove the category
    const deletedCategory = categories.splice(categoryIndex, 1)[0];

    // Save to database
    await InsertKeyValue("categories", JSON.stringify(categories));

    return json({
      success: true,
      message: `Category '${categoryName}' deleted successfully`,
      deleted: deletedCategory
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
