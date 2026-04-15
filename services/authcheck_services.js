
import { getCurrentUser, isAdmin } from './user_services.js';

export function checkAdminAccess() {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = '../pages/auth/Login/login.html';
    return false;
  }

  if (user.userType !== 'admin') {
    if (user.userType === 'player') {
      window.location.href = '../pages/Specialists/specialist.html';
    } else if (user.userType === 'specialist') {
      window.location.href = '../pages/Specialists/specialist.html';
    } else {
      window.location.href = '../index.html';
    }
    return false;
  }
  
  return true;
}