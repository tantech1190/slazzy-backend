import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link to admin/vendor who created it
    },
  },
  { timestamps: true }
);

// You can add middleware/validations if needed
categorySchema.pre("validate", function (next) {
  if (!this.name) {
    return next(new Error("Category name is required"));
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
