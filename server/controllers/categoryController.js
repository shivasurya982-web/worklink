const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    ApiResponse.success(res, categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return ApiResponse.notFound(res, 'Category not found');
    }
    ApiResponse.success(res, category);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (admin)
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, order } = req.body;

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || 'Wrench',
      image,
      order: order ? parseInt(order) : 0,
    });

    ApiResponse.created(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive, order } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (icon) updates.icon = icon;
    if (isActive !== undefined) updates.isActive = isActive;
    if (order !== undefined) updates.order = parseInt(order);

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return ApiResponse.notFound(res, 'Category not found');
    }

    ApiResponse.success(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return ApiResponse.notFound(res, 'Category not found');
    }
    ApiResponse.success(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
