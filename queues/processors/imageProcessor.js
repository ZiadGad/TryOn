const cloudinary = require('../../utils/cloudinary');
const Product = require('../../models/productModel');

module.exports = async (job) => {
  const { productId, imgCover, images } = job.data;

  let coverImageUrl = null;
  let additionalImageUrls = [];

  try {
    if (imgCover) {
      const coverResult = await cloudinary.uploader.upload(imgCover, {
        public_id: `${productId}-cover`,
        folder: 'products',
      });
      coverImageUrl = coverResult.secure_url;
    }

    if (images && images.length > 0) {
      const uploadPromises = images.map((file, index) =>
        cloudinary.uploader.upload(file, {
          public_id: `${productId}-${index + 1}`,
          folder: 'products',
        }),
      );

      const imageResults = await Promise.all(uploadPromises);
      additionalImageUrls = imageResults.map((result) => result.secure_url);
    }

    await Product.findByIdAndUpdate(productId, {
      imgCover: coverImageUrl,
      images: additionalImageUrls,
    });
  } catch (error) {
    console.error(
      `Error processing image upload for product ${productId}: ${error.message}`,
    );
    throw error;
  }
};
