import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './ProductsPage.css'

const API = 'http://localhost:1206'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setProducts(data.products)
        else setError('Could not load products.')
        setLoading(false)
      })
      .catch(() => {
        setError('Could not connect to server. Make sure the backend is running.')
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="page">
      <div className="state-loading"><div className="spinner" /><p>Loading...</p></div>
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="state-error"><p>{error}</p></div>
    </div>
  )

  return (
    <div className="page products-page">
      <h1 className="products-title">Our Collection</h1>

      {products.length === 0 ? (
        <div className="state-empty"><p>No products found.</p></div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <Link key={product._id} to={`/product/${product._id}`} className="product-card">
              <div className="product-card-img">
                {product.image
                  ? <img src={product.image} alt={product.name} />
                  : <span className="product-card-img-fallback">👗</span>
                }
                <div className="product-card-overlay"><span>View Details</span></div>
              </div>
              <div className="product-card-body">
                <div className="product-card-top">
                  <h3 className="product-card-name">{product.name}</h3>
                  <span className="product-card-tag">{product.type}</span>
                </div>
                <div className="product-card-foot">
                  <span className="product-card-price">{product.price.toLocaleString()} BDT</span>
                  <span className={`product-card-stock ${product.stock < 3 ? 'low' : ''}`}>
                    In Stock: {product.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
