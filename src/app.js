const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');

const student = require('./api/student.js');
const book = require('./api/book.js');
const transaction = require('./api/transaction.js');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello there..'
  });
});

app.use('/student', student);
app.use('/book', book);
app.use('/transaction', transaction);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
