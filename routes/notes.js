const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Get All the Notes using : GET "/api/auth/fetchallnotes". Doesn't require Auth - No login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
})

// Add a new Note using : POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body('title').isLength({ min: 3 }),
    body('description').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        // if there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save()

        res.json(savedNote)
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }

})
// Update a new Note using : PUT "/api/notes/updatenote". login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // create a new note object
        const newNote = {};

        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // find the note to be updated and update it

        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Note Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note)
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
})



// Update a new Note using : DELETE "/api/notes/updatenote". login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    // find the note to be Deleted and delete it
    try {
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Note Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "success": "Note Deleted Successfully", note: note });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }

})



module.exports = router
