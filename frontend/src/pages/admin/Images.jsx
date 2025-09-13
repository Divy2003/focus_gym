import React, { useEffect, useState } from 'react';
import { useGetHomeTransformationsQuery, useUpsertHomeTransformationsMutation } from '../../redux/api/gymApi';
import '../../styles/admin/Images.css';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyItem = () => ({ name: '', duration: '', weightLost: '', beforeImage: '', afterImage: '' });

const Images = () => {
  const { data, isFetching, refetch } = useGetHomeTransformationsQuery();
  const [upsert, { isLoading: isSaving }] = useUpsertHomeTransformationsMutation();

  const [items, setItems] = useState([emptyItem(), emptyItem(), emptyItem()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(data?.transformations) && data.transformations.length > 0) {
      // Map to max 3 items; pad to 3 for consistent UI
      const mapped = data.transformations.slice(0, 3).map(t => ({
        name: t.name || '',
        duration: t.duration || '',
        weightLost: t.weightLost || '',
        beforeImage: t.beforeImage || '',
        afterImage: t.afterImage || '',
      }));
      while (mapped.length < 3) mapped.push(emptyItem());
      setItems(mapped);
    } else {
      setItems([emptyItem(), emptyItem(), emptyItem()]);
    }
  }, [data]);

  const handleInputChange = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleFileChange = async (idx, field, file) => {
    try {
      if (!file) return;
      const dataUrl = await fileToDataUrl(file);
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: dataUrl } : it));
    } catch (e) {
      setError('Failed to read image file');
    }
  };

  const handleRemove = (idx) => {
    // Remove item by clearing fields; will be filtered out on save
    setItems(prev => prev.map((it, i) => i === idx ? emptyItem() : it));
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    try {
      // Build payload of non-empty items (require both images)
      const payload = items
        .filter(it => it.beforeImage && it.afterImage)
        .slice(0, 3)
        .map(it => ({
          name: it.name || '',
          duration: it.duration || '',
          weightLost: it.weightLost || '',
          beforeImage: it.beforeImage,
          afterImage: it.afterImage,
        }));

      await upsert({ transformations: payload }).unwrap();
      setMessage('Images saved successfully');
      refetch();
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || 'Failed to save images');
    }
  };

  return (
    <div className="images-admin-page">
      <div className="header">
        <h2>Home Page Transformations (max 3 pairs)</h2>
        <p>Upload before/after pairs. If no images are saved, the homepage shows default transformations. If any are saved, the homepage will show those.</p>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <div className="grid-3">
          {items.map((item, idx) => (
            <div className="image-pair-card" key={idx}>
              <div className="fields">
                <label>
                  Name
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                    placeholder={`Member ${idx + 1}`}
                  />
                </label>
                <div className="row">
                  <label>
                    Duration
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleInputChange(idx, 'duration', e.target.value)}
                      placeholder="e.g., 6 months"
                    />
                  </label>
                  <label>
                    Weight Lost
                    <input
                      type="text"
                      value={item.weightLost}
                      onChange={(e) => handleInputChange(idx, 'weightLost', e.target.value)}
                      placeholder="e.g., 8 Kg"
                    />
                  </label>
                </div>
              </div>

              <div className="images-row">
                <div className="image-upload">
                  <div className="preview">
                    {item.beforeImage ? (
                      <img src={item.beforeImage} alt="Before preview" />
                    ) : (
                      <div className="placeholder">Before</div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(idx, 'beforeImage', e.target.files?.[0])} />
                </div>
                <div className="image-upload">
                  <div className="preview">
                    {item.afterImage ? (
                      <img src={item.afterImage} alt="After preview" />
                    ) : (
                      <div className="placeholder">After</div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(idx, 'afterImage', e.target.files?.[0])} />
                </div>
              </div>

              <div className="actions">
                <button className="danger" onClick={() => handleRemove(idx)}>Clear Pair</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer-actions">
        <button className="primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );
};

export default Images;
