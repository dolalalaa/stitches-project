import { Link } from 'react-router-dom'
import './SuccessPage.css'

export default function CartSuccessPage() {
  return (
    <div className="page success-page">
      <div className="success-card">
        <div className="success-icon-circle">🛒</div>
        <h2 className="success-heading">Successfully Added to Cart!</h2>
        <div className="success-actions">
          <Link to="/cart" className="btn btn-dark btn-lg">View Cart</Link>
        </div>
      </div>
    </div>
  )
}
