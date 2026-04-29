import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './ShopDashboard.css'

const API = 'http://localhost:1206'

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="toast-wrap">
      <div className={`toast ${toast.type}`}>
        {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
      </div>
    </div>
  )
}

export default function ShopDashboard() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('orders')
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const [user, setUser]         = useState(null)

  // Edit product
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({})

  // Add product form
  const [showAddForm, setShowAddForm]   = useState(false)
  const [newProduct, setNewProduct]     = useState({ name: '', type: '', price: '', stock: '', image: '' })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [adding, setAdding]             = useState(false)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Auth check ──────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('stitches_user')
    if (!stored) { navigate('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'shopOwner' && parsed.role !== 'shopkeeper') {navigate('/home') 
      return}
    setUser(parsed)
  }, [navigate])

  // ── Load data ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [oRes, pRes] = await Promise.all([
          fetch(`${API}/dashboard/orders?userId=${user._id}`),
          fetch(`${API}/dashboard/products?userId=${user._id}`),
        ])
        const oData = await oRes.json()
        const pData = await pRes.json()
        if (oData.success) setOrders(oData.orders)
        if (pData.success) setProducts(pData.products)
      } catch { showToast('Could not connect to server.', 'error') }
      setLoading(false)
    }
    load()
  }, [user])

  // ── Image file → base64 ─────────────────────────────────────
  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageFile(reader.result)
      setImagePreview(reader.result)
      setNewProduct(p => ({ ...p, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // ── Order status ────────────────────────────────────────────
  async function handleOrderStatus(orderId, status) {
    try {
      const res  = await fetch(`${API}/dashboard/orders/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o))
        showToast(`Order ${status.toLowerCase()}`)
      } else showToast(data.message, 'error')
    } catch { showToast('Could not update order.', 'error') }
  }

  // ── Product edit ────────────────────────────────────────────
  function startEdit(p) {
    setEditingId(p._id)
    setEditForm({ name: p.name, type: p.type, price: p.price, stock: p.stock, image: p.image || '' })
  }

  async function saveEdit(id) {
    try {
      const res  = await fetch(`${API}/dashboard/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === id ? data.product : p))
        setEditingId(null)
        showToast('Product updated')
      } else showToast(data.message, 'error')
    } catch { showToast('Could not update.', 'error') }
  }

  // ── Product delete ──────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    try {
      const res  = await fetch(`${API}/dashboard/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id))
        showToast('Product deleted')
      } else showToast(data.message, 'error')
    } catch { showToast('Could not delete.', 'error') }
  }

  // ── Add product ─────────────────────────────────────────────
  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      showToast('Name, price and stock are required.', 'error'); return
    }
    setAdding(true)
    try {
      const res  = await fetch(`${API}/dashboard/products`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, userId: user._id }),
      })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => [data.product, ...prev])
        setNewProduct({ name: '', type: '', price: '', stock: '', image: '' })
        setImagePreview('')
        setShowAddForm(false)
        showToast('Product added')
      } else showToast(data.message, 'error')
    } catch { showToast('Could not add product.', 'error') }
    setAdding(false)
  }

 function statusClass(s) {
  const m = {
    Placed: 'placed',
    Pending: 'pending',
    pending: 'pending',
    Accepted: 'accepted',
    Rejected: 'rejected',
    Completed: 'completed',
    'Out for Delivery': 'delivery',
  }
  return `status-badge ${m[s] || 'unknown'}`
}

  if (loading) return (
    <div className="page"><div className="state-loading"><div className="spinner" /><p>Loading dashboard...</p></div></div>
  )

  return (
    <div className="page dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-eyebrow">Shop Owner</p>
          <h1 className="dash-title">Dashboard</h1>
          {user && <p className="dash-welcome">Welcome back, {user.name} 👋</p>}
        </div>
        <div className="dash-header-right">
          <div className="dash-stats">
            <div className="dash-stat"><span>{orders.length}</span><p>Orders</p></div>
            <div className="dash-stat"><span>{products.length}</span><p>Products</p></div>
            <div className="dash-stat">
              <span>{orders.filter(o => o.status === 'Pending').length}</span>
              <p>Pending</p>
            </div>
          </div>
          <div className="dash-quick-btns">
            <Link to="/shop-profile" className="dash-quick-btn">👤 My Profile</Link>
            <Link to="/chats" className="dash-quick-btn chat">💬 Chats</Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'orders'   ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button className={`dash-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Products</button>
      </div>

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div className="dash-section">
          {orders.length === 0
            ? <div className="dash-empty"><p>No orders yet.</p></div>
            : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Order ID</th><th>Items</th><th>Total</th><th>Source</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                        <td>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td className="order-total">{order.totalPrice?.toLocaleString()} BDT</td>
                        <td>
                          <span className={`source-tag ${order.source === 'design' ? 'design' : 'product'}`}>
                            {order.source === 'design' ? 'Design' : 'Product'}
                          </span>
                        </td>
                        <td><span className={statusClass(order.status)}>{order.status}</span></td>
                        <td>
                          {order.source === 'design' && order.status === 'Pending'
                            ? (
                              <div className="action-btns">
                                <button className="action-btn accept" onClick={() => handleOrderStatus(order._id, 'Accepted')}>Accept</button>
                                <button className="action-btn reject" onClick={() => handleOrderStatus(order._id, 'Rejected')}>Reject</button>
                              </div>
                            ) : <span className="no-action">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div className="dash-section">
          <div className="products-tab-header">
            <p className="products-tab-count">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="products-tab-actions">
              <button className="btn btn-outline" onClick={() => navigate('/add-fabric')}>
                + Add Fabric
              </button>
              <button className="btn btn-plum" onClick={() => setShowAddForm(v => !v)}>
                {showAddForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>
          </div>

          {/* Add product form */}
          {showAddForm && (
            <div className="add-product-form">
              <h3 className="add-form-title">New Product</h3>
              <div className="form-grid">
                {[
                  { key: 'name',  label: 'Product Name', placeholder: 'e.g. Lavender Kurti' },
                  { key: 'type',  label: 'Type',          placeholder: 'e.g. Customized' },
                  { key: 'price', label: 'Price (BDT)',    placeholder: 'e.g. 7149', type: 'number' },
                  { key: 'stock', label: 'Stock',          placeholder: 'e.g. 10',   type: 'number' },
                ].map(f => (
                  <div key={f.key} className="form-field">
                    <label>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={newProduct[f.key]}
                      onChange={e => setNewProduct(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                {/* Image upload */}
                <div className="form-field">
                  <label>Product Image</label>
                  <div className="image-upload-area">
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="image-preview" />
                      : <div className="image-upload-placeholder">
                          <span>📷</span>
                          <p>Click to upload image</p>
                        </div>
                    }
                    <input
                      type="file" accept="image/*" className="image-file-input"
                      onChange={handleImageFile}
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-dark" onClick={handleAddProduct} disabled={adding}>
                {adding ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          )}

          {/* Products table */}
          {products.length === 0
            ? <div className="dash-empty"><p>No products yet.</p></div>
            : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Product</th><th>Type</th><th>Price (BDT)</th><th>Stock</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        {editingId === product._id ? (
                          <>
                            <td><input className="table-input" value={editForm.name}  onChange={e => setEditForm(p => ({ ...p, name:  e.target.value }))} /></td>
                            <td><input className="table-input" value={editForm.type}  onChange={e => setEditForm(p => ({ ...p, type:  e.target.value }))} /></td>
                            <td><input className="table-input" type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} /></td>
                            <td><input className="table-input" type="number" value={editForm.stock} onChange={e => setEditForm(p => ({ ...p, stock: e.target.value }))} /></td>
                            <td>
                              <div className="action-btns">
                                <button className="action-btn accept" onClick={() => saveEdit(product._id)}>Save</button>
                                <button className="action-btn reject" onClick={() => setEditingId(null)}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <div className="product-cell">
                                {product.image && <img src={product.image} alt={product.name} className="product-thumb" />}
                                <span>{product.name}</span>
                              </div>
                            </td>
                            <td><span className="source-tag product">{product.type}</span></td>
                            <td className="order-total">{Number(product.price).toLocaleString()}</td>
                            <td>{product.stock}</td>
                            <td>
                              <div className="action-btns">
                                <button className="action-btn edit" onClick={() => startEdit(product)}>Edit</button>
                                <button className="action-btn reject" onClick={() => handleDelete(product._id)}>Delete</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
