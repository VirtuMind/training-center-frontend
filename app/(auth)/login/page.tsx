"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { setAccessToken, setCurrentUser } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);

      if (response.success && response.data) {
        // Store only access token and user data
        setAccessToken(response.data.accessToken);
        setCurrentUser(response.data.user);

        // Redirect based on role
        const userRole = response.data.user.role;
        if (userRole === "ADMIN") {
          router.push("/admin");
        } else if (userRole === "TRAINER") {
          router.push("/trainer");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(
          response.error?.message || "Échec de connexion. Veuillez réessayer."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Une erreur s&apos;est produite lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        <CardDescription>
          Saisissez vos identifiants pour accéder à votre compte
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nom@exemple.com"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full m-8" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Connexion"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
