const express = require('express');
const { createOffer, getOffers } = require('../controllers/offers.controller');
const { createRequest, getRequests } = require('../controllers/requests.controller');
const { getMatches, updateMatchStatus } = require('../controllers/matches.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

// Offers
router.post('/offers', auth(['ADMIN', 'MANAGER', 'BROKER']), createOffer);
router.get('/offers', auth(['ADMIN', 'MANAGER', 'BROKER']), getOffers);

// Requests
router.post('/requests', auth(['ADMIN', 'MANAGER', 'BROKER']), createRequest);
router.get('/requests', auth(['ADMIN', 'MANAGER', 'BROKER']), getRequests);

// Matches
router.get('/matches', auth(['ADMIN', 'MANAGER', 'BROKER']), getMatches);
router.patch('/matches/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), updateMatchStatus);

module.exports = router;
