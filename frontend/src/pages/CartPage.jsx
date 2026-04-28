import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './CartPage.css'

const API = 'http://localhost:1206'

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('stitches_user'))
    return u?._id || 'guest'
  } catch { return 'guest' }
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems]   = useState([])
  const [totalAmount, setTotal]     = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [placingOrder, setPlacing]  = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const uid = getUserId()
    fetch(`${API}/cart?userId=${uid}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) { setCartItems(data.cartItems); setTotal(data.totalAmount) }
        else setError('Could not load cart.')
        setLoading(false)
      })
      .catch(() => { setError('Could not connect to server.'); setLoading(false) })
  }, [])

  async function handleRemove(productId) {
    const uid = getUserId()
    try {
      const res  = await fetch(`${API}/cart/remove/${productId}?userId=${uid}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCartItems(data.cartItems)
        setTotal(data.totalAmount)
        showToast('Item removed')
      } else showToast(data.message || 'Could not remove.', 'error')
    } catch { showToast('Could not connect to server.', 'error') }
  }

  async function handlePlaceOrder() {
    setPlacing(true)
    const uid = getUserId()
    try {
      const res  = await fetch(`${API}/order/place`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      })
      const data = await res.json()
      if (data.success) navigate('/order/success')
      else showToast(data.message || 'Could not place order.', 'error')
    } catch { showToast('Could not connect to server.', 'error') }
    setPlacing(false)
  }

  if (loading) return (
    <div className="page"><div className="state-loading"><div className="spinner" /><p>Loading your cart...</p></div></div>
  )
  if (error) return (
    <div className="page"><div className="state-error"><p>{error}</p></div></div>
  )

  return (
    <div className="page cart-page">
      <div className="cart-header">
        <h2 className="cart-title">In Your Cart</h2>
        <span className="cart-label-badge">Shopping Cart</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p className="cart-empty-text">Your cart is empty</p>
          <Link to="/" className="btn btn-plum btn-lg">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-col">
            {cartItems.map(item => (
              <div key={item.productId} className="cart-row">
                <div className="cart-row-img">
                  {item.image
                    ? <img src={item.image} alt={item.productName} />
                    : <span>👗</span>
                  }
                </div>
                <div className="cart-row-info">
                  <h4 className="cart-row-name">• {item.productName}</h4>
                </div>
                <div className="cart-row-qty">Qty: {item.quantity}×</div>
                <div className="cart-row-right">
                  <p className="cart-row-total">{item.totalPrice.toLocaleString()} BDT</p>
                  <button className="cart-row-remove" onClick={() => handleRemove(item.productId)} title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total-row">
              <span>Total</span>
              <span className="cart-total-amount">{totalAmount.toLocaleString()} BDT</span>
            </div>
            <button className="btn btn-dark btn-lg cart-place-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            <Link to="/" className="cart-continue-link">← Continue Shopping</Link>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.type === 'error' ? '✕' : '✓'} {toast.msg}</div>
        </div>
      )}
    </div>
  )
}