const express = require('express');
const router = express.Router();
const Note = require('./../models/note');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//show route
router.get('/list', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;

        const list = await Note.find({ owner: userId });

        res.status(200).json({ list });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



//new route
router.post('/new', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;

        console.log("userId");

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



        res.status(200).json({ note });



    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//edit route
router.put('/edit/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const update = req.body;
        const noteId = req.params.id;
        console.log(noteId);

        const note = await Note.findByIdAndUpdate(noteId, update);
        const dateUpdatedNote = await Note.findByIdAndUpdate(noteId, { $set: { updatedAt: new Date() } });
        const updatedNote = await Note.findById(noteId);




        res.status(200).json({ message: 'note edited',note: updatedNote });


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//delete route
router.post('/delete/:id', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;

        const noteId = req.params.id;

        const note = await Note.findByIdAndDelete(noteId);
        res.status(200).json({ message: 'note deleted',note: note });




    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



module.exports = router;