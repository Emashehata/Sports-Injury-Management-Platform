import { usersService } from "./users.service.js";

class UsersLogic {
  async getAllUsers() {
    return await usersService.getAllUsers();
  }

  async getUserByCustomId(id) {
    const users = await usersService.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email) {
    const users = await usersService.getAllUsers();
    return users.find(
      user => user.email.toLowerCase() === email.trim().toLowerCase()
    ) || null;
  }

  async getUserWithIndexByCustomId(id) {
    const users = await usersService.getAllUsers();
    const index = users.findIndex(user => user.id === id);

    if (index === -1) return null;

    return {
      index,
      user: users[index]
    };
  }

  async getUserWithIndexByEmail(email) {
    const users = await usersService.getAllUsers();
    const index = users.findIndex(
      user => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (index === -1) return null;

    return {
      index,
      user: users[index]
    };
  }

  async getUsersByType(userType) {
    const users = await usersService.getAllUsers();
    return users.filter(user => user.user_type === userType);
  }

  async getAdmins() {
    return await this.getUsersByType("admin");
  }

  async getPlayers() {
    return await this.getUsersByType("player");
  }

  async getSpecialists() {
    return await this.getUsersByType("specialist");
  }

  async isEmailExists(email) {
    const user = await this.getUserByEmail(email);
    return !!user;
  }

  async isCustomIdExists(id) {
    const user = await this.getUserByCustomId(id);
    return !!user;
  }
}

export const usersLogic = new UsersLogic();