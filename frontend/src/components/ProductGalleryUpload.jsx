import { useState } from 'react';
import { resolveImageUrl } from '../api/client.js';
import { uploadApi } from '../api/uploadApi.js';
import ErrorMessage from './ErrorMessage.jsx';

export default function ProductGalleryUpload({ value = [], onChange }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const images = Array.isArray(value) ? value : [];

  async function upload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadApi.productImages(files);
      const nextImages = [...images, ...(data.images || []).map((image) => image.image_url)];
      onChange(nextImages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  function remove(imageUrl) {
    onChange(images.filter((current) => current !== imageUrl));
  }

  return (
    <div className="product-image-upload product-gallery-upload wide">
      <label>
        Extra product photos
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={upload} />
      </label>
      <small>Optional. Upload extra photos from your computer or phone for the product page image slider.</small>
      {loading && <small>Uploading...</small>}
      <ErrorMessage error={error} />
      {images.length > 0 && (
        <div className="gallery-preview-grid">
          {images.map((imageUrl) => (
            <div key={imageUrl} className="gallery-preview-item">
              <img src={resolveImageUrl(imageUrl)} alt="Product gallery" />
              <button type="button" className="secondary" onClick={() => remove(imageUrl)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
