const User = require('../models/User');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const {
  getSubCategoriesForCategory,
  isSubcategoryBelongingToCategory,
  normalizeCategoryKey
} = require('../constants/businessCategories');

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

    const rawOffering = user.businessOfferingType || user.offeringType || 'product';
    const resolvedOffering = String(rawOffering).toLowerCase();
    const defaultItemType = resolvedOffering === 'both' ? 'Both' : (resolvedOffering === 'service' ? 'Service' : 'Product');

    // If catalogueData passed, persist it on user model for future re-syncs
    if (Array.isArray(catalogueData) && catalogueData.length > 0) {
      user.catalogueData = catalogueData;
      await user.save();
    } else if ((!catalogueData || catalogueData.length === 0) && Array.isArray(user.catalogueData) && user.catalogueData.length > 0) {
      catalogueData = user.catalogueData;
    }

    if (Array.isArray(catalogueData) && catalogueData.length > 0) {
      for (const item of catalogueData) {
        if (!item.categoryName || !item.categoryName.trim()) continue;
        const catName = item.categoryName.trim();
        const itemType = resolvedOffering === 'both' ? 'Both' : (item.itemType || defaultItemType);

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

      if (resolvedOffering === 'both') {
        await Category.updateMany(
          { tenantId: userId, itemType: { $ne: 'Service' } },
          { $set: { itemType: 'Both' } }
        );
        await SubCategory.updateMany(
          { tenantId: userId, itemType: { $ne: 'Service' } },
          { $set: { itemType: 'Both' } }
        );
      }

      // Cleanup any corrupted cross-assigned subcategories
      await cleanRogueSubcategories(userId);

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
            if (!subName || !subName.trim()) continue;
            const cleanSub = subName.trim();

            // Strict category-to-subcategory mapping check
            if (catList.length > 1) {
              const belongs = isSubcategoryBelongingToCategory(cleanSub, cleanCat);
              if (!belongs) {
                // If it belongs to another known category in catList, do NOT attach it to this category
                continue;
              }
            }

            await SubCategory.findOneAndUpdate(
              { tenantId: userId, name: cleanSub, categoryId: catDoc._id },
              {
                tenantId: userId,
                name: cleanSub,
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

      if (resolvedOffering === 'both') {
        await Category.updateMany(
          { tenantId: userId, itemType: { $ne: 'Service' } },
          { $set: { itemType: 'Both' } }
        );
        await SubCategory.updateMany(
          { tenantId: userId, itemType: { $ne: 'Service' } },
          { $set: { itemType: 'Both' } }
        );
      }

      // Cleanup any corrupted cross-assigned subcategories
      await cleanRogueSubcategories(userId);

      return true;
    }

    return false;
  } catch (err) {
    console.error('Error in seedCatalogueFromUser:', err);
    return false;
  }
};

/**
 * Removes subcategories assigned to the wrong parent category when multiple categories exist for a tenant.
 * @param {string} tenantId 
 */
const cleanRogueSubcategories = async (tenantId) => {
  try {
    const categories = await Category.find({ tenantId });
    if (categories.length <= 1) return;

    const subcategories = await SubCategory.find({ tenantId }).populate('categoryId');
    for (const sub of subcategories) {
      if (!sub.categoryId || !sub.categoryId.name) continue;
      const parentCatName = sub.categoryId.name;
      const belongs = isSubcategoryBelongingToCategory(sub.name, parentCatName);
      
      // If it doesn't belong to its assigned category, check if it belongs to another category belonging to this tenant
      if (!belongs) {
        const matchingCat = categories.find(c => isSubcategoryBelongingToCategory(sub.name, c.name));
        if (matchingCat && String(matchingCat._id) !== String(sub.categoryId._id)) {
          // This subcategory was erroneously attached to the wrong category! Delete this mismatched record.
          await SubCategory.findByIdAndDelete(sub._id);
        }
      }
    }
  } catch (err) {
    console.error('Error cleaning rogue subcategories:', err);
  }
};

module.exports = { seedCatalogueFromUser, cleanRogueSubcategories };
