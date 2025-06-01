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
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-secondary">Roles List</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-secondary hover:bg-secondary/90 text-white border-0 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-serif text-secondary">{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                {editingRole ? 'Update the details for this role.' : 'Enter the details for the new role.'}
              </DialogDescription>
            </DialogHeader>
            <RoleForm role={editingRole} onSuccess={onFormSubmitSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-light">
        <ScrollArea className="h-[500px] w-full rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-light">
                <TableHead className="font-serif text-secondary">Name</TableHead>
                <TableHead className="font-serif text-secondary">Description</TableHead>
                <TableHead className="text-right font-serif text-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookmarkIcon className="h-10 w-10 text-accent" />
                      <p className="text-muted-foreground">No roles added yet.</p>
                      <Button onClick={handleAddNew} variant="outline" size="sm" className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Role
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-light/50 border-b border-light/50">
                  <TableCell className="font-medium text-secondary">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.description || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="text-accent hover:text-primary hover:bg-light">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-accent hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-serif text-secondary">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{role.name}" role
                            and remove it from any assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-light text-muted-foreground hover:bg-light">Cancel</AlertDialogCancel>
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