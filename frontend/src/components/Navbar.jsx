import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API = 'http://localhost:1206'

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('stitches_user'))
    return u?._id || null
  } catch { return null }
}

export default function Navbar() {
  const navigate   = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser]           = useState(null)

  useEffect(() => {
    function readUser() {
      const stored = localStorage.getItem('stitches_user')
      if (stored) {
        try { setUser(JSON.parse(stored)) }
        catch { setUser(null) }
      } else setUser(null)
    }
    readUser()
    window.addEventListener('storage', readUser)
    const id = setInterval(readUser, 2000)
    return () => { window.removeEventListener('storage', readUser); clearInterval(id) }
  }, [])

  useEffect(() => {
    function fetchCount() {
      const uid = getUserId()
      if (!uid) { setCartCount(0); return }
      fetch(`${API}/cart?userId=${uid}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const total = data.cartItems.reduce((s, i) => s + i.quantity, 0)
            setCartCount(total)
          }
        })
        .catch(() => {})
    }
    fetchCount()
    const id = setInterval(fetchCount, 4000)
    return () => clearInterval(id)
  }, [user])

  function handleLogout() {
    localStorage.removeItem('stitches_user')
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('customerName')
    sessionStorage.clear()
    setUser(null)
    setCartCount(0)
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-text">Stitches</span>
        <span className="navbar-logo-icon">🪡</span>
      </Link>

      <div className="navbar-actions">
        {user && (
          <Link to="/cart" className="nav-btn" title="Cart">
            🛍
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </Link>
        )}

        <Link to="/" className="nav-btn" title="Home">🏠</Link>

        <Link to="/magazine" className="nav-btn" title="Magazine">📖</Link>

        {user && (user.role === 'shopOwner' || user.role === 'shopkeeper') && (
          <Link to="/shop-dashboard" className="nav-btn" title="Dashboard">📊</Link>
        )}

        {user && user.role === 'customer' && (
          <Link to="/c-dashboard" className="nav-btn" title="My Dashboard">👤</Link>
        )}

        <div className="nav-divider" />

        {user ? (
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="nav-logout" style={{ textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}