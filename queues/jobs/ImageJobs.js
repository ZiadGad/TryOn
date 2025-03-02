const imageQueue = require('../imageQueue');

exports.uploadImageJob = (productId, imgCover, images) => {
  imageQueue.add({ productId, imgCover, images });
};
