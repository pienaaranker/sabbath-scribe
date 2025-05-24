"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/context/firestore-context';
import { Role } from '@/types';
import { useToast } from '@/hooks/use-toast';

const roleSchema = z.object({
  id: z.string().min(1, { message: 'ID is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role: Role | null;
  onSuccess: () => void;
}

export default function RoleForm({ role, onSuccess }: RoleFormProps) {
  const { addRole, updateRole } = useFirestore();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      id: role?.id || '',
      name: role?.name || '',
      description: role?.description || '',
    },
  });

  // --- Auto-generate ID from name when creating a new role ---
  const nameValue = watch('name');
  const idValue = watch('id');
  const [idManuallyEdited, setIdManuallyEdited] = useState(false);
  const prevNameRef = useRef(role?.name || '');

  // Helper to generate the formatted id from name
  const autoIdFromName = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  useEffect(() => {
    if (!role && !idManuallyEdited) {
      // Only auto-update if the user hasn't manually edited the ID
      setValue('id', autoIdFromName(nameValue));
    }
    prevNameRef.current = nameValue;
  }, [nameValue, idManuallyEdited, role, setValue]);

  // If the user edits the ID, stop auto-syncing only if it differs from the auto-generated value
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue('id', newValue);
    if (newValue !== autoIdFromName(nameValue)) {
      setIdManuallyEdited(true);
    } else {
      setIdManuallyEdited(false);
    }
  };

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (role) {
        // Update existing role
        await updateRole(role.id, {
          name: data.name,
          description: data.description || undefined
        });
        toast({
          title: 'Role Updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Add new role with ID
        // Use the ID from the form data as the role ID
        const roleData = {
          id: data.id,
          name: data.name,
          description: data.description || undefined
        };
        await addRole(roleData);
        toast({
          title: 'Role Added',
          description: `${data.name} has been added successfully.`,
        });
      }
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: 'Failed to save role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input 
          id="name" 
          {...register('name')} 
          placeholder="Preacher"
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="id">Role ID</Label>
        <Input 
          id="id" 
          {...register('id')} 
          disabled={!!role} // Disable editing ID for existing roles
          placeholder="preacher"
          onChange={handleIdChange}
        />
        {errors.id && <p className="text-destructive text-sm">{errors.id.message}</p>}
        {!role && (
          <p className="text-sm text-muted-foreground">
            Use a simple identifier without spaces (e.g., "preacher", "elder_on_duty"). This will be auto-filled as you type the name, but you can override it.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Delivers the main sermon"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gradient-bg text-white border-0 hover:opacity-90">
          {isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Add Role'}
        </Button>
      </div>
    </form>
  );
} 