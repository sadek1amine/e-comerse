import AuthForm from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — S-Mahalat",
  description: "Sign in to your S-Mahalat marketplace account",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
