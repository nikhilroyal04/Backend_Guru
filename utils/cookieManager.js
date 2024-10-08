const encryptionUtils = require('./encryptionUtils');

class CookieManager {
  setCookie(res, name, value, options = {}) {
    let cookieOptions = {
      httpOnly: true,
      sameSite: 'None',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...options,
    };
    // Encrypt the value before setting the cookie
    const encryptedValue = encryptionUtils.encrypt(value);
    res.cookie(name, encryptedValue, cookieOptions);
  }

  getCookie(req, name) {
    try {
      const encryptedValue = req.cookies[name];
      // Decrypt the value before returning
      return encryptedValue ? encryptionUtils.decrypt(encryptedValue) : null;
    } catch (error) {
      console.error(`Error getting cookie '${name}': ${error.message}`);
      return null;
    }
  }

  deleteCookie(res, name) {
    try {
      res.clearCookie(name);
    } catch (error) {
      console.error(`Error deleting cookie '${name}': ${error.message}`);
    }
  }
}

module.exports = new CookieManager();
