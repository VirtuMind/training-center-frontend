"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { userApi } from "@/lib/api"

export default function EditUser() {
  const params = useParams()
  const router = useRouter()
  const userId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Student",
    password: "",
  })

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      const response = await userApi.getUserById(userId)
      if (response.success && response.data) {
        // In a real app, you'd populate the form with the actual user data
        console.log("Loaded user data:", response.data)
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }

  const updateUser = async () => {
    setLoading(true)
    try {
      const userData = {
        name: user.name,
        email: user.email,
        role: user.role as "Student" | "Trainer" | "Admin",
      }

      const response = await userApi.updateUser(userId, userData)

      if (response.success) {
        alert("User updated successfully!")
        router.push("/admin")
      } else {
        throw new Error(response.error || "User update failed")
      }
    } catch (error) {
      console.error("User update failed:", error)
      alert("User update failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Update user information and permissions</p>
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
              <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={user.role} onValueChange={(value) => setUser({ ...user, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Trainer">Trainer</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={updateUser} disabled={!user.name || !user.email || !user.role || loading}>
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
  )
}
