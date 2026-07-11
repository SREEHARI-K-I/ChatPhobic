let memoryMessages = [];
let memoryUsers = {};
let nextMessageId = 1;

const Message = {
  create: (username, text, callback) => {
    const newMessage = {
      id: nextMessageId++,
      username,
      text,
      timestamp: new Date().toISOString()
    };
    memoryMessages.push(newMessage);
    callback(null, newMessage);
  },

  getAll: (callback) => {
    callback(null, memoryMessages);
  },

  authValidate: (username, password) => {
    if (!memoryUsers[username]) return { status: 'NOT_FOUND' };
    return memoryUsers[username] === password ? { status: 'SUCCESS', username } : { status: 'INVALID' };
  },

  authRegister: (username, password) => {
    memoryUsers[username] = password;
    return true;
  }
};

module.exports = Message;