export function getFinalRating(product) {
  if (!product) return 0;

  if (typeof product.rating === "number" && product.rating > 0) {
    return product.rating;
  }

  if (product.ratings?.length > 0) {
    const sum = product.ratings.reduce((acc, r) => acc + (r.value || 0), 0);
    return sum / product.ratings.length;
  }

  return 0;
}

export function getReviewsCount(product) {
  return product?.ratings?.length || product?.numReviews || 0;
}
