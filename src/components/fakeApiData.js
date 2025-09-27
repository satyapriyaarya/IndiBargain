// Independent object with all HTTP verbs
export const independentResource = {
  GET: {
    description: "Fetch all items",
    response: [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]
  },
  POST: {
    description: "Create a new item",
    request: { name: "New Item" },
    response: { id: 3, name: "New Item" }
  },
  PUT: {
    description: "Update an item",
    request: { id: 1, name: "Updated Item" },
    response: { id: 1, name: "Updated Item" }
  },
  DELETE: {
    description: "Delete an item",
    request: { id: 1 },
    response: { success: true }
  }
};
