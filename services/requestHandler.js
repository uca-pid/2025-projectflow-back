const { generateToken } = require("./tokenManager");

async function createUser(name, email, password) {
  // Create User
  // Return a token
  return generateToken();
}

async function loginUser(email, password) {
  // Login User
  // Return a token
  return generateToken();
}

module.exports = {
  createUser,
  loginUser,
};
