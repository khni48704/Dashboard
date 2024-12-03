const jwt = require('jsonwebtoken');
const key = 'key';

module.exports = (req, res, next) => {
  // Henter token fra sessionen
  const token = req.session.user?.token;

  if (!token) {
    return res.status(401).send('Adgang nægtet. Token mangler.');
  }

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(400).send('Ugyldigt token.');
  }
};

