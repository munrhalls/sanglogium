"use client";

import { createContext, useContext } from "react";

export const NavContext = createContext<{ closeMenu: () => void }>({ closeMenu: () => {} });

export const useNavContext = () => useContext(NavContext);
