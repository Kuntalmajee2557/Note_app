const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Note = require('../models/note');

//get signup page
router.get("/signup", (req, res) => {
    res.render("signup.ejs");
})

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body; // Assuming the request body contains the User data
        console.log(data);


        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Check if a user with the same username already exists
        const existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same username already exists' });
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        // res.status(200).json({response: response, token: token});
        
        //render page
        if(data.role === 'admin')
        return res.redirect(`/user/admin?token=${token}`);
        return res.redirect(`/note/list?token=${token}`);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//get login page
router.get("/login", (req, res) => {
    res.render("login.ejs");
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {username, password} = req.body;

        // Check if aadharCardNumber or password is missing
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        // Find the user by username
        const user = await User.findOne({username: username});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or Password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        // res.json({token});

        //render page
        if(user.role === 'admin')
        return res.redirect(`/user/admin?token=${token}`);
        return res.redirect(`/note/list?token=${token}`);

    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/admin', jwtAuthMiddleware, async (req, res) => {
    const token = req.query.token;

    const userData = req.user;
    const userId = userData.id;

    const users = await User.find();
    res.render("admin.ejs", {token, users});
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        // res.status(200).json({user});

        const token = req.query.token;

        res.render("profile.ejs", { user, token});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//get change password page
router.get('/profile/password', jwtAuthMiddleware, async (req, res) => {
    const token = req.query.token;
    res.render("changePassword.ejs", { token });
})

//change password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        // res.status(200).json({ message: 'Password updated' });

        const token = req.query.token;
        res.redirect(`/note/list?token=${token}`);


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//delete user
router.put('/delete/:id', jwtAuthMiddleware, async (req, res) => {
    const token = req.query.token;
    const userId = req.params.id;

    const notes = await Note.deleteMany({owner: userId});
    const user = await User.findByIdAndDelete(userId);

    return res.redirect(`/user/admin?token=${token}`);
    
})

module.exports = router;