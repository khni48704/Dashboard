const jwt = require('jsonwebtoken'); //JWT token - er installeret med NPM install jsonwebtoken
const key = 'key';

module.exports = (req, res, next) => {
  // Henter token fra sessionen
  const token = req.session.user?.token;

  if (!token) {
    return res.status(401).send('Access denied. Token missing.');
  }

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};