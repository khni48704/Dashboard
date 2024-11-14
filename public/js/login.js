const express = require('express');
const app = express();
const db = require('../config/db.js');

app.post ('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
     return res.status(500).send('Wrong email or password');
    }

        db.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password],
      (error, results) => {
        if (error) {
          return res.status(500).send('Wrong email or password');
        }

        if (results.length > 0) {
          res.json({ message: 'Velkommen ${email}'});
        } else {
          return res.status(500).send('Wrong email or password');
        }
      }
    )
})

document.getElementById('login_btn').addEventListener('click', () => {
  const username = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3200/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  })
  .then((res) => res.json())
  .then((res) => {
      console.log(res);
      const messageElement = document.getElementById('message');
      if (res.message === 'Velkommen') {
          messageElement.textContent = res.message;
          messageElement.style.color = 'green';
      } else {
          messageElement.textContent = res.message;
          messageElement.style.color = 'red';
      }
  })
  .catch((err) => {
      console.log(err);
      const messageElement = document.getElementById('message');
      messageElement.textContent = 'Der opstod en fejl. Prøv igen.';
      messageElement.style.color = 'red';
  });
}); 