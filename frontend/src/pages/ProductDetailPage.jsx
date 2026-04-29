import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './ProductDetailPage.css'

const API = 'http://localhost:1206'

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('stitches_user'))
    return u?._id || 'guest'
  } catch { return 'guest' }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct]   = useState(null)
  const [shop, setShop]         = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [adding, setAdding]     = useState(false)
  const [toast, setToast]       = useState(null)

  useEffect(() => {
    fetch(`${API}/product/${id}`)
      .then(r => r.json())
      .then(async data => {
        if (data.success) {
          setProduct(data.product)
          if (data.product.shopId) {
            try {
              const shopRes  = await fetch(`${API}/dashboard/shop/${data.product.shopId}`)
              const shopData = await shopRes.json()
              if (shopData.success) setShop(shopData.shop)
            } catch {}
          }
        } else setError('Product not found.')
        setLoading(false)
      })
      .catch(() => { setError('Could not connect to server.'); setLoading(false) })
  }, [id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAddToCart() {
    setAdding(true)
    const userId = getUserId()
    try {
      const res  = await fetch(`${API}/cart/add`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity, userId }),
      })
      const data = await res.json()
      if (data.success) navigate('/cart/success')
      else showToast(data.message || 'Could not add to cart.', 'error')
    } catch {
      showToast('Could not connect to server.', 'error')
    }
    setAdding(false)
  }

  if (loading) return (
    <div className="page"><div className="state-loading"><div className="spinner" /><p>Loading...</p></div></div>
  )
  if (error) return (
    <div className="page"><div className="state-error"><p>{error}</p></div></div>
  )

  return (
    <div className="page detail-page">
      <div className="detail-layout">
        <div className="detail-image-col">
          <div className="detail-image-frame">
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <span className="detail-img-fallback">👗</span>
            }
          </div>
        </div>

        <div className="detail-info-col">
          {shop && (
            <Link to={`/shop/${product.shopId}`} className="detail-shop-badge">
              🏪 {shop.shopName}
            </Link>
          )}

          <p className="detail-label">Product Details:</p>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-type">{product.type}</p>
          <p className="detail-stock">In Stock: {product.stock}</p>

          <div className="detail-divider" />
          <p className="detail-price">Price: {(product.price * quantity).toLocaleString()} BDT</p>
          <div className="detail-divider" />

          <div className="detail-qty-section">
            <p className="detail-qty-label">Set Quantity</p>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} disabled={quantity <= 1}>−</button>
              <span className="qty-num">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)} disabled={quantity >= product.stock}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-plum btn-lg detail-add-btn" onClick={handleAddToCart} disabled={adding || product.stock === 0}>
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <Link to="/cart" className="btn btn-outline btn-lg">View Cart</Link>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.type === 'error' ? '✕' : '✓'} {toast.msg}</div>
        </div>
      )}
    </div>
  )
}