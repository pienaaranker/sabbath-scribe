"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from '@/context/app-context';
import type { Person, RoleId } from '@/types';
import { ROLES_CONFIG } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

const personSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  contactInfo: z.string().optional(),
  fillableRoleIds: z.array(z.custom<RoleId>()).optional(),
  unavailableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")).optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  person?: Person | null;
  onSuccess: () => void;
}

export default function PersonForm({ person, onSuccess }: PersonFormProps) {
  const { addPerson, updatePerson } = useAppContext();
  const { toast } = useToast();

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: person?.name || '',
      contactInfo: person?.contactInfo || '',
      fillableRoleIds: person?.fillableRoleIds || [],
      unavailableDates: person?.unavailableDates || [],
    },
  });

  const selectedRoles = watch('fillableRoleIds') || [];

  const onSubmit = (data: PersonFormData) => {
    try {
      if (person) {
        updatePerson({ ...person, ...data });
        toast({
          title: "Person Updated",
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        addPerson(data);
        toast({
          title: "Person Added",
          description: `${data.name} has been successfully added.`,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${person ? 'update' : 'add'} person. Please try again.`,
        variant: "destructive",
      });
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="contactInfo">Contact Info (Email/Phone)</Label>
        <Input id="contactInfo" {...register('contactInfo')} />
        {errors.contactInfo && <p className="text-sm text-destructive mt-1">{errors.contactInfo.message}</p>}
      </div>
      <div>
        <Label>Can Fill Roles</Label>
        <ScrollArea className="h-[150px] w-full rounded-md border p-2">
          <div className="space-y-2">
            {ROLES_CONFIG.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => {
                    const currentRoles = selectedRoles;
                    if (checked) {
                      setValue('fillableRoleIds', [...currentRoles, role.id]);
                    } else {
                      setValue('fillableRoleIds', currentRoles.filter((id) => id !== role.id));
                    }
                  }}
                />
                <Label htmlFor={`role-${role.id}`} className="font-normal">{role.name}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        {errors.fillableRoleIds && <p className="text-sm text-destructive mt-1">{errors.fillableRoleIds.message}</p>}
      </div>
      
      {/* Placeholder for unavailable dates input if needed in future. For now, it's managed manually or not a primary UI feature in this form. */}
      {/* <div>
        <Label htmlFor="unavailableDates">Unavailable Dates (YYYY-MM-DD, comma-separated)</Label>
        <Input id="unavailableDates" {...register('unavailableDates', { setValueAs: (value: string) => value.split(',').map(d => d.trim()).filter(d => d) })} />
        {errors.unavailableDates && <p className="text-sm text-destructive mt-1">{errors.unavailableDates.message}</p>}
      </div> */}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" variant="secondary">{person ? 'Update Person' : 'Add Person'}</Button>
      </DialogFooter>
    </form>
  );
}
