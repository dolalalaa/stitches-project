import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

// ── Module 1: Nishat ──
import MannequinPage      from './pages/MannequinPage.jsx'

// ── Module 2: Nishat ──
import ProductsPage       from './pages/ProductsPage.jsx'
import ProductDetailPage  from './pages/ProductDetailPage.jsx'
import CartSuccessPage    from './pages/CartSuccessPage.jsx'
import CartPage           from './pages/CartPage.jsx'
import OrderSuccessPage   from './pages/OrderSuccessPage.jsx'

// ── Module 3: Nishat ──
import ShopDashboard      from './pages/ShopDashboard.jsx'
import ShopProfile        from './pages/ShopProfile.jsx'

// ── Teammates (uncomment when ready to merge) ──
// import MeasurementPage    from './pages/MeasurementPage.jsx'    // Kaspia M1
// import DressCustomPage    from './pages/DressCustomPage.jsx'    // Tasnim M1
// import DraftPage          from './pages/DraftPage.jsx'          // Junayed M1
// import PaymentPage        from './pages/PaymentPage.jsx'        // Kaspia M2
// import FabricPage         from './pages/FabricPage.jsx'         // Tasnim M2
// import OrderTrackPage     from './pages/OrderTrackPage.jsx'     // Junayed M2
// import ChatPage           from './pages/ChatPage.jsx'           // Kaspia M3
// import CustomerDashboard  from './pages/CustomerDashboard.jsx'  // Kaspia M3
// import ReviewPage         from './pages/ReviewPage.jsx'         // Tasnim M3
// import MagazinePage       from './pages/MagazinePage.jsx'       // Tasnim M3
// import PricePage          from './pages/PricePage.jsx'          // Junayed M3

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Module 1: Nishat ── */}
        <Route path="/mannequin"       element={<MannequinPage />} />

        {/* ── Module 2: Nishat ── */}
        <Route path="/"                element={<ProductsPage />} />
        <Route path="/product/:id"     element={<ProductDetailPage />} />
        <Route path="/cart/success"    element={<CartSuccessPage />} />
        <Route path="/cart"            element={<CartPage />} />
        <Route path="/order/success"   element={<OrderSuccessPage />} />

        {/* ── Module 3: Nishat ── */}
        <Route path="/shop-dashboard"  element={<ShopDashboard />} />
        <Route path="/shop-profile"    element={<ShopProfile />} />

        {/* ── Teammates — uncomment when merging ── */}
        {/* <Route path="/measure"          element={<MeasurementPage />} /> */}
        {/* <Route path="/customize"        element={<DressCustomPage />} /> */}
        {/* <Route path="/draft"            element={<DraftPage />} /> */}
        {/* <Route path="/payment"          element={<PaymentPage />} /> */}
        {/* <Route path="/fabrics"          element={<FabricPage />} /> */}
        {/* <Route path="/order/track/:id"  element={<OrderTrackPage />} /> */}
        {/* <Route path="/chats"            element={<ChatPage />} /> */}
        {/* <Route path="/dashboard"        element={<CustomerDashboard />} /> */}
        {/* <Route path="/reviews"          element={<ReviewPage />} /> */}
        {/* <Route path="/magazine"         element={<MagazinePage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
