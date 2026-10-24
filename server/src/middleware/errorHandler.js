export function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  // PostgreSQL Unique Constraint Violation
  if (err.code === '23505') {
    if (err.constraint === 'uq_user_entry_date' || err.detail?.includes('entry_date')) {
      return res.status(409).json({
        error: 'You have already logged your mood for today! You can only log once per day.',
        code: 'DUPLICATE_ENTRY_TODAY'
      });
    }
    if (err.detail?.includes('email')) {
      return res.status(409).json({
        error: 'An account with this email address already exists.',
        code: 'DUPLICATE_EMAIL'
      });
    }
    return res.status(409).json({
      error: 'A unique record with these details already exists.',
      code: 'UNIQUE_VIOLATION'
    });
  }

  // PostgreSQL Check Constraint Violation
  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Value out of permitted database range.',
      code: 'CHECK_VIOLATION'
    });
  }

  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
