import AuthForm from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — S-Mahalat",
  description: "Create an account on S-Mahalat multi-vendor marketplace",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
