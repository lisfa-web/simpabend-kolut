import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Add helper methods for super admin checks
  const isSuperAdmin = (): boolean => {
    // Cast to satisfy types until backend types include 'super_admin'
    return context.hasRole("super_admin" as any);
  };

  const isRegularAdmin = (): boolean => {
    return context.hasRole("administrator") && !context.hasRole("super_admin" as any);
  };

  return {
    ...context,
    isSuperAdmin,
    isRegularAdmin,
  };
};
