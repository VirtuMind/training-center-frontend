"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, BookOpen, TrendingUp, Search, Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { userApi } from "@/lib/api"

const users = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Student",
    joinDate: "2024-01-10",
    coursesEnrolled: 3,
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Trainer",
    joinDate: "2023-12-15",
    coursesEnrolled: 0,
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike@example.com",
    role: "Student",
    joinDate: "2024-01-05",
    coursesEnrolled: 1,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Admin",
    joinDate: "2023-11-20",
    coursesEnrolled: 0,
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("All")
  const [activeTab, setActiveTab] = useState("users")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  })
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "All" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const totalCourses = 6 // Static for now
  const totalStudents = users.filter((user) => user.role === "Student").length

  const handleAddUser = () => {
    setActiveTab("create-user")
  }

  const handleEditUser = (userId: number) => {
    router.push(`/admin/edit-user/${userId}`)
  }

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId)
  }

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return

    setLoading(true)
    try {
      const response = await userApi.deleteUser(deleteUserId)

      if (response.success) {
        alert("User deleted successfully!")
        setDeleteUserId(null)
        // In real app, refresh the users list
      } else {
        throw new Error(response.error || "User deletion failed")
      }
    } catch (error) {
      console.error("User deletion failed:", error)
      alert("User deletion failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    setLoading(true)
    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as "Student" | "Trainer" | "Admin",
        joinDate: new Date().toISOString(),
        coursesEnrolled: 0,
      }

      const response = await userApi.createUser(userData)

      if (response.success) {
        alert("User created successfully!")
        setNewUser({ name: "", email: "", role: "", password: "" })
        setActiveTab("users")
      } else {
        throw new Error(response.error || "User creation failed")
      }
    } catch (error) {
      console.error("User creation failed:", error)
      alert("User creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and platform analytics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Trainer">Trainer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{user.coursesEnrolled}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="create-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Trainer">Trainer</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateUser}
                  disabled={!newUser.name || !newUser.email || !newUser.role || !newUser.password || loading}
                >
                  {loading ? "Creating..." : "Create User"}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove the
              user from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={loading}>
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
