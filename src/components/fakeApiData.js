// Independent object with all HTTP verbs
export const independentResource = {
  GET: {
    description: "Fetch all items",
    response: [
      {
        id: 1,
        name: "Item 1",
        price: 99.99,
        quantity: 10,
        available: true,
        createdAt: "2025-09-28T12:00:00Z",
        updatedAt: "2025-09-28T12:30:00Z",
        category: "Electronics",
        rating: 4.5,
        tags: ["sale", "new"],
        discount: 15.0,
        seller: "John Doe",
        isFeatured: false,
        weight: 1.25,
        dimensions: { length: 10, width: 5, height: 2 },
        color: "Red"
      },
      {
        id: 2,
        name: "Item 2",
        price: 49.5,
        quantity: 5,
        available: false,
        createdAt: "2025-09-27T09:00:00Z",
        updatedAt: "2025-09-27T10:00:00Z",
        category: "Books",
        rating: 3.8,
        tags: ["bestseller"],
        discount: 0.0,
        seller: "Jane Smith",
        isFeatured: true,
        weight: 0.75,
        dimensions: { length: 8, width: 6, height: 1 },
        color: "Blue"
      }
    ]
  },
  POST: {
    description: "Create a new item",
    request: {
      name: "New Item",
      price: 120.0,
      quantity: 20,
      available: true,
      category: "Home",
      tags: ["popular", "discount"],
      seller: "Alice",
      isFeatured: false,
      weight: 2.0,
      dimensions: { length: 12, width: 7, height: 3 },
      color: "Green",
      createdAt: "2025-09-28T13:00:00Z"
    },
    response: {
      id: 3,
      name: "New Item",
      price: 120.0,
      quantity: 20,
      available: true,
      category: "Home",
      tags: ["popular", "discount"],
      seller: "Alice",
      isFeatured: false,
      weight: 2.0,
      dimensions: { length: 12, width: 7, height: 3 },
      color: "Green",
      createdAt: "2025-09-28T13:00:00Z"
    }
  },
  PUT: {
    description: "Update an item",
    request: {
      id: 1,
      name: "Updated Item",
      price: 89.99,
      quantity: 15,
      available: true,
      category: "Electronics",
      tags: ["updated"],
      seller: "John Doe",
      isFeatured: true,
      weight: 1.3,
      dimensions: { length: 10, width: 5, height: 2 },
      color: "Yellow",
      updatedAt: "2025-09-28T14:00:00Z"
    },
    response: {
      id: 1,
      name: "Updated Item",
      price: 89.99,
      quantity: 15,
      available: true,
      category: "Electronics",
      tags: ["updated"],
      seller: "John Doe",
      isFeatured: true,
      weight: 1.3,
      dimensions: { length: 10, width: 5, height: 2 },
      color: "Yellow",
      updatedAt: "2025-09-28T14:00:00Z"
    }
  },
  DELETE: {
    description: "Delete an item",
    request: { id: 1 },
    response: { success: true, deletedId: 1, deletedAt: "2025-09-28T15:00:00Z" }
  }
};
