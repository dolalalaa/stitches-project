import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './ShopPage.css'

const API = 'http://localhost:1206'

export default function ShopPage() {
  const { shopId } = useParams()
  const [shop, setShop]         = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetch(`${API}/dashboard/shop/${shopId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setShop(data.shop)
          setProducts(data.products)
        } else {
          setError('Shop not found.')
        }
        setLoading(false)
      })
      .catch(() => { setError('Could not connect to server.'); setLoading(false) })
  }, [shopId])

  if (loading) return (
    <div className="page"><div className="state-loading"><div className="spinner" /><p>Loading shop...</p></div></div>
  )
  if (error) return (
    <div className="page"><div className="state-error"><p>{error}</p></div></div>
  )

  return (
    <div className="page shop-page">

      {/* Shop header */}
      <div className="shop-header">
        <div className="shop-header-left">
          {shop.profilePicture ? (
            <img src={shop.profilePicture} alt={shop.shopName} className="shop-avatar" />
          ) : (
            <div className="shop-avatar-placeholder">🏪</div>
          )}
          <div>
            <h1 className="shop-name">{shop.shopName}</h1>
            <p className="shop-owner">by {shop.ownerName}</p>
            {shop.address && <p className="shop-address">📍 {shop.address}</p>}
          </div>
        </div>

        {/* Ratings */}
        <div className="shop-ratings">
          <p className="shop-rating-label">Customer Ratings</p>
          <p className="shop-rating-empty">No ratings yet</p>
        </div>
      </div>

      <div className="shop-divider" />

      {/* Products */}
      <h2 className="shop-products-title">Products from this shop</h2>

      {products.length === 0 ? (
        <div className="state-empty"><p>No products available from this shop yet.</p></div>
      ) : (
        <div className="shop-products-grid">
          {products.map(product => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="shop-product-card"
            >
              <div className="shop-product-img">
                {product.image
                  ? <img src={product.image} alt={product.name} />
                  : <span>👗</span>
                }
              </div>
              <div className="shop-product-info">
                <h3 className="shop-product-name">{product.name}</h3>
                <p className="shop-product-type">{product.type}</p>
                <div className="shop-product-foot">
                  <span className="shop-product-price">{product.price.toLocaleString()} BDT</span>
                  <span className="shop-product-stock">Stock: {product.stock}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
