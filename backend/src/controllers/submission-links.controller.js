const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { matchOfferToRequests, matchRequestToOffers } = require('../services/matching.service');
const { SUBMITTED_BY_TYPES, isValidSubtypeForUsage } = require('../utils/property-subtypes');

const LINK_ACTIONS = ['OFFER', 'REQUEST'];

const getUserTeamId = async (userId) => {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });
  return membership?.teamId || null;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const findValidLink = async (token, requiredAction) => {
  if (!token) return { error: 'Token is required' };
  const tokenHash = hashToken(token);

  const link = await prisma.userSubmissionLink.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: { id: true, role: true, status: true }
      }
    }
  });

  if (!link || !link.isActive) return { error: 'Invalid or inactive token' };
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return { error: 'Token has expired' };
  if (!link.user || link.user.status !== 'ACTIVE') return { error: 'Token owner is not active' };

  const allowedActions = Array.isArray(link.allowedActions) ? link.allowedActions : LINK_ACTIONS;
  if (!allowedActions.includes(requiredAction)) return { error: `Token is not allowed for ${requiredAction.toLowerCase()} submissions` };

  return { link };
};

const validateOfferPayload = (payload) => {
  const {
    type, usage, areaFrom, areaTo, priceFrom, priceTo, submittedBy, propertySubType
  } = payload;

  if (!type || !usage || areaFrom === undefined || areaTo === undefined ||
    priceFrom === undefined || priceTo === undefined) {
    return 'Missing required fields';
  }
  if (submittedBy && !SUBMITTED_BY_TYPES.includes(submittedBy)) return 'Invalid submittedBy value';
  if (!isValidSubtypeForUsage(usage, propertySubType)) return 'propertySubType is not valid for selected usage';
  return null;
};

const validateRequestPayload = (payload) => {
  const {
    type, usage, areaFrom, areaTo, budgetFrom, budgetTo, priority, submittedBy, propertySubType
  } = payload;

  if (!type || !usage || areaFrom === undefined || areaTo === undefined ||
    budgetFrom === undefined || budgetTo === undefined || !priority) {
    return 'Missing required fields';
  }
  if (submittedBy && !SUBMITTED_BY_TYPES.includes(submittedBy)) return 'Invalid submittedBy value';
  if (!isValidSubtypeForUsage(usage, propertySubType)) return 'propertySubType is not valid for selected usage';
  return null;
};

const createSubmissionLink = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { expiresAt, expiresInDays, allowedActions, isActive } = req.body || {};

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status !== 'ACTIVE') return res.status(400).json({ message: 'User is not active' });

    const normalizedActions = Array.isArray(allowedActions) && allowedActions.length
      ? [...new Set(allowedActions)]
      : LINK_ACTIONS;
    if (normalizedActions.some((action) => !LINK_ACTIONS.includes(action))) {
      return res.status(400).json({ message: 'Invalid allowedActions. Use OFFER and/or REQUEST' });
    }

    let finalExpiresAt = null;
    if (expiresAt) {
      const dt = new Date(expiresAt);
      if (Number.isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid expiresAt' });
      finalExpiresAt = dt;
    } else if (expiresInDays !== undefined) {
      const days = Number(expiresInDays);
      if (!Number.isFinite(days) || days <= 0) return res.status(400).json({ message: 'expiresInDays must be a positive number' });
      finalExpiresAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const created = await prisma.userSubmissionLink.create({
      data: {
        userId,
        tokenHash,
        allowedActions: normalizedActions,
        expiresAt: finalExpiresAt,
        isActive: isActive !== undefined ? !!isActive : true,
        createdById: req.user.id
      },
      select: {
        id: true,
        userId: true,
        allowedActions: true,
        expiresAt: true,
        isActive: true,
        createdById: true,
        createdAt: true
      }
    });

    const publicBase = process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return res.status(201).json({
      ...created,
      token: rawToken,
      offerSubmissionUrl: `${publicBase}/api/public/submissions/offer?token=${rawToken}`,
      requestSubmissionUrl: `${publicBase}/api/public/submissions/request?token=${rawToken}`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const submitOfferWithToken = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const { link, error } = await findValidLink(token, 'OFFER');
    if (error) return res.status(401).json({ message: error });

    const validationError = validateOfferPayload(req.body || {});
    if (validationError) return res.status(400).json({ message: validationError });

    const teamId = await getUserTeamId(link.userId);
    const {
      type, usage, landStatus, city, district, cityId, neighborhoodId, purpose, brokersCount,
      areaFrom, areaTo, priceFrom, priceTo,
      exclusivity, contractType, description, coordinates,
      submittedBy, propertySubType, boundaries, lengths, facades, brokerContactName, brokerContactPhone
    } = req.body;

    const data = {
      type,
      usage,
      landStatus: landStatus || null,
      city: city || null,
      district: district || null,
      cityId: cityId ? parseInt(cityId) : null,
      neighborhoodId: neighborhoodId ? parseInt(neighborhoodId) : null,
      purpose: purpose || null,
      brokersCount: brokersCount ? parseInt(brokersCount) : null,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      priceFrom: parseFloat(priceFrom) || 0,
      priceTo: parseFloat(priceTo) || 0,
      exclusivity: exclusivity || null,
      contractType: contractType || null,
      submittedBy: submittedBy || null,
      propertySubType: propertySubType || null,
      boundaries: boundaries || null,
      lengths: lengths || null,
      facades: facades || null,
      brokerContactName: brokerContactName || null,
      brokerContactPhone: brokerContactPhone || null,
      description,
      coordinates,
      createdById: link.userId,
      teamId
    };

    const offer = await prisma.offer.create({ data });
    matchOfferToRequests(offer).catch(console.error);
    return res.status(201).json(offer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const submitRequestWithToken = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const { link, error } = await findValidLink(token, 'REQUEST');
    if (error) return res.status(401).json({ message: error });

    const validationError = validateRequestPayload(req.body || {});
    if (validationError) return res.status(400).json({ message: validationError });

    const teamId = await getUserTeamId(link.userId);
    const {
      type, usage, purpose, landStatus, city, district, cityId, neighborhoodId,
      areaFrom, areaTo, budgetFrom, budgetTo,
      priority, submittedBy, propertySubType, description, brokerContactName, brokerContactPhone
    } = req.body;

    const data = {
      type,
      usage,
      purpose: purpose || null,
      landStatus: landStatus || null,
      city: city || null,
      district: district || null,
      cityId: cityId ? parseInt(cityId) : null,
      neighborhoodId: neighborhoodId ? parseInt(neighborhoodId) : null,
      submittedBy: submittedBy || null,
      propertySubType: propertySubType || null,
      description: description || null,
      brokerContactName: brokerContactName || null,
      brokerContactPhone: brokerContactPhone || null,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      budgetFrom: parseFloat(budgetFrom) || 0,
      budgetTo: parseFloat(budgetTo) || 0,
      priority,
      createdById: link.userId,
      teamId
    };

    const request = await prisma.request.create({ data });
    matchRequestToOffers(request).catch(console.error);
    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubmissionLink,
  submitOfferWithToken,
  submitRequestWithToken
};
