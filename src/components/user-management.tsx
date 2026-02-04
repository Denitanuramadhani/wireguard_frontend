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
  role?: string
  is_active?: boolean
  wireguard_enabled: boolean
  max_devices: number
  device_count: number
  has_devices: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Create Form state
  const [createFormData, setCreateFormData] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  // Edit Form state
  const [editFormData, setEditFormData] = useState({
    username: "",
    role: "user" as "admin" | "user",
    is_active: true,
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
      if (!createFormData.username || !createFormData.password) {
        toast.error("Username and password are required")
        return
      }

      await api.createUser(createFormData.username, createFormData.password, createFormData.role)
      toast.success("User created successfully")
      setCreateDialogOpen(false)
      setCreateFormData({ username: "", password: "", role: "user" })
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to create user")
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return

    try {
      await api.updateUser(selectedUser.username, {
        username: editFormData.username,
        role: editFormData.role,
        is_active: editFormData.is_active,
      })
      toast.success("User updated successfully")
      setEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Failed to update user")
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

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      username: user.username,
      role: (user.role as "admin" | "user") || "user",
      is_active: user.is_active ?? true,
    })
    setEditDialogOpen(true)
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
                Manage users, roles, and account status
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
                    Create a new user account. The user will be created in LDAP and synced to the database.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4 p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={createFormData.username}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, username: e.target.value })
                      }
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createFormData.password}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={createFormData.role}
                      onValueChange={(value: "admin" | "user") =>
                        setCreateFormData({ ...createFormData, role: value })
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
                <TableHead>Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Name/Email</TableHead>
                <TableHead>VPN Status</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "default" : "destructive"}
                        className={user.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{user.cn || "-"}</span>
                        <span className="text-xs text-muted-foreground">{user.mail || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.wireguard_enabled ? "outline" : "secondary"}
                        className={user.wireguard_enabled ? "text-blue-600 border-blue-600" : ""}
                      >
                        {user.wireguard_enabled ? "VPN Enabled" : "VPN Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.device_count} device{user.device_count !== 1 ? "s" : ""}
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
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <IconEdit className="mr-2 h-4 w-4" />
                            Edit User
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

      {/* Edit User Dialog */}
      <Drawer open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit User: {selectedUser?.username}</DrawerTitle>
            <DrawerDescription>
              Update user details. Changing the username will update its linked VPN devices.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, username: e.target.value })
                }
                placeholder="Enter new username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value: "admin" | "user") =>
                  setEditFormData({ ...editFormData, role: value })
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
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Account Status</Label>
              <Select
                value={editFormData.is_active ? "true" : "false"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, is_active: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active (Can Login)</SelectItem>
                  <SelectItem value="false">Inactive (Blocked)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleEdit}>Save Changes</Button>
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

      {/* Delete Confirmation Dialog */}
      <Drawer open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete User</DrawerTitle>
            <DrawerDescription>
              Are you sure you want to delete user <strong>{selectedUser?.username}</strong>?
              This action cannot be undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Permanently
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

