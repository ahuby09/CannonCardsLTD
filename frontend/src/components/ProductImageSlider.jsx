import { useEffect, useMemo, useState } from 'react';
import { resolveImageUrl } from '../api/client.js';

export default function ProductImageSlider({ product }) {
  const images = useMemo(() => {
    const sourceImages = Array.isArray(product?.images) && product.images.length
      ? product.images
      : product?.image_url
        ? [{ image_url: product.image_url, alt_text: product.display_name || 'Product image' }]
        : [];

    return sourceImages
      .map((image) => ({
        image_url: image.image_url || image,
        alt_text: image.alt_text || product?.display_name || 'Product image'
      }))
      .filter((image) => image.image_url);
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id, images.length]);

  if (!images.length) {
    return (
      <div className="product-detail__image">
        <span>No image</span>
      </div>
    );
  }

  const active = images[activeIndex] || images[0];
  const hasMultiple = images.length > 1;

  function previous() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function next() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <div className="product-image-slider">
      <div className="product-detail__image">
        <img src={resolveImageUrl(active.image_url)} alt={active.alt_text} />
        {hasMultiple && (
          <div className="product-slider-controls">
            <button type="button" className="secondary" onClick={previous} aria-label="Previous image">&lsaquo;</button>
            <button type="button" className="secondary" onClick={next} aria-label="Next image">&rsaquo;</button>
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="product-slider-thumbs">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.image_url}-${index}`}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
            >
              <img src={resolveImageUrl(image.image_url)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
