const express = require('express');
const { createOffer, getOffers, updateOffer, deleteOffer } = require('../controllers/offers.controller');
const { createRequest, getRequests, updateRequest, deleteRequest } = require('../controllers/requests.controller');
const { getMatches, updateMatchStatus } = require('../controllers/matches.controller');
const { createUser, getAllUsers } = require('../controllers/users.controller');
const { getNotifications, updateNotification } = require('../controllers/notifications.controller');
const { getSummary, getTopBrokers, getTopAreas } = require('../controllers/dashboard.controller');
const { getAuditLogs } = require('../controllers/audit.controller');
const { exportExcel, exportPDF } = require('../controllers/reports.controller');
const { getEnums, getCities, getNeighborhoods } = require('../controllers/meta.controller');
const { createTeam, getTeams, addMember, listMembers } = require('../controllers/teams.controller');
const { listConversations, createConversation, getMessages, postMessage, markRead } = require('../controllers/conversations.controller');
const { getMyTeam } = require('../controllers/me.controller');
const auth = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/audit.middleware');

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
router.post('/offers', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Offer'), createOffer);
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
router.put('/offers/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Offer'), updateOffer);
router.delete('/offers/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Offer'), deleteOffer);

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
router.post('/requests', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Request'), createRequest);
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
router.put('/requests/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Request'), updateRequest);
router.delete('/requests/:id', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('Request'), deleteRequest);

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
router.post('/users', auth(['ADMIN', 'MANAGER', 'BROKER']), auditLog('User'), createUser);
router.get('/users', auth(['ADMIN', 'MANAGER']), getAllUsers);

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: System audit logs
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs (Admin/Manager only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/audit-logs', auth(['ADMIN', 'MANAGER']), getAuditLogs);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User Notifications Management
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
 *         description: List of notifications for current user
 */
router.get('/notifications', auth(['ADMIN', 'MANAGER', 'BROKER']), getNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Update notification status
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
 *                 enum: [UNREAD, READ, ARCHIVED]
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
 *     summary: Get system summary (counts of offers, requests, matches)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOffers:
 *                   type: integer
 *                 totalRequests:
 *                   type: integer
 *                 totalMatches:
 *                   type: integer
 */
router.get('/dashboard/summary', auth(['ADMIN', 'MANAGER', 'BROKER']), getSummary);

// Meta & Locations
router.get('/meta/enums', auth(['ADMIN', 'MANAGER', 'BROKER']), getEnums);
router.get('/locations/cities', auth(['ADMIN', 'MANAGER', 'BROKER']), getCities);
router.get('/locations/neighborhoods', auth(['ADMIN', 'MANAGER', 'BROKER']), getNeighborhoods);

// Teams & Internal Communication
router.post('/teams', auth(['ADMIN']), auditLog('Team'), createTeam);
router.get('/teams', auth(['ADMIN', 'MANAGER']), getTeams);
router.post('/teams/:id/members', auth(['ADMIN']), auditLog('TeamMember'), addMember);
router.get('/teams/:id/members', auth(['ADMIN', 'MANAGER']), listMembers);

// User's Team Info
router.get('/me/team', auth(['ADMIN', 'MANAGER', 'BROKER']), getMyTeam);

// Conversations / Messages
router.get('/conversations', auth(['ADMIN', 'MANAGER', 'BROKER']), listConversations);
router.post('/conversations', auth(['ADMIN', 'MANAGER', 'BROKER']), createConversation);
router.get('/conversations/:id/messages', auth(['ADMIN', 'MANAGER', 'BROKER']), getMessages);
router.post('/conversations/:id/messages', auth(['ADMIN', 'MANAGER', 'BROKER']), postMessage);
router.patch('/conversations/:id/read', auth(['ADMIN', 'MANAGER', 'BROKER']), markRead);

/**
 * @swagger
 * /dashboard/top-brokers:
 *   get:
 *     summary: Get top 5 most active brokers
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top brokers with activity count
 */
router.get('/dashboard/top-brokers', auth(['ADMIN', 'MANAGER', 'BROKER']), getTopBrokers);

/**
 * @swagger
 * /dashboard/top-areas:
 *   get:
 *     summary: Get top 5 most requested areas (cities)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top areas with request count
 */
router.get('/dashboard/top-areas', auth(['ADMIN', 'MANAGER', 'BROKER']), getTopAreas);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Export reports in Excel/PDF format
 */

/**
 * @swagger
 * /reports/export/excel:
 *   get:
 *     summary: Export data as Excel file
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [offers, requests, matches]
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/reports/export/excel', auth(['ADMIN', 'MANAGER']), exportExcel);

/**
 * @swagger
 * /reports/export/pdf:
 *   get:
 *     summary: Export data as PDF file
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [offers, requests, matches]
 *         description: Type of data to export
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/reports/export/pdf', auth(['ADMIN', 'MANAGER']), exportPDF);

module.exports = router;

