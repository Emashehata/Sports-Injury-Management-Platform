import { User } from "../shared/models/user.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function getAllUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users.json`);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Error fetching users"
      };
    }

    const data = await response.json();

    if (!data) {
      return {
        success: true,
        data: [],
        message: "No users found"
      };
    }

    const users = Object.entries(data).map(([key, value]) => {
      return new User({
        id: key,
        ...value
      });
    });

    return {
      success: true,
      data: users,
      message: "Users fetched successfully"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
      message: "Unexpected error"
    };
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
      return {
        success: false,
        data: null,
        message: validationError
      };
    }

    const usersRes = await getAllUsers();
    const users = usersRes.data || [];

    const emailExists = users.some(u => u.email === user.email);

    if (emailExists) {
      return {
        success: false,
        data: null,
        message: `Email "${user.email}" already exists`
      };
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

    return {
      success: true,
      data: user,
      message: "User created successfully"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message: "Something went wrong"
    };
  }
}

export async function getUserById(id) {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}.json`);
    const data = await res.json();

    if (!data) {
      return {
        success: false,
        data: null,
        message: "User not found"
      };
    }

    return {
      success: true,
      data: {
        id,
        ...data
      },
      message: "User found"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message: "Error fetching user"
    };
  }
}
export async function updateUser(id, updatedData) {
  try {
    const existingUserRes = await getUserById(id);

    if (!existingUserRes.success) {
      return {
        success: false,
        data: null,
        message: "User not found"
      };
    }

    const response = await fetch(`${BASE_URL}/users/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: "Failed to update user"
      };
    }

    return {
      success: true,
      data: {
        ...existingUserRes.data,
        ...updatedData
      },
      message: "User updated successfully"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message: "Something went wrong"
    };
  }
}
export async function deleteUser(id) {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}.json`, {
      method: "DELETE"
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: "Failed to delete user"
      };
    }

    return {
      success: true,
      data: null,
      message: "User deleted successfully"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message: "Something went wrong"
    };
  }
}
export async function searchUsers(keyword) {
  try {
    const usersRes = await getAllUsers();
    const users = usersRes.data || [];

    if (!keyword) {
      return {
        success: true,
        data: users,
        message: "All users returned"
      };
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.email?.toLowerCase().includes(keyword.toLowerCase()) ||
      user.user_type?.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      success: true,
      data: filtered,
      message: "Search completed"
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
      message: "Search failed"
    };
  }
}