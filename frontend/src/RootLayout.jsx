import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function RootLayout() {
  return (
      <div className="flex flex-col min-h-screen">
        <Navbar/>
        <main className="grow p-4 md:p-6">
          <div className="flex w-full max-w-5xl m-auto">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
  );
}

export default RootLayout;
