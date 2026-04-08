import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API = 'http://localhost:1206'

export default function Navbar() {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function fetchCount() {
      fetch(`${API}/cart`)
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
  }, [])

  function handleLogout() {
    localStorage.removeItem('stitches_user')
    sessionStorage.clear()
    navigate('/')
    window.location.reload()
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-text">Stitches</span>
        <span className="navbar-logo-icon">🪡</span>
      </Link>

      <div className="navbar-actions">
        <Link to="/cart" className="nav-btn" title="Cart">
          🛒
          {cartCount > 0 && (
            <span className="nav-cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
          )}
        </Link>

        <Link to="/" className="nav-btn" title="Home">🏠</Link>

        <div className="nav-divider" />

        <button className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
