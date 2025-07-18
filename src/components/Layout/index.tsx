import { Outlet } from "react-router";

import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 bg-gray-50">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
