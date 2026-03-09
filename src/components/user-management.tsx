"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  Search,
  Filter,
  UserPlus,
  Shield,
  ShieldAlert,
  Smartphone
} from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.cn && user.cn.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading premium assets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-10 bg-background shadow-sm border-muted-foreground/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Drawer open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DrawerTrigger asChild>
            <Button className="h-10 bg-primary hover:bg-primary/90 shadow-sm gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Register New Account</DrawerTitle>
              <DrawerDescription>
                Complete the details below to create a new user profile.
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4 p-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={createFormData.username}
                  onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value.replace(/\s/g, "") })}
                  placeholder="e.g. jdoe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Access Level</Label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value: "admin" | "user") => setCreateFormData({ ...createFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Standard User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DrawerFooter className="px-6 pb-10">
              <Button onClick={handleCreate} className="w-full">Initialize Account</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Main Data Table */}
      <Card className="border-muted-foreground/10 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold px-6 py-4">Username</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Account Status</TableHead>
                  <TableHead className="font-semibold">VPN Status</TableHead>
                  <TableHead className="font-semibold">Devices</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-muted-foreground font-medium">No users found matching your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.username} className="group/row hover:bg-muted/30 transition-all duration-300 ease-in-out border-b border-muted-foreground/5 last:border-0 hover:shadow-2xl hover:shadow-primary/5">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-muted-foreground/10 transition-transform duration-300 group-hover/row:scale-110">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold leading-none transition-colors duration-300 group-hover/row:text-primary tracking-tight">{user.username}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">{user.mail || user.cn || "Active Member"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className={
                          user.role === "admin"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover/row:bg-blue-500/20 transition-all"
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20 group-hover/row:bg-slate-500/20 transition-all"
                        }>
                          {user.role === "admin" ? (
                            <Shield className="mr-1 h-3 w-3" />
                          ) : (
                            <ShieldAlert className="mr-1 h-3 w-3" />
                          )}
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"} shadow-sm transition-transform duration-300 group-hover/row:scale-125`} />
                          <span className={`text-sm font-bold tracking-tight ${user.is_active ? "text-emerald-600" : "text-red-500"}`}>
                            {user.is_active ? "Active" : "Suspended"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-full px-4 py-1 border font-bold text-[10px] uppercase tracking-widest transition-all ${user.wireguard_enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover/row:bg-emerald-100"
                            : "bg-slate-50 text-slate-700 border-slate-200 group-hover/row:bg-slate-100"
                            }`}
                        >
                          {user.wireguard_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                          <div className="p-1.5 bg-muted/50 rounded-lg group-hover/row:bg-primary/10 transition-colors">
                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground group-hover/row:text-primary transition-colors" />
                          </div>
                          <span className="font-bold">{user.device_count || 0}</span>
                          <span className="text-muted-foreground text-xs uppercase tracking-tighter">Devices</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20 active:scale-95">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 p-2 border-muted-foreground/10 shadow-2xl backdrop-blur-md">
                            <DropdownMenuItem onClick={() => openEditDialog(user)} className="gap-2 cursor-pointer rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-colors py-2.5">
                              <Edit3 className="h-4 w-4 text-blue-500" />
                              <span className="font-bold text-sm">Edit Account</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteDialogOpen(true)
                              }}
                              className="gap-2 text-destructive cursor-pointer rounded-lg hover:bg-red-500/10 transition-colors py-2.5"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="font-bold text-sm">Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Drawer open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Modify Account: {selectedUser?.username}</DrawerTitle>
            <DrawerDescription>
              Update role, status, and profile details for this account.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Display Name</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role Permissions</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value: "admin" | "user") => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Account Access</Label>
              <Select
                value={editFormData.is_active ? "true" : "false"}
                onValueChange={(value) => setEditFormData({ ...editFormData, is_active: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Open Access (Active)</SelectItem>
                  <SelectItem value="false">Restricted (Suspended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="px-6 pb-10">
            <Button onClick={handleEdit} className="w-full">Update Details</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Drawer open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </DrawerTitle>
            <DrawerDescription>
              Are you sure you want to permanently remove <strong>{selectedUser?.username}</strong>? This action cannot be undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="px-6 pb-10">
            <Button variant="destructive" onClick={handleDelete} className="w-full">Permanently Delete</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>Keep User</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
