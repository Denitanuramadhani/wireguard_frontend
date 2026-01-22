"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { IconPlus, IconDots, IconTrash, IconEdit } from "@tabler/icons-react"

interface User {
  username: string
  cn?: string
  mail?: string
  wireguard_enabled: boolean
  max_devices: number
  device_count: number
  has_devices: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getAdminUsers()
      setUsers(response.users || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      if (!formData.username || !formData.password) {
        toast.error("Username and password are required")
        return
      }

      await api.createUser(formData.username, formData.password, formData.role)
      toast.success("User created successfully")
      setCreateDialogOpen(false)
      setFormData({ username: "", password: "", role: "user" })
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to create user")
    }
  }

  const handleUpdateRole = async (username: string, role: "admin" | "user") => {
    try {
      await api.updateUserRole(username, role)
      toast.success(`User role updated to ${role}`)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role")
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await api.deleteUser(selectedUser.username)
      toast.success("User deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage users and their roles
              </p>
            </div>
            <Drawer open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DrawerTrigger asChild>
                <Button>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Create New User</DrawerTitle>
                  <DrawerDescription>
                    Create a new user account. The user will be created in both LDAP and MySQL.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "admin" | "user") =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DrawerFooter>
                  <Button onClick={handleCreate}>Create User</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.cn || "-"}</TableCell>
                    <TableCell>{user.mail || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.device_count} device{user.device_count !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.wireguard_enabled ? "default" : "secondary"}
                      >
                        {user.wireguard_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // Get user detail to check current role
                              api.getUserDetail(user.username)
                                .then((detail) => {
                                  const currentRole = detail.role || "user"
                                  const newRole = currentRole === "admin" ? "user" : "admin"
                                  handleUpdateRole(user.username, newRole)
                                })
                                .catch((error) => {
                                  toast.error(error.message || "Failed to get user details")
                                })
                            }}
                          >
                            <IconEdit className="mr-2 h-4 w-4" />
                            Toggle Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Drawer open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete User</DrawerTitle>
            <DrawerDescription>
              Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?
              This action cannot be undone. The user will be permanently deleted from both LDAP and MySQL.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

