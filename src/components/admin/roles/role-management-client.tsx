"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, BookmarkIcon } from 'lucide-react';
import { useFirestore } from '@/context/firestore-context';
import type { Role } from '@/types';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RoleForm from './role-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function RoleManagementClient() {
  const { roles, deleteRole, loading, error, currentSchedule } = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleAddNew = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      toast({
        title: "Role Removed",
        description: "The role has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  if (!currentSchedule) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No schedule selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading roles data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Roles List</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gradient-bg text-white border-0 hover:opacity-90 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {editingRole ? 'Update the details for this role.' : 'Enter the details for the new role.'}
              </DialogDescription>
            </DialogHeader>
            <RoleForm role={editingRole} onSuccess={onFormSubmitSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        <ScrollArea className="h-[500px] w-full rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookmarkIcon className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No roles added yet.</p>
                      <Button onClick={handleAddNew} variant="outline" size="sm" className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Role
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-accent/5">
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{role.name}" role
                            and remove it from any assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(role.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}