
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
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

  // load products whenever active collection changes
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
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, ...editData } : p
        )
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
      `Delete product "${selectedProduct.Name || selectedProduct.id}"?`
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

  return (
    <div
      style={{
        marginLeft: 80,
        padding: '20px',
        minHeight: '100vh',
        background: '#0f172a',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* TOP: 3x2 CATEGORY GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {COLLECTIONS.map((col) => {
          const label = col
            .replace('DesignerMetal&MetalFrame', 'Designer Metal')
            .replace('FrameLess', 'Frame Less')
            .replace('FullFrame', 'Full Frame')
            .replace('HalfFrame', 'Half Frame')
            .replace('SafetyGlassess', 'Safety Glasses')
            .replace('Sunglassess', 'Sunglasses');

          return (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              style={{
                borderRadius: 18,
                border:
                  activeCollection === col
                    ? '2px solid rgba(96,165,250,0.9)'
                    : '1px solid rgba(148,163,184,0.4)',
                padding: '16px',
                background:
                  activeCollection === col
                    ? 'linear-gradient(135deg,#e0f2fe,#f5f3ff)'
                    : 'linear-gradient(135deg,#020617,#0b1120)',
                color: activeCollection === col ? '#0f172a' : '#e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  activeCollection === col
                    ? '0 8px 20px rgba(59,130,246,0.35)'
                    : '0 4px 10px rgba(15,23,42,0.9)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 70,
                  borderRadius: 999,
                  border: '2px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {label}
              </div>
            </button>
          );
        })}

      </div>

      {/* BOTTOM: PRODUCTS GRID + DETAILS */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* LEFT: PRODUCTS GRID (3 per row) */}
        <div
          style={{
            flex: 1.3,
            borderRadius: 18,
            border: '1px solid #1f2937',
            background: 'linear-gradient(145deg,#020617,#020617)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            <span>
              {activeCollection} – {products.length} products
            </span>
            {loading && <span style={{ fontSize: 12 }}>Loading…</span>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!loading && products.length === 0 && (
              <div style={{ padding: 16, fontSize: 14, color: '#9ca3af' }}>
                No products found in this collection.
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openProduct(p)}
                  style={{
                    borderRadius: 14,
                    border:
                      selectedProduct && selectedProduct.id === p.id
                        ? '2px solid rgba(52,211,153,0.9)'
                        : '1px solid #111827',
                    padding: 10,
                    background:
                      selectedProduct && selectedProduct.id === p.id
                        ? 'linear-gradient(145deg,#064e3b,#022c22)'
                        : 'linear-gradient(145deg,#020617,#020617)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    minHeight: 110,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 2,
                        }}
                      >
                        {p.Name || p.ProductID || p.id}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#9ca3af',
                          lineHeight: 1.4,
                        }}
                      >
                        Brand: {p.Brand || '-'}
                        <br />
                        Cost: {p.Cost !== undefined ? p.Cost : '-'}
                        <br />
                        Status: {p.Status || '-'}
                      </div>
                    </div>
                    {p.ImageUrl1 && (
                      <img
                        src={p.ImageUrl1}
                        alt={p.Name}
                        style={{
                          width: 45,
                          height: 45,
                          objectFit: 'cover',
                          borderRadius: 10,
                          border: '1px solid #0f172a',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS / EDIT PANEL */}
        <div
          style={{
            flex: 1,
            border: '1px solid #1f2937',
            borderRadius: 18,
            background: '#020617',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {!selectedProduct ? (
            <div style={{ fontSize: 14, color: '#9ca3af' }}>
              Select a product from the grid to view and edit its details.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 18 }}>
                    {selectedProduct.Name || selectedProduct.ProductID}
                  </h2>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    ID: {selectedProduct.id} | Collection: {activeCollection}
                  </div>
                </div>
                <button
                  onClick={deleteProduct}
                  disabled={deleting}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#dc2626',
                    color: '#f9fafb',
                    cursor: deleting ? 'default' : 'pointer',
                    fontSize: 13,
                  }}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>

              {/* images preview */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((k) => {
                  const url = editData[k];
                  if (!url) return null;
                  return (
                    <img
                      key={k}
                      src={url}
                      alt={k}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 10,
                      }}
                    />
                  );
                })}
              </div>

              {/* main fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {[
                  'Name',
                  'Brand',
                  'Cost',
                  'FrameColor',
                  'Material',
                  'Shape',
                  'Status',
                  'ProductID',
                ].map((field) => (
                  <div
                    key={field}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <label style={{ marginBottom: 2, color: '#9ca3af' }}>
                      {field}
                    </label>
                    <input
                      value={editData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: 13,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* image URLs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                  gap: 8,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((field) => (
                  <div
                    key={field}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <label style={{ marginBottom: 2, color: '#9ca3af' }}>
                      {field}
                    </label>
                    <input
                      value={editData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: 13,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* description */}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ marginBottom: 2, color: '#9ca3af', fontSize: 13 }}
                >
                  Description
                </label>
                <textarea
                  value={editData.Description}
                  onChange={(e) => handleChange('Description', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #1f2937',
                    background: '#020617',
                    color: '#e5e7eb',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#22c55e',
                    color: '#0f172a',
                    cursor: saving ? 'default' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryManagement;
