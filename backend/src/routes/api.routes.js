const express = require('express');
const { createOffer, getOffers, updateOffer, deleteOffer } = require('../controllers/offers.controller');
const { createRequest, getRequests, updateRequest, deleteRequest } = require('../controllers/requests.controller');
const { getMatches, updateMatchStatus } = require('../controllers/matches.controller');
const { createUser, getAllUsers } = require('../controllers/users.controller');
const { getNotifications, updateNotification } = require('../controllers/notifications.controller');
const { getSummary, getTopBrokers, getTopAreas } = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Real Estate Offers Management
 */

/**
 * @swagger
 * /offers:
 *   post:
 *     summary: Create a new offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       201:
 *         description: Offer created
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all offers
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: usage
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of offers
 */
router.post('/offers', auth(['ADMIN', 'MANAGER', 'BROKER']), createOffer);
router.get('/offers', auth(['ADMIN', 'MANAGER', 'BROKER']), getOffers);

/**
 * @swagger
 * /offers/{id}:
 *   put:
 *     summary: Update an offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       200:
 *         description: Offer updated
 * 
 *   delete:
 *     summary: Delete an offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offer deleted
 */
router.put('/offers/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), updateOffer);
router.delete('/offers/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), deleteOffer);

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Real Estate Requests Management
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       201:
 *         description: Request created
 * 
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of requests
 */
router.post('/requests', auth(['ADMIN', 'MANAGER', 'BROKER']), createRequest);
router.get('/requests', auth(['ADMIN', 'MANAGER', 'BROKER']), getRequests);

/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       200:
 *         description: Request updated
 * 
 *   delete:
 *     summary: Delete a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request deleted
 */
router.put('/requests/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), updateRequest);
router.delete('/requests/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), deleteRequest);

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Auto-generated matches
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/matches', auth(['ADMIN', 'MANAGER', 'BROKER']), getMatches);

/**
 * @swagger
 * /matches/{id}:
 *   patch:
 *     summary: Update match status
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, NEGOTIATION, CLOSED, REJECTED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/matches/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), updateMatchStatus);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 * 
 *   get:
 *     summary: Get all users (Admin/Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.post('/users', auth(['ADMIN', 'MANAGER', 'BROKER']), createUser);
router.get('/users', auth(['ADMIN', 'MANAGER']), getAllUsers);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User Notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', auth(['ADMIN', 'MANAGER', 'BROKER']), getNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Mark notification as READ/ARCHIVED
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [READ, ARCHIVED]
 *     responses:
 *       200:
 *         description: Notification updated
 */
router.patch('/notifications/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), updateNotification);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistics and Analytics
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get system summary counts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Counts of offers, requests, matches
 */
router.get('/dashboard/summary', auth(['ADMIN', 'MANAGER', 'BROKER']), getSummary);

/**
 * @swagger
 * /dashboard/top-brokers:
 *   get:
 *     summary: Get top 5 active brokers
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top brokers
 */
router.get('/dashboard/top-brokers', auth(['ADMIN', 'MANAGER', 'BROKER']), getTopBrokers);

/**
 * @swagger
 * /dashboard/top-areas:
 *   get:
 *     summary: Get top 5 requested areas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top areas
 */
router.get('/dashboard/top-areas', auth(['ADMIN', 'MANAGER', 'BROKER']), getTopAreas);

module.exports = router;
