import Layout from "./Layout.jsx";

import Home from "./Home";

import Article from "./Article";

import Submissions from "./Submissions";

import Checkout from "./Checkout";

import Fashion from "./Fashion";

import Art from "./Art";

import Cuisine from "./Cuisine";

import Travel from "./Travel";

import Music from "./Music";

import Wishlist from "./Wishlist";

import AdminLogin from "./AdminLogin";

import AdvertiserLogin from "./AdvertiserLogin";

import AdvertiserDashboard from "./AdvertiserDashboard";

import affiliatelogin from "./affiliatelogin";

import affiliatedashboard from "./affiliatedashboard";

import SetupAdmin from "./SetupAdmin";

import Beauty from "./Beauty";

import AdminDashboard from "./AdminDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Article: Article,
    
    Submissions: Submissions,
    
    Checkout: Checkout,
    
    Fashion: Fashion,
    
    Art: Art,
    
    Cuisine: Cuisine,
    
    Travel: Travel,
    
    Music: Music,
    
    Wishlist: Wishlist,
    
    AdminLogin: AdminLogin,
    
    AdvertiserLogin: AdvertiserLogin,
    
    AdvertiserDashboard: AdvertiserDashboard,
    
    affiliatelogin: affiliatelogin,
    
    affiliatedashboard: affiliatedashboard,
    
    SetupAdmin: SetupAdmin,
    
    Beauty: Beauty,
    
    AdminDashboard: AdminDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Article" element={<Article />} />
                
                <Route path="/Submissions" element={<Submissions />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/Fashion" element={<Fashion />} />
                
                <Route path="/Art" element={<Art />} />
                
                <Route path="/Cuisine" element={<Cuisine />} />
                
                <Route path="/Travel" element={<Travel />} />
                
                <Route path="/Music" element={<Music />} />
                
                <Route path="/Wishlist" element={<Wishlist />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/AdvertiserLogin" element={<AdvertiserLogin />} />
                
                <Route path="/AdvertiserDashboard" element={<AdvertiserDashboard />} />
                
                <Route path="/affiliatelogin" element={<affiliatelogin />} />
                
                <Route path="/affiliatedashboard" element={<affiliatedashboard />} />
                
                <Route path="/SetupAdmin" element={<SetupAdmin />} />
                
                <Route path="/Beauty" element={<Beauty />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}