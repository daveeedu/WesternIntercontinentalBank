"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FloatingCustomerCareButton } from "./CustomerCare";

const MainLayout = ({ children }) => {
  const pathname = usePathname();

  // Check if the current page is an auth page
  const isAuthPage = [
    "/admin-login",
    "/admin-register",
    "/admin-checkout",
    "/admin-success",
    "/admin-fail",
    "/admin-settings",
    "/login",
    "/register",
  ].includes(pathname);

  // Check if the current page is a Propeneer page
  const isPropeneerPage = pathname.includes("admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}

      <main className="flex-grow ">{children}
      <FloatingCustomerCareButton />
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

export default MainLayout;
