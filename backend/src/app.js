const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes (Placeholder)
app.get('/', (req, res) => {
  res.json({ message: 'Real Estate Matching API is running...' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/api.routes'));

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
