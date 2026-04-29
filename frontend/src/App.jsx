import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

// ── Module 1: Nishat ──
import MannequinPage       from './pages/MannequinPage.jsx'

// ── Module 2: Nishat ──
import ProductsPage        from './pages/ProductsPage.jsx'
import ProductDetailPage   from './pages/ProductDetailPage.jsx'
import CartSuccessPage     from './pages/CartSuccessPage.jsx'
import CartPage            from './pages/CartPage.jsx'
import OrderSuccessPage    from './pages/OrderSuccessPage.jsx'

// ── Module 3: Nishat ──
import ShopDashboard       from './pages/ShopDashboard.jsx'
import ShopProfile         from './pages/ShopProfile.jsx'
import ShopPage            from './pages/ShopPage.jsx'

import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import CDashboard     from './pages/CDashboard'
import MeasurementForm from './pages/MeasurementForm'
import CheckoutPage   from './pages/CheckoutPage'
import ProfilePage    from './pages/ProfilePage'
import ChatPage       from './pages/ChatPage'
import ShopChatPage   from './pages/ShopChatPage'
import CustomerProfilePage from './pages/CustomerProfilePage'

// ── Added by Samee ──
import CommentPage from "./pages/CommentPage";
import MagazinePage from "./pages/MagazinePage";
import FabricPage from "./pages/FabricPage";

import Customize_samee from "./pages/Customize_samee";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Module 1: Nishat ── */}
        <Route path="/mannequin"        element={<MannequinPage />} />

        {/* ── Module 2: Nishat ── */}
        <Route path="/"                element={<ProductsPage />} />
        <Route path="/product/:id"     element={<ProductDetailPage />} />
        <Route path="/cart/success"    element={<CartSuccessPage />} />
        <Route path="/cart"            element={<CartPage />} />
        <Route path="/order/success"   element={<OrderSuccessPage />} />

        {/* ── Module 3: Nishat ── */}
        <Route path="/shop-dashboard"  element={<ShopDashboard />} />
        <Route path="/shop-profile"    element={<ShopProfile />} />
        <Route path="/shop/:shopId"    element={<ShopPage />} />

        {/* ── Kaspia  */}
        <Route path="/login"        element={<LoginPage />} />  
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/c-dashboard"  element={<CDashboard />} />
        <Route path="/measurements" element={<MeasurementForm />} />
        <Route path="/payment"      element={<CheckoutPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
        <Route path="/chat"         element={<ChatPage />} />
        <Route path="/shop-chat"    element={<ShopChatPage />} />
        <Route path="/customer/:customerId" element={<CustomerProfilePage />} />
        {/* ── Samee's Routes ── */}
        <Route path="/magazine"     element={<MagazinePage />} />
        <Route path="/comments/:shopId" element={<CommentPage />} />
        <Route path="/fabrics"      element={<FabricPage />} />
       
        <Route path="/customize"    element={<Customize_samee />} />
        
      </Routes>
    </BrowserRouter>
  )
}