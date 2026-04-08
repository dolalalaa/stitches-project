import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

// ── Module 2: Nishat (Order Placement + Shop Owner Dashboard) ──
import ProductsPage       from './pages/ProductsPage.jsx'
import ProductDetailPage  from './pages/ProductDetailPage.jsx'
import CartSuccessPage    from './pages/CartSuccessPage.jsx'
import CartPage           from './pages/CartPage.jsx'
import OrderSuccessPage   from './pages/OrderSuccessPage.jsx'

// ── Placeholders for teammates (uncomment when ready to merge) ──
// import MannequinPage      from './pages/MannequinPage.jsx'       // Module 1: Nishat
// import MeasurementPage    from './pages/MeasurementPage.jsx'     // Module 1: Kaspia
// import DressCustomPage    from './pages/DressCustomPage.jsx'     // Module 1: Tasnim
// import DraftPage          from './pages/DraftPage.jsx'           // Module 1: Junayed
// import PaymentPage        from './pages/PaymentPage.jsx'         // Module 2: Kaspia
// import FabricPage         from './pages/FabricPage.jsx'          // Module 2: Tasnim
// import OrderTrackPage     from './pages/OrderTrackPage.jsx'      // Module 2: Junayed
// import ChatPage           from './pages/ChatPage.jsx'            // Module 3: Kaspia
// import CustomerDashboard  from './pages/CustomerDashboard.jsx'   // Module 3: Kaspia
// import ShopOwnerDashboard from './pages/ShopOwnerDashboard.jsx'  // Module 3: Nishat
// import AdminDashboard     from './pages/AdminDashboard.jsx'      // Module 3: Nishat
// import ReviewPage         from './pages/ReviewPage.jsx'          // Module 3: Tasnim
// import MagazinePage       from './pages/MagazinePage.jsx'        // Module 3: Tasnim
// import PricePage          from './pages/PricePage.jsx'           // Module 3: Junayed

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Module 2: Nishat ── */}
        <Route path="/"              element={<ProductsPage />} />
        <Route path="/product/:id"   element={<ProductDetailPage />} />
        <Route path="/cart/success"  element={<CartSuccessPage />} />
        <Route path="/cart"          element={<CartPage />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />

        {/* ── Add teammate routes here when merging ── */}
        {/* <Route path="/mannequin"        element={<MannequinPage />} /> */}
        {/* <Route path="/measure"          element={<MeasurementPage />} /> */}
        {/* <Route path="/customize"        element={<DressCustomPage />} /> */}
        {/* <Route path="/draft"            element={<DraftPage />} /> */}
        {/* <Route path="/payment"          element={<PaymentPage />} /> */}
        {/* <Route path="/fabrics"          element={<FabricPage />} /> */}
        {/* <Route path="/order/track/:id"  element={<OrderTrackPage />} /> */}
        {/* <Route path="/chat"             element={<ChatPage />} /> */}
        {/* <Route path="/dashboard"        element={<CustomerDashboard />} /> */}
        {/* <Route path="/shop-dashboard"   element={<ShopOwnerDashboard />} /> */}
        {/* <Route path="/admin"            element={<AdminDashboard />} /> */}
        {/* <Route path="/reviews"          element={<ReviewPage />} /> */}
        {/* <Route path="/magazine"         element={<MagazinePage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
