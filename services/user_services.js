import { User } from "../shared/models/user.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function getAllUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users.json`);

    if (!response.ok) {
      console.error("Error fetching users");
      return [];
    }

    const data = await response.json();

    if (!data) return [];

    const users = Object.entries(data).map(([key, value]) => {
      return new User({
        id: key,
        ...value
      });
    });

    return users;

  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
function validateUser(user) {
  if (!user.name || !user.email || !user.password) {
    return "Name, Email, and Password are required";
  }

  if (!user.email.includes("@")) {
    return "Invalid email format";
  }

  if (user.password.length < 6) {
    return "Password must be at least 6 characters";
  }

  const allowedTypes = ["admin", "doctor", "player"];
  if (!allowedTypes.includes(user.user_type)) {
    return "Invalid user type";
  }

  return null;
}
export async function addUser(userData) {
  try {
    const user = new User(userData);

    const validationError = validateUser(user);
    if (validationError) {
      console.warn(validationError);
      return { success: false, message: validationError };
    }

    const users = await getAllUsers();
    
    const emailExists = users.some(u => u.email === user.email);
    if (emailExists) {
            console.warn(`Email "${user.email}" already exists!`);
            return null;
    }

    let lastId = 1000;
    if (users.length > 0) {
        const ids = users.map(u => Number(u.id));
        lastId = Math.max(...ids);
    }
    
    const newId = (lastId + 1).toString();
    user.id = newId;

    await fetch(`${BASE_URL}/users/${newId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user.toJSON())
    });

    return { success: true, data: user };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}
export async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/users/${id}.json`);
  const data = await res.json();

  if (!data) return null;

  return {
    id,
    ...data
  };
}
export async function updateUser(id, updatedData) {
  try {
    const existingUser = await getUserById(id);

    if (!existingUser) {
      return { success: false, message: "User not found" };
    }

    // Optional: email validation if updated
    if (updatedData.email) {
      const users = await getAllUsers();
      const emailExists = users.some(
        u => u.email === updatedData.email && u.id !== id
      );

      if (emailExists) {
        return { success: false, message: "Email already exists" };
      }
    }

    const response = await fetch(`${BASE_URL}/users/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      return { success: false, message: "Failed to update user" };
    }

    return {
      success: true,
      data: {
        ...existingUser,
        ...updatedData
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}
export async function deleteUser(id) {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}.json`, {
      method: "DELETE"
    });

    if (!response.ok) {
      return { success: false, message: "Failed to delete user" };
    }

    return {
      success: true,
      message: "User deleted successfully"
    };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}
export async function searchUsers(keyword) {
  try {
    const users = await getAllUsers();

    if (!keyword) {
      return { success: true, data: users };
    }

    const filteredUsers = users.filter(user =>
      user.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.email?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.user_type?.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      success: true,
      data: filteredUsers
    };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Search failed" };
  }
}
