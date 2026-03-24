const ALLOWED_USER_TYPES = ["player", "specialist", "admin"];

class UsersValidation {
  validateName(name) {
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return "Name must be at least 3 characters.";
    }
    return "";
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      return "Invalid email address.";
    }

    return "";
  }

  validatePassword(password) {
    if (!password || password.length < 5) {
      return "Password must be at least 5 characters.";
    }
    return "";
  }

  validatePhone(phone) {
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phone || !phoneRegex.test(phone.trim())) {
      return "Invalid phone number.";
    }

    return "";
  }

  validateImgPath(imgPath) {
    if (!imgPath || typeof imgPath !== "string") {
      return "Image path is required.";
    }
    return "";
  }

  validateUserType(userType) {
    if (!ALLOWED_USER_TYPES.includes(userType)) {
      return "User type must be player, specialist, or admin.";
    }
    return "";
  }

  validateUser(userData) {
    const errors = {
      name: this.validateName(userData.name),
      email: this.validateEmail(userData.email),
      password: this.validatePassword(userData.password),
      phone: this.validatePhone(userData.phone),
      imgPath: this.validateImgPath(userData.imgPath),
      user_type: this.validateUserType(userData.user_type)
    };

    return {
      errors,
      isValid: Object.values(errors).every(error => error === "")
    };
  }
}

export const usersValidation = new UsersValidation();