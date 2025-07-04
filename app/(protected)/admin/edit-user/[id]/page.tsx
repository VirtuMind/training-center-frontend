"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { NewUser, userApi } from "@/lib/api";

export default function EditUser() {
  const params = useParams();
  const router = useRouter();
  const userId = Number.parseInt(params.id as string);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<NewUser>({
    fullname: "",
    username: "",
    role: "" as "STUDENT" | "TRAINER" | "ADMIN",
    password: "",
  });

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const response = await userApi.getUserById(userId);
      if (response.success && response.data) {
        // Populate the form with actual user data
        setUser({
          fullname: response.data.fullname || "",
          username: response.data.username || "",
          role: response.data.role || "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const updateUser = async () => {
    setLoading(true);
    try {
      const response = await userApi.updateUser(userId, user);

      if (response.success) {
        alert("User updated successfully!");
        router.push("/admin");
      } else {
        setError(
          response.error?.message || "User update failed. Please try again."
        );
      }
    } catch (error) {
      console.error("User update failed:", error);
      alert("User update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update the user's details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user.fullname}
                onChange={(e) => setUser({ ...user, fullname: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={user.role}
                onValueChange={(value: "STUDENT" | "TRAINER" | "ADMIN") =>
                  setUser({ ...user, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                New Password (optional, min 8 carcarters)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />
            </div>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={updateUser}
              disabled={
                !user.fullname || !user.username || !user.role || loading
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Updating..." : "Update User"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
