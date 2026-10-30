const User = require('../models/User');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');

/**
 * Validates whether an email address is already in use across any of the
 * 4 account tiers that support login authentication:
 *  1. Workspace Owner (User)
 *  2. Business Entity (User.businesses[])
 *  3. Branch Location (Branch)
 *  4. Employee Account (Employee)
 *
 * @param {string} email - Email address to check
 * @param {object} [exclude={}] - Optional entity to exclude when updating an existing record
 * @param {string} [exclude.type] - 'owner' | 'business' | 'branch' | 'employee'
 * @param {string|ObjectId} [exclude.id] - ID of the entity being updated
 * @returns {Promise<{ taken: boolean, section?: string, message?: string }>}
 */
async function checkEmailInUse(email, exclude = {}) {
  if (!email || typeof email !== 'string') {
    return { taken: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { taken: false };
  }

  // 1. Check Workspace Owner (User)
  const ownerQuery = { email: cleanEmail };
  if (exclude.type === 'owner' && exclude.id) {
    ownerQuery._id = { $ne: exclude.id };
  }
  const ownerExists = await User.findOne(ownerQuery).select('_id fullName email');
  if (ownerExists) {
    return {
      taken: true,
      section: 'Workspace Owner',
      message: 'This email address is already registered to a primary Workspace Owner account.'
    };
  }

  // 2. Check Business Entities (User.businesses[])
  let bizQuery;
  if (exclude.type === 'business' && exclude.id) {
    bizQuery = {
      'businesses': {
        $elemMatch: {
          email: cleanEmail,
          _id: { $ne: exclude.id }
        }
      }
    };
  } else {
    bizQuery = { 'businesses.email': cleanEmail };
  }
  const bizExists = await User.findOne(bizQuery).select('_id businesses.$');
  if (bizExists) {
    return {
      taken: true,
      section: 'Business Entity',
      message: 'This email address is already assigned to a Business entity.'
    };
  }

  // 3. Check Branch Locations (Branch)
  const branchQuery = { email: cleanEmail };
  if (exclude.type === 'branch' && exclude.id) {
    branchQuery._id = { $ne: exclude.id };
  }
  const branchExists = await Branch.findOne(branchQuery).select('_id name email');
  if (branchExists) {
    return {
      taken: true,
      section: 'Branch Location',
      message: 'This email address is already assigned to a Branch location.'
    };
  }

  // 4. Check Employees (Employee)
  const empQuery = { email: cleanEmail };
  if (exclude.type === 'employee' && exclude.id) {
    empQuery._id = { $ne: exclude.id };
  }
  const empExists = await Employee.findOne(empQuery).select('_id name email');
  if (empExists) {
    return {
      taken: true,
      section: 'Employee Account',
      message: 'This email address is already assigned to an Employee account.'
    };
  }

  return { taken: false };
}

module.exports = {
  checkEmailInUse
};
