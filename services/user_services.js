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

    let users = [];
    
    if (Array.isArray(data)) {
     
      users = data
        .filter(user => user !== null && user !== undefined) 
        .map(user => {
          return new User({
            id: user.id?.toString() || '',
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
            phone: user.phone?.toString() || '',
            imgPath: user.imgPath || '',
            user_type: user.user_type || 'player'
          });
        });
    } else {
      users = Object.entries(data).map(([key, value]) => {
        return new User({
          id: key,
          ...value
        });
      });
    }

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

async function getUsersAsObject() {
  try {
    const response = await fetch(`${BASE_URL}/users.json`);
    const data = await response.json();
    
    if (!data) return {};
    if (Array.isArray(data)) {
      const obj = {};
      data.forEach(user => {
        if (user && user.id) {
          obj[user.id] = user;
        }
      });
      return obj;
    }
    return data;
  } catch (error) {
    console.error(error);
    return {};
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

  const allowedTypes = ["admin", "player", "specialist"];
  if (!allowedTypes.includes(user.user_type)) {
    return "Invalid user type. Allowed types: " + allowedTypes.join(", ");
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

    // جلب المستخدمين الحاليين
    const usersObj = await getUsersAsObject();
    const users = Object.values(usersObj);
    
    // التحقق من وجود البريد الإلكتروني
    const emailExists = users.some(u => u.email === user.email);
    if (emailExists) {
      return {
        success: false,
        data: null,
        message: `Email "${user.email}" already exists`
      };
    }

    // إنشاء ID جديد
    let lastId = 1000;
    if (users.length > 0) {
      const ids = users.map(u => {
        const idNum = parseInt(u.id);
        return isNaN(idNum) ? 0 : idNum;
      });
      lastId = Math.max(...ids, 1000);
    }
    const newId = (lastId + 1).toString();
    user.id = newId;

    // حفظ ككائن
    const updateObj = { ...usersObj, [newId]: user.toJSON() };
    
    await fetch(`${BASE_URL}/users.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateObj)
    });

    return {
      success: true,
      data: user,
      message: "User created successfully",
      id: newId
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
    const usersObj = await getUsersAsObject();
    const data = usersObj[id];

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
    const usersObj = await getUsersAsObject();
    
    if (!usersObj[id]) {
      return {
        success: false,
        data: null,
        message: "User not found"
      };
    }

    // تحديث البيانات
    usersObj[id] = {
      ...usersObj[id],
      ...updatedData
    };

    await fetch(`${BASE_URL}/users.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usersObj)
    });

    return {
      success: true,
      data: usersObj[id],
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
    const usersObj = await getUsersAsObject();
    
    if (!usersObj[id]) {
      return {
        success: false,
        data: null,
        message: "User not found"
      };
    }

    delete usersObj[id];

    await fetch(`${BASE_URL}/users.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usersObj)
    });

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

export function getCurrentUser() {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && (user.userType === 'admin' || user.user_type === 'admin');
}

export function isPlayer() {
  const user = getCurrentUser();
  return user && (user.userType === 'player' || user.user_type === 'player');
}

export function isSpecialist() {
  const user = getCurrentUser();
  return user && (user.userType === 'specialist' || user.user_type === 'specialist');
}

export function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/index.html';
}

export function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}