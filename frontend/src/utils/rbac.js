export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  BROKER: 'BROKER',
};

export const hasRole = (user, roles = []) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

const isOwner = (resource, user) => {
  if (!resource || !user) return false;
  const ownerKeys = ['ownerId', 'userId', 'brokerId', 'createdById'];
  return ownerKeys.some((key) => resource[key] && resource[key] === user.id);
};

export const canEdit = (resource, user) => {
  if (!user) return false;
  if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) return true;
  if (user.role === ROLES.BROKER) return isOwner(resource, user);
  return false;
};

export const canDelete = (resource, user) => {
  if (!user) return false;
  if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) return true;
  if (user.role === ROLES.BROKER) return isOwner(resource, user);
  return false;
};


