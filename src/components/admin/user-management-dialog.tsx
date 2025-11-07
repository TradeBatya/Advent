"use client"

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"

interface UserManagementDialogProps {
  userId: string
  username: string
  currentRole: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UserManagementDialog({
  userId,
  username,
  currentRole,
  open,
  onOpenChange,
  onSuccess,
}: UserManagementDialogProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)

    try {
      // Get the new role ID
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", selectedRole)
        .single()

      if (roleError) throw roleError

      // Update user role
      const { error } = await supabase.rpc("update_user_role", {
        p_user_id: userId,
        p_role_name: selectedRole,
      })

      if (error) throw error

      toast({
        title: "Role updated",
        description: `${username}'s role changed to ${selectedRole}`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Manage User: {username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-200">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-800">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            Cancel
          </Button>
          <Button onClick={handleRoleChange} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
