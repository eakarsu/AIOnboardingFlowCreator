const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next();
  }

  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain a special character');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Password does not meet requirements', details: errors });
  }

  next();
};

module.exports = { validatePasswordStrength };
