const express = require('express');
const router = express.Router();
const Note = require('./../models/note');
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//admin check function
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user.role === 'admin') {
            return true;
        }
        else {
            return false;
        }
    } catch (err) {
        console.error("Error checking admin role:", err);
        return false;
    }
}


//show route
router.get('/list', jwtAuthMiddleware, async (req, res) => {
    try {
        const token = req.query.token;
        const userData = req.user;
        const userId = userData.id;

        // check user admin or not 
        if (await checkAdminRole(userId)) {
            return res.status(403).json({ message: 'admin are not allowed to use note' });
        }

        const list = await Note.find({ owner: userId });

        // res.status(200).json({ list });

        // render page 
        res.render("home.ejs", { list, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//get new route
router.get("/new", jwtAuthMiddleware, async (req, res) => {
    const token = req.query.token;

    const userData = req.user;
    const userId = userData.id;

    // check user admin or not 
    if (await checkAdminRole(userId)) {
        return res.status(403).json({ message: 'admin are not allowed to use note' });
    }

    res.render("new.ejs", { token });

})

//new route
router.post('/new', jwtAuthMiddleware, async (req, res) => {
    try {
        const token = req.query.token;
        const userData = req.user;
        const userId = userData.id;

        // check user admin or not 
        if (await checkAdminRole(userId)) {
            return res.status(403).json({ message: 'admin are not allowed to use note' });
        }

        const { title, content } = req.body;

        const data = {
            title: title,
            content: content,
            owner: userId
        }

        const newNote = new Note(data);

        const response = await newNote.save();
        console.log('data saved');

        const note = await Note.findOne({ title: title });

        res.redirect(`/note/list?token=${token}`);

        // res.status(200).json({ note });



    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//get edit route
router.get("/edit/:id", jwtAuthMiddleware, async (req, res) => {
    const token = req.query.token;
    const { id } = req.params;

    const userData = req.user;
    const userId = userData.id;

    // check user admin or not 
    if (await checkAdminRole(userId)) {
        return res.status(403).json({ message: 'admin are not allowed to use note' });
    }

    const note = await Note.findById(id);
    res.render("edit.ejs", { token, note });

})

//edit route
router.put('/edit/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const token = req.query.token;
        const userData = req.user;
        const userId = userData.id;
        const update = req.body;
        const noteId = req.params.id;

        // check user admin or not 
        if (await checkAdminRole(userId)) {
            return res.status(403).json({ message: 'admin are not allowed to use note' });
        }

        const note = await Note.findByIdAndUpdate(noteId, update);
        const dateUpdatedNote = await Note.findByIdAndUpdate(noteId, { $set: { updatedAt: new Date() } });
        const updatedNote = await Note.findById(noteId);




        // res.status(200).json({ message: 'note edited',note: updatedNote });
        res.redirect(`/note/list?token=${token}`);


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//delete route
router.put('/delete/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const token = req.query.token;
        const userData = req.user;
        const userId = userData.id;

        // check user admin or not 
        if (await checkAdminRole(userId)) {
            return res.status(403).json({ message: 'admin are not allowed to use note' });
        }

        const noteId = req.params.id;

        const note = await Note.findByIdAndDelete(noteId);
        // res.status(200).json({ message: 'note deleted',note: note });

        res.redirect(`/note/list?token=${token}`);


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



module.exports = router;