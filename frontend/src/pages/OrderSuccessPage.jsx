import { Link } from 'react-router-dom'
import './SuccessPage.css'

export default function OrderSuccessPage() {
  return (
    <div className="page success-page">
      <div className="success-card">
        <div className="success-icon-circle order">🛍️</div>
        <h1 className="success-congrats">Congratulations!</h1>
        <h2 className="success-heading">You Have Successfully placed the order!</h2>
        <div className="success-actions">
          <Link to="/" className="btn btn-dark btn-lg">Track Order</Link>
        </div>
      </div>
    </div>
  )
}
