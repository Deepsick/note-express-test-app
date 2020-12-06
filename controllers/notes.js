const Note = require('../models/note');
const User = require('../models/user');
const noteValidator = require('../validators/note');
const logger = require('../config/logger');
const { HttpStatus } = require('../const');

const createNote = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.user;

    const { error: textError } = noteValidator.validateText({ text });

    if (textError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: textError });
      return;
    }

    const newNote = await Note.create({ text, userId: id });
    res.status(HttpStatus.OK).json(newNote);
  } catch (error) {
    logger.error(`createNote middleware get such error: ${error}`);
  }
};

const getNotes = async (req, res) => {
  try {
    const { DEFAULT_LIMIT, DEFAULT_OFFSET } = noteValidator;
    const { offset = DEFAULT_OFFSET, limit = DEFAULT_LIMIT } = req.query;
    const { id: userId } = req.user;

    const { error } = noteValidator.validateGetNotesParams({
      offset,
      limit,
    });
    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error });
      return;
    }

    const notesCount = await Note.count({
      where: {
        userId,
      },
    });
    if (offset >= notesCount) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: `Offset should be smaller than ${notesCount}` });
      return;
    }

    const notes = await Note.findAll({
      where: {
        userId,
      },
      offset,
      limit,
    });

    const hasNotes = notes && notes.length > 0;
    if (!hasNotes) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'There are no any notes for this user' });
      return;
    }

    res.status(HttpStatus.OK).json(notes);
  } catch (error) {
    logger.error(`getNotes middleware get such error: ${error}`);
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const { id: userId } = req.user;

    const { error: textError } = noteValidator.validateText({ text });
    if (textError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: textError });
      return;
    }

    const { error: idError } = noteValidator.validateId({ id });
    if (idError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: idError });
      return;
    }

    const result = await Note.update({ text }, {
      where: {
        id,
        userId,
      },
      returning: true,
    });
    const note = result[1];

    if (!note) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'There is no such note' });
      return;
    }

    res.status(HttpStatus.OK).json(note);
  } catch (error) {
    logger.error(`updateNote middleware get such error: ${error}`);
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const { error: idError } = noteValidator.validateId({ id });
    if (idError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: idError });
      return;
    }

    const note = await Note.findOne({
      where: {
        id,
        userId,
      },
    });
    const count = await Note.destroy({
      where: {
        id,
        userId,
      },
      returning: true,
    });
    if (count === 0) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'There is no such note' });
      return;
    }

    res.status(HttpStatus.OK).json(note);
  } catch (error) {
    logger.error(`deleteNote middleware get such error: ${error}`);
  }
};

const shareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { isPublic = true } = req.body;

    const { error: idError } = noteValidator.validateId({ id });
    if (idError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: idError });
      return;
    }

    const { error: isPublicError } = noteValidator.validateIsPublic({ isPublic });
    if (isPublicError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: isPublicError });
      return;
    }

    const result = await Note.update({ isPublic }, {
      where: {
        id,
        userId,
      },
      returning: true,
    });
    const note = result[1];

    if (!note) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'There is no such note' });
      return;
    }

    res.status(HttpStatus.OK).json(note);
  } catch (error) {
    logger.error(`shareNote middleware get such error: ${error}`);
  }
};

const getSharedNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: idError } = noteValidator.validateId({ id });
    if (idError) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: idError });
      return;
    }

    const sharedNote = await Note.findOne({
      where: {
        id,
      },
    });

    if (!sharedNote) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'There is no such note' });
      return;
    }
    const {
      text,
      createdAt,
      updatedAt,
      isPublic,
      userId,
    } = sharedNote;

    if (!isPublic) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'This note is private' });
      return;
    }

    const { login } = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!login) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'All notes of the user were deleted' });
      return;
    }

    res.status(HttpStatus.OK).json({
      text,
      createdAt,
      updatedAt,
      login,
    });
  } catch (error) {
    logger.error(`getSharedNote middleware get such error: ${error}`);
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  shareNote,
  getSharedNote,
};
