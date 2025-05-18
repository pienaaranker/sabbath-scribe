"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import PersonForm from './person-form';
import { ROLES_CONFIG } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function PeopleManagementClient() {
  const { people, removePerson, isLoading } = useAppContext();
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

  const handleDelete = (personId: string) => {
    removePerson(personId);
    toast({
      title: "Person Removed",
      description: "The person has been successfully removed.",
    });
  };

  const onFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingPerson(null);
  };
  
  if (isLoading) {
    return <p>Loading people data...</p>;
  }

  return (
    <div className="space-y-4">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleAddNew} variant="secondary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Person
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingPerson ? 'Edit Person' : 'Add New Person'}</DialogTitle>
            <DialogDescription>
              {editingPerson ? 'Update the details for this person.' : 'Enter the details for the new person.'}
            </DialogDescription>
          </DialogHeader>
          <PersonForm person={editingPerson} onSuccess={onFormSubmitSuccess} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>People List</CardTitle>
          <CardDescription>View and manage all individuals.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No people added yet.
                    </TableCell>
                  </TableRow>
                )}
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.contactInfo || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {person.fillableRoleIds && person.fillableRoleIds.length > 0 ? (
                          person.fillableRoleIds.map(roleId => {
                            const role = ROLES_CONFIG.find(r => r.id === roleId);
                            return role ? <Badge key={roleId} variant="outline">{role.name}</Badge> : null;
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">Any role</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(person)}>
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
                              This action cannot be undone. This will permanently delete {person.name} and remove them from any assignments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
        </CardContent>
      </Card>
    </div>
  );
}
