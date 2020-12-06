const express = require('express');
const controller = require('../controllers/notes');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post('/', isAuth, controller.createNote);
router.get('/', isAuth, controller.getNotes);
router.patch('/:id', isAuth, controller.updateNote);
router.delete('/:id', isAuth, controller.deleteNote);
router.post('/:id/share', isAuth, controller.shareNote);
router.get('/:id/share', controller.getSharedNote);

module.exports = router;
