'use strict';

const AuditLog = require('../models/AuditLog');

function audit(action, resource) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      const status = res.statusCode < 400 ? 'success' : 'failure';
      AuditLog.create({
        user: req.user?._id,
        action,
        resource,
        resourceId: req.params.id || body?.data?._id?.toString(),
        method: req.method,
        path: req.originalUrl,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        changes: req.auditChanges || undefined,
        metadata: { statusCode: res.statusCode },
        status,
      }).catch((err) => console.error('[Audit] Failed to log:', err.message));

      return originalJson(body);
    };

    next();
  };
}

function captureChanges(fields) {
  return (req, res, next) => {
    req.auditChanges = { fields, body: req.body };
    next();
  };
}

module.exports = { audit, captureChanges };
