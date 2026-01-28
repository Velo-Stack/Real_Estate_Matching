const prisma = require('../utils/prisma');

const auditLog = (resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Only log successful operations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        let action = null;
        if (req.method === 'POST') action = 'CREATE';
        else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        else if (req.method === 'DELETE') action = 'DELETE';
        
        if (action) {
          const resourceId = req.params.id || data?.id;
          
          prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action,
              resource,
              resourceId: resourceId ? parseInt(resourceId) : null,
              newValues: req.method !== 'DELETE' ? data : null,
              oldValues: req.oldData || null,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            }
          }).catch(err => console.error('Audit Log Error:', err));
        }
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = auditLog;
