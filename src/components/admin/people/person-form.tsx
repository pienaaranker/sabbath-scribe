"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore } from '@/context/firestore-context';
import { Person, RoleId } from '@/types';
import { useToast } from '@/hooks/use-toast';

const personSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  contactInfo: z.string().optional(),
  fillableRoleIds: z.array(z.string() as z.ZodType<RoleId>).optional(),
});

type PersonFormValues = z.infer<typeof personSchema>;

interface PersonFormProps {
  person: Person | null;
  onSuccess: () => void;
}

export default function PersonForm({ person, onSuccess }: PersonFormProps) {
  const { addPerson, updatePerson, roles } = useFirestore();
  const { toast } = useToast();
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: person?.name || '',
      contactInfo: person?.contactInfo || '',
      fillableRoleIds: person?.fillableRoleIds || [],
    },
  });

  const onSubmit = async (data: PersonFormValues) => {
    try {
      if (person) {
        // Update existing person
        await updatePerson(person.id, data);
        toast({
          title: 'Person Updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Add new person
        await addPerson(data);
        toast({
          title: 'Person Added',
          description: `${data.name} has been added successfully.`,
        });
      }
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: 'Error',
        description: 'Failed to save person. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactInfo">Contact Info (optional)</Label>
        <Input id="contactInfo" {...register('contactInfo')} placeholder="Email or phone number" />
      </div>
      
      <div className="space-y-3">
        <Label>Roles this person can fill (optional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Leave all unchecked if this person can fill any role.
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <Controller
                name="fillableRoleIds"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={field.value?.includes(role.id)}
                    onCheckedChange={(checked) => {
                      const currentValues = field.value || [];
                      const newValues = checked
                        ? [...currentValues, role.id]
                        : currentValues.filter((id) => id !== role.id);
                      field.onChange(newValues);
                    }}
                  />
                )}
              />
              <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                {role.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gradient-bg text-white border-0 hover:opacity-90">
          {isSubmitting ? 'Saving...' : person ? 'Update Person' : 'Add Person'}
        </Button>
      </div>
    </form>
  );
}
