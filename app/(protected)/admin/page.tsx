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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { User, userApi } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<Array<User>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [activeTab, setActiveTab] = useState("users");
  const [newUser, setNewUser] = useState({
    fullname: "",
    username: "",
    role: "" as "STUDENT" | "TRAINER" | "ADMIN",
    password: "",
  });
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and selected role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setActiveTab("create-user");
  };

  const handleEditUser = (userId: number) => {
    router.push(`/admin/edit-user/${userId}`);
  };

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    setLoading(true);
    try {
      const response = await userApi.deleteUser(deleteUserId);

      if (response.success) {
        alert("Utilisateur supprimé avec succès !");
        setDeleteUserId(null);
        // Update users state to remove deleted user
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== deleteUserId)
        );
      } else {
        alert(
          response.error?.message ||
            "La suppression de l'utilisateur a échoué. Veuillez réessayer."
        );
        setDeleteUserId(null);
      }
    } catch (error) {
      console.error("User deletion failed:", error);
      alert("La suppression de l'utilisateur a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const response = await userApi.createUser(newUser);
      console.log("user to create:", newUser);
      if (response.success) {
        alert("Utilisateur créé avec succès !");
        setNewUser({
          fullname: "",
          username: "",
          role: "" as "STUDENT" | "TRAINER" | "ADMIN",
          password: "",
        });
        setActiveTab("users");
        setUsers((prevUsers) => [...prevUsers, response.data]);
      } else {
        setError(
          response.error?.message ||
            "La création de l'utilisateur a échoué. Veuillez réessayer."
        );
      }
    } catch (error) {
      setError("Could not create user. " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
        <p className="text-muted-foreground">
          Gérer les utilisateurs et les analyses de la plateforme
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="users">Gestion des Utilisateurs</TabsTrigger>
          <TabsTrigger value="create-user">Créer un Utilisateur</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Utilisateur
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tous les Rôles</SelectItem>
                <SelectItem value="STUDENT">Étudiant</SelectItem>
                <SelectItem value="TRAINER">Formateur</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d&apos;inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullname}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "ADMIN"
                            ? "bg-red-100 border-red-300 text-red-500  hover:text-red-700"
                            : user.role === "STUDENT"
                            ? "bg-blue-100 border-blue-300 text-blue-500  hover:text-blue-700"
                            : "bg-orange-100 border-orange-300 text-orange-500  hover:text-orange-700"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                        >
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
              <CardTitle>Créer un Nouvel Utilisateur</CardTitle>
              <CardDescription>
                Ajouter un nouvel utilisateur à la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom Complet</Label>
                  <Input
                    id="name"
                    placeholder="Entrez le nom complet"
                    value={newUser.fullname}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullname: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Entrez l'adresse email"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        role: value as "STUDENT" | "TRAINER" | "ADMIN",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
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
                    Mot de passe (min 8 caractères)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez le mot de passe"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
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
                  onClick={handleCreateUser}
                  disabled={
                    !newUser.fullname ||
                    !newUser.username ||
                    !newUser.role ||
                    !newUser.password ||
                    loading
                  }
                >
                  {loading ? "Création en cours..." : "Créer l'Utilisateur"}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  Annuler
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
            <DialogTitle>Confirmer la Suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
              ne peut pas être annulée et supprimera définitivement
              l&apos;utilisateur de la plateforme.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUserId(null)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={loading}
            >
              {loading ? "Suppression en cours..." : "Supprimer l'Utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
