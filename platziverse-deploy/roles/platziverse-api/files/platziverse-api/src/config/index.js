require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  isDev: process.env.NODE_ENV !== 'production',
  auth: {
    secret: process.env.SECRET || 'secretDev',
  },
};
