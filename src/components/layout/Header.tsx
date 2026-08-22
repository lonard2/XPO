"use client";

import * as React from "react";
import { Navbar } from "./Navbar";

export interface HeaderProps {
  locale?: string;
}

export function Header({ locale = "en" }: HeaderProps) {
  return <Navbar locale={locale} />;
}

export default Header;
