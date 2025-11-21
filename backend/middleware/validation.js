const Joi = require('joi');

// Validation schemas
const schemas = {
  // User registration validation
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(6).max(100).required(),
    address: Joi.string().max(500).optional(),
    phone: Joi.string().max(20).optional()
  }),

  // User login validation
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Book validation
  book: Joi.object({
    isbn: Joi.string().max(20).optional(),
    title: Joi.string().min(1).max(255).required(),
    price: Joi.number().positive().precision(2).required(),
    stock_qty: Joi.number().integer().min(0).default(0),
    publisher_id: Joi.number().integer().positive().optional(),
    pub_date: Joi.date().optional(),
    description: Joi.string().max(2000).optional(),
    image_url: Joi.string().uri().optional(),
    author_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
    category_ids: Joi.array().items(Joi.number().integer().positive()).optional()
  }),

  // Category validation
  category: Joi.object({
    name: Joi.string().min(1).max(150).required(),
    description: Joi.string().max(500).optional()
  }),

  // Author validation
  author: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    bio: Joi.string().max(2000).optional()
  }),

  // Publisher validation
  publisher: Joi.object({
    publisher_name: Joi.string().min(2).max(200).required(),
    publisher_address: Joi.string().max(500).optional()
  }),

  // Order validation
  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        book_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).min(1).required(),
    shipping_address: Joi.string().max(500).required()
  }),

  // Review validation
  review: Joi.object({
    book_id: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};