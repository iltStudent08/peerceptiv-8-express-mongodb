const sanitizeUpdate = (payload, allowedFields) => {
  const sanitized = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const value = payload[field];

      if (Array.isArray(value)) {
        if (!value.every((entry) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean')) {
          return;
        }
      } else if (typeof value === 'object' && value !== null) {
        return;
      }

      sanitized[field] = value;
    }
  });

  return sanitized;
};

module.exports = sanitizeUpdate;
