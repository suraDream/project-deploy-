"use client"
import React, { Suspense } from "react";
import Login from "@/app/components/Login";
import "@/app/css/login.css";

export default function page() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <Login />
    </Suspense>
  );
}
