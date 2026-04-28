import React from "react";
import { Routes, Route } from "react-router-dom";

// Your imports
import Navbar from "./components/Navbar";


import CheckoutPage from "./pages/CheckoutPage";


//samee:
import CommentPage from "./pages/CommentPage";
import MagazinePage from "./pages/MagazinePage";
import FabricPage from "./pages/FabricPage";
import SizePage from "./pages/SizePage";   //for onti
import Customize_samee from "./pages/Customize_samee";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Your Magazine Page */}
        <Route path="/magazine" element={<MagazinePage />} />

        {/* Her Checkout Page */}
        <Route path="/checkout" element={<CheckoutPage />} />

        
      
        <Route path="/comments/:shopId" element={<CommentPage />} />
        <Route path="/fabrics" element={<FabricPage />} />
        <Route path="/size" element={<SizePage />} />
        <Route path="/customize" element={<Customize_samee />} />
      </Routes>
    </>
  );
}

export default App;