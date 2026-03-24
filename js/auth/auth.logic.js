import { User } from "../../shared/models/user.model.js";
import { STORAGE_KEYS } from "../../shared/js/storage-keys.js";
import { usersLogic } from "../../services/users.logic.js";
import { usersService } from "../../services/users.service.js";
import { usersValidation } from "../../shared/js/users.validation.js";

class AuthLogic {
  async login(email, password) {
    const result = await usersLogic.getUserWithIndexByEmail(email);

    if (!result) {
      return {
        success: false,
        message: "Email not found.",
        user: null
      };
    }

    if (result.user.password !== password) {
      return {
        success: false,
        message: "Wrong password.",
        user: null
      };
    }

    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(result.user)
    );

    return {
      success: true,
      message: "Login successful.",
      user: result.user
    };
  }

  async register(userData) {
    const validation = usersValidation.validateUser(userData);

    if (!validation.isValid) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validation.errors,
        user: null
      };
    }

    const isEmailExists = await usersLogic.isEmailExists(userData.email);
    if (isEmailExists) {
      return {
        success: false,
        message: "Email already exists.",
        errors: {
          email: "Email already exists."
        },
        user: null
      };
    }

    const isIdExists = await usersLogic.isCustomIdExists(userData.id);
    if (isIdExists) {
      return {
        success: false,
        message: "User ID already exists.",
        errors: {
          id: "User ID already exists."
        },
        user: null
      };
    }

    const user = new User(userData);
    const createdUser = await usersService.addUser(user);

    return {
      success: true,
      message: "Register successful.",
      errors: {},
      user: createdUser
    };
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  isAdmin() {
    const currentUser = this.getCurrentUser();
    return currentUser?.user_type === "admin";
  }

  isPlayer() {
    const currentUser = this.getCurrentUser();
    return currentUser?.user_type === "player";
  }

  isSpecialist() {
    const currentUser = this.getCurrentUser();
    return currentUser?.user_type === "specialist";
  }
}

export const authLogic = new AuthLogic();