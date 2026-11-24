const User = require('../models/User');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

/**
 * Automatically seeds Categories and Sub-Categories for a tenant based on their Onboarding wizard choices.
 * @param {string} userId - Tenant/User ObjectId
 * @param {Array} [catalogueData] - Optional structured array from onboarding payload: [{ categoryName, subCategories, itemType }]
 * @returns {Promise<boolean>}
 */
const seedCatalogueFromUser = async (userId, catalogueData = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const resolvedOffering = user.businessOfferingType || user.offeringType || 'product';
    const defaultItemType = resolvedOffering === 'service' ? 'Service' : 'Product';

    if (Array.isArray(catalogueData) && catalogueData.length > 0) {
      for (const item of catalogueData) {
        if (!item.categoryName || !item.categoryName.trim()) continue;
        const catName = item.categoryName.trim();
        const itemType = item.itemType || defaultItemType;

        const catDoc = await Category.findOneAndUpdate(
          { tenantId: userId, name: catName },
          {
            tenantId: userId,
            name: catName,
            itemType: itemType,
            transactionType: 'Sales',
            description: `Business category selected during onboarding`
          },
          { upsert: true, new: true }
        );

        if (Array.isArray(item.subCategories) && item.subCategories.length > 0) {
          for (const subName of item.subCategories) {
            if (!subName || !subName.trim()) continue;
            const cleanSubName = subName.trim();
            await SubCategory.findOneAndUpdate(
              { tenantId: userId, name: cleanSubName, categoryId: catDoc._id },
              {
                tenantId: userId,
                name: cleanSubName,
                categoryId: catDoc._id,
                itemType: itemType,
                transactionType: 'Sales',
                description: `Sub-category for ${catName}`
              },
              { upsert: true, new: true }
            );
          }
        }
      }
      return true;
    }

    // Fallback: seed from user.categories / user.category and user.subCategory
    if (user.categories?.length > 0 || user.category) {
      const catList = (user.categories && user.categories.length > 0)
        ? user.categories
        : (user.category ? user.category.split(',').map(c => c.trim()).filter(Boolean) : []);

      const subList = user.subCategory ? user.subCategory.split(',').map(s => s.trim()).filter(Boolean) : [];

      for (const catName of catList) {
        if (!catName || !catName.trim()) continue;
        const cleanCat = catName.trim();
        const catDoc = await Category.findOneAndUpdate(
          { tenantId: userId, name: cleanCat },
          {
            tenantId: userId,
            name: cleanCat,
            itemType: defaultItemType,
            transactionType: 'Sales',
            description: `Business category from onboarding profile`
          },
          { upsert: true, new: true }
        );

        if (subList.length > 0) {
          for (const subName of subList) {
            await SubCategory.findOneAndUpdate(
              { tenantId: userId, name: subName, categoryId: catDoc._id },
              {
                tenantId: userId,
                name: subName,
                categoryId: catDoc._id,
                itemType: defaultItemType,
                transactionType: 'Sales',
                description: `Sub-category for ${cleanCat}`
              },
              { upsert: true, new: true }
            );
          }
        }
      }
      return true;
    }

    return false;
  } catch (err) {
    console.error('Error in seedCatalogueFromUser:', err);
    return false;
  }
};

module.exports = { seedCatalogueFromUser };