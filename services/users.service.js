import { User } from "../shared/models/user.model.js";
import {BASE_URL} from "../shared/js/firebase-config.js"

class UsersService {
  async getAllUsers() {
    const response = await fetch(`${BASE_URL}/users.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    if (!data) return [];

    return data
      .filter(user => user != null)
      .map(user => new User(user));
  }

  async getUserByIndex(index) {
    const response = await fetch(`${BASE_URL}/users/${index}.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();

    return data ? new User(data) : null;
  }

  async addUser(userData) {
    const response = await fetch(`${BASE_URL}/users.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch users before add");
    }

    const users = await response.json() || [];
    const user = userData instanceof User ? userData : new User(userData);

    users.push(user.toJSON());

    const saveResponse = await fetch(`${BASE_URL}/users.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(users)
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to add user");
    }

    return user;
  }

  async updateUserByIndex(index, userData) {
    const user = userData instanceof User ? userData : new User(userData);

    const response = await fetch(`${BASE_URL}/users/${index}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user.toJSON())
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return await response.json();
  }

  async patchUserByIndex(index, partialData) {
    const response = await fetch(`${BASE_URL}/users/${index}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(partialData)
    });

    if (!response.ok) {
      throw new Error("Failed to patch user");
    }

    return await response.json();
  }

  async deleteUserByIndex(index) {
    const response = await fetch(`${BASE_URL}/users/${index}.json`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return true;
  }
}

export const usersService = new UsersService();