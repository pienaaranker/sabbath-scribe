"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, User } from 'lucide-react';
import { useFirestore } from '@/context/firestore-context';
import type { Person, RoleId } from '@/types';
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
import PersonForm from './person-form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function PeopleManagementClient() {
  const { people, deletePerson, loading, error, currentSchedule, roles } = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleAddNew = () => {
    setEditingPerson(null);
    setIsFormOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsFormOpen(true);
  };

  const handleDelete = async (personId: string) => {
    try {
      await deletePerson(personId);
      toast({
        title: "Person Removed",
        description: "The person has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove person. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingPerson(null);
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
        <p className="text-muted-foreground">Loading people data...</p>
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
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-secondary">People List</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-secondary hover:bg-secondary/90 text-white border-0 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Person
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-serif text-secondary">{editingPerson ? 'Edit Person' : 'Add New Person'}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                {editingPerson ? 'Update the details for this person.' : 'Enter the details for the new person.'}
              </DialogDescription>
            </DialogHeader>
            <PersonForm person={editingPerson} onSuccess={onFormSubmitSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {people.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-light p-6 text-center">
            <User className="h-10 w-10 text-accent mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No people added yet.</p>
            <Button onClick={handleAddNew} variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Person
            </Button>
          </div>
        ) : (
          people.map((person) => (
            <div key={person.id} className="bg-white rounded-xl shadow-md border border-light p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-lg text-secondary">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">{person.contactInfo || 'No contact info'}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(person)} className="text-accent hover:text-primary hover:bg-light">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-accent hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif text-secondary">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {person.name} from your people list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-light text-muted-foreground hover:bg-light">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(person.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-secondary mb-1">Roles:</p>
                  <div className="flex flex-wrap gap-1">
                    {person.fillableRoleIds && person.fillableRoleIds.length > 0 ? (
                      person.fillableRoleIds.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? <Badge key={roleId} variant="outline" className="text-xs border-accent text-accent">{role.name}</Badge> : null;
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">Any role</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-xl shadow-md border border-light">
        <ScrollArea className="h-[500px] w-full rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-light">
                <TableHead className="font-serif text-secondary">Name</TableHead>
                <TableHead className="hidden md:table-cell font-serif text-secondary">Contact Info</TableHead>
                <TableHead className="font-serif text-secondary">Roles</TableHead>
                <TableHead className="text-right font-serif text-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="h-10 w-10 text-accent" />
                      <p className="text-muted-foreground">No people added yet.</p>
                      <Button onClick={handleAddNew} variant="outline" size="sm" className="mt-2 border-secondary text-secondary hover:bg-secondary hover:text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Person
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {people.map((person) => (
                <TableRow key={person.id} className="hover:bg-light/50 border-b border-light/50">
                  <TableCell className="font-medium text-secondary">{person.name}</TableCell>
                  <TableCell className="text-muted-foreground">{person.contactInfo || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {person.fillableRoleIds && person.fillableRoleIds.length > 0 ? (
                        person.fillableRoleIds.map(roleId => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? <Badge key={roleId} variant="outline" className="border-accent text-accent">{role.name}</Badge> : null;
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground">Any role</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(person)} className="text-accent hover:text-primary hover:bg-light">
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
                            This action cannot be undone. This will permanently delete {person.name} and remove them from any assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-light text-muted-foreground hover:bg-light">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(person.id)} className="bg-destructive hover:bg-destructive/90">
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
