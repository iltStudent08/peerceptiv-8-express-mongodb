const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [120, 'Author name must be at most 120 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio must be at most 2000 characters']
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [60, 'Nationality must be at most 60 characters']
    },
    birthYear: {
      type: Number,
      min: [1000, 'Birth year must be 1000 or later'],
      validate: {
        validator(value) {
          return value === undefined || value === null || value <= new Date().getFullYear();
        },
        message: 'Birth year cannot be in the future'
      }
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author'
});

module.exports = mongoose.model('Author', authorSchema);
