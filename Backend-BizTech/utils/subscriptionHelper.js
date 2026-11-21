/**
 * Utility functions for subscription calculation, validity checks, and expiry management.
 */

/**
 * Calculates the expiration date based on the billing cycle.
 * Monthly: exactly 30 days
 * Annual: exactly 365 days (1 year)
 *
 * @param {string} billingCycle - 'Monthly' | 'Annual' | 'yearly'
 * @param {Date} [startDate=new Date()]
 * @returns {Date}
 */
const calculatePlanExpiry = (billingCycle, startDate = new Date()) => {
  const isAnnual = (billingCycle || '').toLowerCase() === 'annual' || (billingCycle || '').toLowerCase() === 'yearly';
  const durationMs = isAnnual 
    ? 365 * 24 * 60 * 60 * 1000 
    : 30 * 24 * 60 * 60 * 1000;
  
  const start = new Date(startDate);
  return new Date(start.getTime() + durationMs);
};

/**
 * Formats a Date object into a readable string (e.g. "19 Dec 2026")
 * @param {Date|string} date
 * @returns {string}
 */
const formatDateString = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return String(date);
  }
};

/**
 * Checks whether a tenant user's subscription has expired.
 * If expired and not already marked 'Expired', updates status asynchronously.
 *
 * @param {Object} user - Mongoose User document or plain object
 * @returns {boolean} true if expired, false if still active/valid
 */
const isSubscriptionExpired = (user) => {
  if (!user) return false;

  // Pending approval or rejected are not expired yet; they are waiting for or denied verification
  if (user.subscriptionStatus === 'Pending Approval' || user.subscriptionStatus === 'Rejected') {
    return false;
  }

  // Already marked Expired
  if (user.subscriptionStatus === 'Expired' || user.subscription?.paymentStatus === 'Expired') {
    return true;
  }

  const now = new Date();

  // Check validUntil date in subscription sub-document
  if (user.subscription?.validUntil) {
    const validUntil = new Date(user.subscription.validUntil);
    if (!isNaN(validUntil.getTime()) && now > validUntil) {
      if (user.subscriptionStatus !== 'Expired' && typeof user.save === 'function') {
        user.subscriptionStatus = 'Expired';
        if (user.subscription) user.subscription.paymentStatus = 'Expired';
        user.save().catch(err => console.error('Error auto-updating expired subscription status:', err));
      }
      return true;
    }
  }

  // Check legacy subscriptionRenewalDate if present and no validUntil
  if (!user.subscription?.validUntil && user.subscriptionRenewalDate) {
    const renewal = new Date(user.subscriptionRenewalDate);
    if (!isNaN(renewal.getTime()) && now > renewal) {
      if (user.subscriptionStatus !== 'Expired' && typeof user.save === 'function') {
        user.subscriptionStatus = 'Expired';
        user.save().catch(err => console.error('Error auto-updating expired subscription status:', err));
      }
      return true;
    }
  }

  return false;
};

module.exports = {
  calculatePlanExpiry,
  formatDateString,
  isSubscriptionExpired
};
