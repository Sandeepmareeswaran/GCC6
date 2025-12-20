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
    <div
      style={{
        margin: '24px auto',
        padding: '24px',
        maxWidth: 1200,
        minHeight: '100vh',
        background: 'transparent',
        color: '#0b1220',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '6px', color: '#0b1220' }}>
          Inventory Management
        </h1>
        <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
          Manage and update product inventory across all categories
        </p>
      </div>

      <div>
        <div style={{ marginBottom: '12px', color: '#0b1220', fontSize: '13px', fontWeight: 600 }}>Select Category</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {COLLECTIONS.map((col) => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              style={{
                borderRadius: '12px',
                border: activeCollection === col ? '2px solid rgba(34,197,94,0.25)' : '1px solid rgba(12,18,24,0.06)',
                padding: '14px',
                background: activeCollection === col ? 'rgba(34,197,94,0.06)' : '#ffffff',
                color: activeCollection === col ? '#064e3b' : '#0b1220',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: activeCollection === col ? '0 8px 18px rgba(16,185,129,0.06)' : '0 6px 12px rgba(12,18,24,0.04)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (activeCollection !== col) {
                  e.currentTarget.style.background = '#f6fff7';
                  e.currentTarget.style.border = '1px solid rgba(34,197,94,0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCollection !== col) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.border = '1px solid rgba(15,23,42,0.06)';
                }
              }}
            >
              {activeCollection === col && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.12)' }} />
              )}
              <div style={{ width: '100%', height: '72px', borderRadius: '10px', border: '1px solid rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '15px', padding: '0 12px', background: activeCollection === col ? '#f6fff7' : '#ffffff' }}>{getCollectionLabel(col)}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 720px', borderRadius: '12px', border: '1px solid rgba(12,18,24,0.06)', background: '#ffffff', padding: '18px', display: 'flex', flexDirection: 'column', minHeight: 0, boxShadow: '0 8px 20px rgba(12,18,24,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0b1220' }}>{getCollectionLabel(activeCollection)}</h3>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{products.length} products • {loading ? 'Loading...' : 'Ready'}</div>
            </div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px' }}>
                <div style={{ width: '12px', height: '12px', border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Loading...
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {!loading && products.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#475569', fontSize: '14px', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👓</div>
                No products found in this collection
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {products.map((p) => (
                  <div key={p.id} onClick={() => openProduct(p)} style={{ borderRadius: '10px', border: selectedProduct?.id === p.id ? '2px solid rgba(34,197,94,0.28)' : '1px solid rgba(12,18,24,0.06)', padding: '14px', background: selectedProduct?.id === p.id ? '#f6fff7' : '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => { if (selectedProduct?.id !== p.id) { e.currentTarget.style.background = '#f6fff7'; e.currentTarget.style.border = '1px solid rgba(34,197,94,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }} onMouseLeave={(e) => { if (selectedProduct?.id !== p.id) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.border = '1px solid rgba(12,18,24,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                    {selectedProduct?.id === p.id && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.12)' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: selectedProduct?.id === p.id ? '#064e3b' : '#0b1220', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.Name || p.ProductID || p.id}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}><span style={{ color: '#475569' }}>Brand:</span><span>{p.Brand || '-'}</span></div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}><span style={{ color: '#475569' }}>Cost:</span><span style={{ color: p.Cost ? '#16a34a' : '#64748b', fontWeight: p.Cost ? 600 : 'normal' }}>{p.Cost !== undefined ? `$${p.Cost}` : '-'}</span></div>
                          <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#475569' }}>Status:</span><span style={{ color: p.Status === 'Active' ? '#16a34a' : p.Status === 'Inactive' ? '#dc2626' : '#64748b', fontWeight: 600 }}>{p.Status || '-'}</span></div>
                        </div>
                      </div>
                      {p.ImageUrl1 && (
                        <img src={p.ImageUrl1} alt={p.Name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(12,18,24,0.06)', boxShadow: '0 4px 6px rgba(12,18,24,0.04)' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: '0 1 420px', border: '1px solid rgba(12,18,24,0.06)', borderRadius: '12px', background: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: 0, boxShadow: '0 8px 20px rgba(12,18,24,0.06)' }}>
          {!selectedProduct ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '14px', gap: '16px', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid rgba(16,185,129,0.12)', marginBottom: '8px' }}>👓</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0b1220', marginBottom: '4px' }}>Select a Product</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Choose a product from the grid to view and edit its details</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid rgba(12,18,24,0.04)' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0b1220', marginBottom: '6px' }}>{selectedProduct.Name || selectedProduct.ProductID}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ opacity: 0.7 }}>ID:</span><code style={{ background: '#f3faf3', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{selectedProduct.id}</code></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ opacity: 0.7 }}>Collection:</span><span style={{ color: '#16a34a', fontWeight: 700 }}>{getCollectionLabel(activeCollection)}</span></div>
                  </div>
                </div>
                <button onClick={deleteProduct} disabled={deleting} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease', boxShadow: '0 6px 12px rgba(220,38,38,0.08)', opacity: deleting ? 0.6 : 1 }} onMouseEnter={(e) => { if (!deleting) { e.currentTarget.style.transform = 'translateY(-1px)'; } }} onMouseLeave={(e) => { if (!deleting) { e.currentTarget.style.transform = 'translateY(0)'; } }}>{deleting ? <><div style={{ width: '12px', height: '12px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Deleting...</> : 'Delete'}</button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>{['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((k) => { const url = editData[k]; if (!url) return null; return (<div key={k} style={{ position: 'relative' }}><img src={url} alt={k} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(12,18,24,0.06)', boxShadow: '0 6px 12px rgba(12,18,24,0.04)' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} /><div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(255,255,255,0.9)', color: '#0b1220', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{k.replace('ImageUrl', 'Image ')}</div></div>); })}</div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                  {[{ field: 'Name', label: 'Product Name', required: true }, { field: 'Brand', label: 'Brand' }, { field: 'Cost', label: 'Cost ($)', type: 'number' }, { field: 'FrameColor', label: 'Frame Color' }, { field: 'Material', label: 'Material' }, { field: 'Shape', label: 'Shape' }, { field: 'Status', label: 'Status' }, { field: 'ProductID', label: 'Product ID' }].map(({ field, label, type = 'text', required = false }) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: '6px', color: '#0b1220', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>{label}{required && <span style={{ color: '#16a34a' }}>*</span>}</label>
                      <input type={type} value={editData[field]} onChange={(e) => handleChange(field, e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(12,18,24,0.06)', background: '#ffffff', color: '#0b1220', fontSize: '14px', transition: 'all 0.15s ease', outline: 'none' }} onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 6px 18px rgba(16,185,129,0.06)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(12,18,24,0.06)'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
                  {['ImageUrl1', 'ImageUrl2', 'ImageUrl3'].map((field) => {
                    return (
                      <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '6px', color: '#0b1220', fontSize: '13px', fontWeight: 600 }}>{field.replace('ImageUrl', 'Image URL ')}</label>
                        <input
                          value={editData[field]}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={`Enter ${field.replace('ImageUrl', 'image ')} URL`}
                          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(12,18,24,0.06)', background: '#ffffff', color: '#0b1220', fontSize: '14px', transition: 'all 0.15s ease', outline: 'none' }}
                          onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 6px 18px rgba(16,185,129,0.06)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'rgba(12,18,24,0.06)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ marginBottom: '6px', color: '#0b1220', fontSize: '13px', fontWeight: 600, display: 'block' }}>Description</label>
                  <textarea value={editData.Description} onChange={(e) => handleChange('Description', e.target.value)} rows={5} placeholder="Enter product description..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(12,18,24,0.06)', background: '#ffffff', color: '#0b1220', fontSize: '14px', resize: 'vertical', transition: 'all 0.15s ease', outline: 'none', fontFamily: '"Inter", sans-serif' }} onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 6px 18px rgba(16,185,129,0.06)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(12,18,24,0.06)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(12,18,24,0.04)' }}>
                <button onClick={saveChanges} disabled={saving} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease', boxShadow: '0 8px 18px rgba(16,185,129,0.08)', opacity: saving ? 0.7 : 1 }} onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; } }} onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(0)'; } }}>{saving ? <><div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Saving...</> : 'Save Changes'}</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f3faf3; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(12,18,24,0.06); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(12,18,24,0.12); }
      `}</style>
    </div>
  );
}

export default InventoryManagement;