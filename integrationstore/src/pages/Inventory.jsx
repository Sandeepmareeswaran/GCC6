// D:\GCC6\GCC6\integrationstore\src\pages\InventoryManagement.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

const COLLECTIONS = [
  'DesignerMetal&MetalFrame',
  'FrameLess',
  'FullFrame',
  'HalfFrame',
  'SafetyGlassess',
  'Sunglassess',
];

const EMPTY_PRODUCT = {
  Brand: '',
  Cost: '',
  Description: '',
  FrameColor: '',
  ImageUrl1: '',
  ImageUrl2: '',
  ImageUrl3: '',
  Material: '',
  Name: '',
  ProductID: '',
  Shape: '',
  Status: '',
};

function InventoryManagement() {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editData, setEditData] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setSelectedProduct(null);
      try {
        const colRef = collection(db, activeCollection);
        const snap = await getDocs(colRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setProducts(list);
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCollection]);

  const openProduct = (prod) => {
    setSelectedProduct(prod);
    setEditData({
      Brand: prod.Brand || '',
      Cost: prod.Cost || '',
      Description: prod.Description || '',
      FrameColor: prod.FrameColor || '',
      ImageUrl1: prod.ImageUrl1 || '',
      ImageUrl2: prod.ImageUrl2 || '',
      ImageUrl3: prod.ImageUrl3 || '',
      Material: prod.Material || '',
      Name: prod.Name || '',
      ProductID: prod.ProductID || '',
      Shape: prod.Shape || '',
      Status: prod.Status || '',
    });
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const docRef = doc(db, activeCollection, selectedProduct.id);
      await updateDoc(docRef, editData);
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...editData } : p))
      );
      setSelectedProduct((prev) => (prev ? { ...prev, ...editData } : prev));
    } catch (err) {
      console.error('Error updating product', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedProduct.Name || selectedProduct.id}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const docRef = doc(db, activeCollection, selectedProduct.id);
      await deleteDoc(docRef);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product', err);
    } finally {
      setDeleting(false);
    }
  };

  const getCollectionLabel = (col) => {
    return col
      .replace('DesignerMetal&MetalFrame', 'Designer Metal')
      .replace('FrameLess', 'Frame Less')
      .replace('FullFrame', 'Full Frame')
      .replace('HalfFrame', 'Half Frame')
      .replace('SafetyGlassess', 'Safety Glasses')
      .replace('Sunglassess', 'Sunglasses');
  };

  return (
    <div className="inventory-container">
      {/* Header Section */}
      <div className="inventory-header">
        <div>
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">
            Manage and update product inventory across all categories
          </p>
        </div>
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-label">Current Collection:</span>
            <span className="stat-value">{getCollectionLabel(activeCollection)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Products:</span>
            <span className="stat-value">{products.length}</span>
          </div>
        </div>
      </div>

      {/* Category Selection - 3 columns layout */}
      <div className="category-section">
        <div className="section-header">
          <h3 className="section-title">Product Categories</h3>
          <p className="section-subtitle">Select a category to view products</p>
        </div>
        <div className="category-grid">
          {COLLECTIONS.map((col) => (
            <div
              key={col}
              className={`category-card ${activeCollection === col ? 'active' : ''}`}
              onClick={() => setActiveCollection(col)}
            >
              <div className="category-icon">
                <span>👓</span>
              </div>
              <div className="category-content">
                <h4 className="category-title">{getCollectionLabel(col)}</h4>
                {products.filter(p => p.Status === 'Active').length > 0 && (
                  <p className="category-count">
                    {products.filter(p => p.Status === 'Active').length} Active
                  </p>
                )}
              </div>
              {activeCollection === col && <div className="active-indicator"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Two Pane Layout */}
      <div className="content-grid">
        {/* Left Pane - Products List */}
        <div className="products-pane">
          <div className="pane-header">
            <h3 className="pane-title">Products ({getCollectionLabel(activeCollection)})</h3>
            <div className="pane-actions">
              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="products-list">
            {!loading && products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h4>No Products Found</h4>
                <p>There are no products in this category.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                    onClick={() => openProduct(product)}
                  >
                    <div className="product-image-container">
                      {product.ImageUrl1 ? (
                        <img
                          src={product.ImageUrl1}
                          alt={product.Name}
                          className="product-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">👓</div>
                      )}
                      <div className="product-status">
                        <span className={`status-badge ${product.Status === 'Active' ? 'active' : 'inactive'}`}>
                          {product.Status || 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <h4 className="product-name" title={product.Name}>
                        {product.Name || product.ProductID || 'Unnamed Product'}
                      </h4>
                      <div className="product-details">
                        <div className="detail-row">
                          <span className="detail-label">Brand:</span>
                          <span className="detail-value">{product.Brand || '-'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cost:</span>
                          <span className="detail-value cost">
                            {product.Cost ? `$${parseFloat(product.Cost).toFixed(2)}` : '-'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">ID:</span>
                          <code className="product-id">{product.ProductID || product.id.substring(0, 8)}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Product Details */}
        <div className="details-pane">
          {!selectedProduct ? (
            <div className="empty-details">
              <div className="empty-details-icon">📝</div>
              <h4>No Product Selected</h4>
              <p>Select a product from the list to view and edit its details</p>
            </div>
          ) : (
            <>
              <div className="details-header">
                <div>
                  <h3 className="details-title">Product Details</h3>
                  <div className="product-meta">
                    <span className="meta-item">
                      <span className="meta-label">Collection:</span>
                      <span className="meta-value">{getCollectionLabel(activeCollection)}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Document ID:</span>
                      <code className="meta-value">{selectedProduct.id}</code>
                    </span>
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={deleteProduct}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="button-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Product'
                  )}
                </button>
              </div>

              {/* Image Gallery */}
              <div className="image-gallery">
                {['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((key, index) => {
                  const url = editData[key];
                  if (!url) return null;
                  return (
                    <div key={key} className="image-container">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="gallery-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="image-label">Image {index + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Form Fields */}
              <div className="form-container">
                <div className="form-grid">
                  {[
                    { field: 'Name', label: 'Product Name', type: 'text', required: true },
                    { field: 'Brand', label: 'Brand', type: 'text' },
                    { field: 'Cost', label: 'Cost ($)', type: 'number' },
                    { field: 'FrameColor', label: 'Frame Color', type: 'text' },
                    { field: 'Material', label: 'Material', type: 'text' },
                    { field: 'Shape', label: 'Shape', type: 'text' },
                    { field: 'Status', label: 'Status', type: 'text', placeholder: 'Active/Inactive' },
                    { field: 'ProductID', label: 'Product ID', type: 'text' },
                  ].map(({ field, label, type, required, placeholder }) => (
                    <div key={field} className="form-group">
                      <label className="form-label">
                        {label}
                        {required && <span className="required">*</span>}
                      </label>
                      <input
                        type={type}
                        value={editData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="form-input"
                        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Image URL Fields */}
                <div className="image-urls-section">
                  <h4 className="section-subtitle">Image URLs</h4>
                  {['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((field) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{field.replace('ImageUrl', 'Image URL ')}</label>
                      <input
                        type="url"
                        value={editData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="form-input"
                        placeholder={`Enter ${field.replace('ImageUrl', 'image ')} URL`}
                      />
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={editData.Description}
                    onChange={(e) => handleChange('Description', e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Enter product description..."
                  />
                </div>

                {/* Save Button */}
                <div className="form-actions">
                  <button
                    className="save-button"
                    onClick={saveChanges}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="button-spinner"></span>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .inventory-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Header Styles */
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .inventory-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .inventory-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .collection-stats {
          display: flex;
          gap: 24px;
          background: #f9fafb;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 16px;
          color: #111827;
          font-weight: 600;
        }

        /* Category Section */
        .category-section {
          margin-bottom: 32px;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .section-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .category-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .category-card:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .category-card.active {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }

        .category-icon {
          width: 48px;
          height: 48px;
          background: #f3f4f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .category-card.active .category-icon {
          background: #dcfce7;
        }

        .category-content {
          flex: 1;
        }

        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .category-card.active .category-title {
          color: #065f46;
        }

        .category-count {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .active-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        /* Main Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          height: calc(100vh - 280px);
          min-height: 600px;
        }

        /* Products Pane */
        .products-pane {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .pane-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pane-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .products-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .product-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-card:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .product-card.selected {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }

        .product-image-container {
          position: relative;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          font-size: 48px;
          color: #d1d5db;
        }

        .product-status {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .detail-label {
          color: #6b7280;
        }

        .detail-value {
          color: #111827;
          font-weight: 500;
        }

        .detail-value.cost {
          color: #059669;
          font-weight: 600;
        }

        .product-id {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 11px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 13px;
          margin: 0;
        }

        /* Details Pane */
        .details-pane {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .empty-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6b7280;
          padding: 40px;
        }

        .empty-details-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-details h4 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .empty-details p {
          font-size: 14px;
          margin: 0;
          max-width: 300px;
        }

        .details-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #f9fafb;
        }

        .details-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .product-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .meta-label {
          color: #6b7280;
        }

        .meta-value {
          color: #111827;
          font-weight: 500;
        }

        .meta-value code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 11px;
        }

        .delete-button {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: center;
        }

        .delete-button:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .delete-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .image-gallery {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .image-container {
          position: relative;
          flex-shrink: 0;
        }

        .gallery-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .image-label {
          position: absolute;
          top: 6px;
          left: 6px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .form-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .required {
          color: #ef4444;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          transition: all 0.2s ease;
          outline: none;
          font-family: 'Inter', sans-serif;
        }

        .form-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-textarea {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          transition: all 0.2s ease;
          outline: none;
          resize: vertical;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }

        .form-textarea:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .image-urls-section {
          margin-bottom: 24px;
        }

        .image-urls-section .section-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px 0;
        }

        .form-actions {
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .save-button {
          padding: 12px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 140px;
          justify-content: center;
        }

        .save-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default InventoryManagement;