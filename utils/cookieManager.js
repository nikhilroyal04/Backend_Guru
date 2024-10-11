const encryptionUtils = require('./encryptionUtils');

class CookieManager {
  setCookie(res, name, value, options = {}) {
    let cookieOptions = {
      httpOnly: true,
      sameSite: 'None',
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      ...options,
    };
    try {
      // Encrypt the value before setting the cookie
      const encryptedValue = encryptionUtils.encrypt(value);
      res.cookie(name, encryptedValue, cookieOptions);
    } catch (error) {
      console.error(`Error setting cookie '${name}': ${error.message}`);
      // Fallback to local storage
      this.setLocalStorage(name, value);
    }
  }

  getCookie(req, name) {
    try {
      const encryptedValue = req.cookies[name];
      // Decrypt the value before returning
      return encryptedValue ? encryptionUtils.decrypt(encryptedValue) : this.getLocalStorage(name);
    } catch (error) {
      console.error(`Error getting cookie '${name}': ${error.message}`);
      return this.getLocalStorage(name); // Fallback to local storage
    }
  }

  deleteCookie(res, name) {
    try {
      res.clearCookie(name);
      this.removeLocalStorage(name); // Remove from local storage as well
    } catch (error) {
      console.error(`Error deleting cookie '${name}': ${error.message}`);
    }
  }

  // Local storage methods (using JSON as a string storage)
  setLocalStorage(name, value) {
    if (typeof window !== 'undefined') { // Ensure we're in a browser context
      localStorage.setItem(name, value); // Store value directly; you might also want to encrypt it
    }
  }

  getLocalStorage(name) {
    if (typeof window !== 'undefined') { // Ensure we're in a browser context
      return localStorage.getItem(name); // Retrieve value
    }
    return null;
  }

  removeLocalStorage(name) {
    if (typeof window !== 'undefined') { // Ensure we're in a browser context
      localStorage.removeItem(name); // Remove value
    }
  }
}

module.exports = new CookieManager();
