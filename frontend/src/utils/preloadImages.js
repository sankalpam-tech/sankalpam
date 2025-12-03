// Preload images utility to improve page load performance
export const preloadImages = (imageUrls) => {
  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

export default preloadImages;
