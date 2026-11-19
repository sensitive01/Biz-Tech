const User = require('../models/User');
const Branch = require('../models/Branch');
const Employee = require('../models/Employee');
const Investor = require('../models/Investor');

/**
 * Validates whether a phone number is already registered across any account tier:
 * 1. Workspace Owner (User)
 * 2. Business Entities (User.businesses[])
 * 3. Branch Locations (Branch)
 * 4. Employees (Employee)
 * 5. Investors (Investor)
 *
 * @param {string} phone - Phone number to check
 * @param {object} [exclude={}] - Optional entity to exclude when updating an existing record
 * @param {string} [exclude.type] - 'owner' | 'business' | 'branch' | 'employee' | 'investor'
 * @param {string|ObjectId} [exclude.id] - ID of the entity being updated
 * @returns {Promise<{ taken: boolean, section?: string, message?: string }>}
 */
async function checkPhoneInUse(phone, exclude = {}) {
  if (!phone || typeof phone !== 'string') {
    return { taken: false };
  }

  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    return { taken: false };
  }

  // 1. Check Workspace Owner (User)
  const ownerQuery = { phone: cleanPhone };
  if (exclude.type === 'owner' && exclude.id) {
    ownerQuery._id = { $ne: exclude.id };
  }
  const ownerExists = await User.findOne(ownerQuery).select('_id fullName phone email');
  if (ownerExists) {
    return {
      taken: true,
      section: 'Workspace Owner',
      message: `The phone number ${cleanPhone} is already registered to another account.`
    };
  }

  // 2. Check Business Entities (User.businesses[])
  let bizQuery;
  if (exclude.type === 'business' && exclude.id) {
    bizQuery = {
      'businesses': {
        $elemMatch: {
          phone: cleanPhone,
          _id: { $ne: exclude.id }
        }
      }
    };
  } else {
    bizQuery = { 'businesses.phone': cleanPhone };
  }
  const bizExists = await User.findOne(bizQuery).select('_id businesses.$');
  if (bizExists) {
    return {
      taken: true,
      section: 'Business Entity',
      message: `The phone number ${cleanPhone} is already assigned to a Business entity.`
    };
  }

  // 3. Check Branch Locations (Branch)
  const branchQuery = {
    $or: [
      { contactNumber: cleanPhone },
      { phone: cleanPhone }
    ]
  };
  if (exclude.type === 'branch' && exclude.id) {
    branchQuery._id = { $ne: exclude.id };
  }
  const branchExists = await Branch.findOne(branchQuery).select('_id name contactNumber');
  if (branchExists) {
    return {
      taken: true,
      section: 'Branch Location',
      message: `The phone number ${cleanPhone} is already assigned to a Branch location.`
    };
  }

  // 4. Check Employees (Employee)
  const empQuery = {
    $or: [
      { contactNumber: cleanPhone },
      { phone: cleanPhone }
    ]
  };
  if (exclude.type === 'employee' && exclude.id) {
    empQuery._id = { $ne: exclude.id };
  }
  const empExists = await Employee.findOne(empQuery).select('_id name contactNumber');
  if (empExists) {
    return {
      taken: true,
      section: 'Employee Account',
      message: `The phone number ${cleanPhone} is already assigned to an Employee account.`
    };
  }

  // 5. Check Investors (Investor)
  const invQuery = { phone: cleanPhone };
  if (exclude.type === 'investor' && exclude.id) {
    invQuery._id = { $ne: exclude.id };
  }
  const invExists = await Investor.findOne(invQuery).select('_id name phone');
  if (invExists) {
    return {
      taken: true,
      section: 'Investor Profile',
      message: `The phone number ${cleanPhone} is already assigned to an Investor profile.`
    };
  }

  return { taken: false };
}

module.exports = {
  checkPhoneInUse
};
