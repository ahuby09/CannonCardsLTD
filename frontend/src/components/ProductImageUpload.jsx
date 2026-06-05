import { useState } from 'react';
import { uploadApi } from '../api/uploadApi.js';
import { resolveImageUrl } from '../api/client.js';
import ErrorMessage from './ErrorMessage.jsx';

export default function ProductImageUpload({ value, onChange }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadApi.productImage(file);
      onChange(data.image_url);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="product-image-upload wide">
      <label>
        Primary product image
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} />
      </label>
      <small>Optional primary image. Single cards can use the PokeWallet image; sealed products usually use your own uploaded photo.</small>
      {loading && <small>Uploading...</small>}
      <ErrorMessage error={error} />
      {value && (
        <div className="upload-preview">
          <img src={resolveImageUrl(value)} alt="Uploaded product" />
          <button type="button" className="secondary" onClick={() => onChange('')}>Remove image</button>
        </div>
      )}
    </div>
  );
}
