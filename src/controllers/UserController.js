const express = require('express');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const key = 'key';

exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.getUsers();
        const user = req.session.user; // hent brugeren fra sessionen
        res.render('projects', { users, user }); // send både users og user til HBS
    } catch (error) {
        res.status(500).send('Server Error');
    }
};
exports.createUser = async (req, res) => {
    try {
        const {first_name, last_name, email, password, group_id} = req.body;        
        const groupIdToUser = await UserModel.getGroupForUser(group_id);
        const users = await UserModel.createUser({first_name, last_name, email, password, group_id:groupIdToUser});

        return res.redirect('/projects'); 
    } catch(error) {
        res.status(500).send('Server Error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login forsøg:', { email, password });

    try {
        // Find brugeren i databasen
        const user = await UserModel.findUserByEmailAndPassword(email, password);

        if (user) {
            // Generer JWT-token
            const token = jwt.sign(
                { id: user.user_id, email: user.email },
                key, 
                { expiresIn: '1h' }
            );

            // Gem brugerens data samt token i sessionen
            req.session.user = {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                token: token // Gem token i sessionen
            };

            console.log('Session oprettet:', req.session.user);  // Log sessionen her

            return res.redirect('/projects');  // Omdirigér til en beskyttet rute
        } else {
            return res.status(401).render('index', { error: "Ugyldig email eller password" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).render('index', { error: 'Server error' });
    }
};




exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.user_id; // Get user ID from session

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).render('changePassword', { error: "Passwords don't match" });
        }

        // Find the user by ID to get the current password
        const user = await UserModel.findUserById(userId);

        if (user.password !== currentPassword) {
            return res.status(400).render('changePassword', { error: "Current password is incorrect" });
        }

        // Update the password in the database
        await UserModel.updatePassword(userId, newPassword);

        // Redirect to a success page or render success message
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        return res.status(500).render('changePassword', { error: 'Server error' });
    }
};
