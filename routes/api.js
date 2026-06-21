'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.DB);

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  comments: {
    type: [String],
    default: []
  }
});

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({});

        const formattedBooks = books.map(book => ({
          _id: book._id.toString(),
          title: book.title,
          commentcount: book.comments.length
        }));

        res.json(formattedBooks);
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .post(async function (req, res) {
      try {
        const title = req.body.title;

        if (!title) {
          return res.send('missing required field title');
        }

        const newBook = await Book.create({
          title: title,
          comments: []
        });

        res.json({
          _id: newBook._id.toString(),
          title: newBook.title
        });
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('server error');
      }
    });


  app.route('/api/books/:id')
    .get(async function (req, res) {
      try {
        const book = await Book.findById(req.params.id);

        if (!book) {
          return res.send('no book exists');
        }

        res.json({
          _id: book._id.toString(),
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      try {
        const comment = req.body.comment;

        if (!comment) {
          return res.send('missing required field comment');
        }

        const book = await Book.findById(req.params.id);

        if (!book) {
          return res.send('no book exists');
        }

        book.comments.push(comment);
        await book.save();

        res.json({
          _id: book._id.toString(),
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
          return res.send('no book exists');
        }

        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });

};
