"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import type { Person, RoleId } from '@/types';
import { ROLE_NAMES_MAP } from '@/lib/constants';
import { formatDateForDisplay } from '@/lib/date-utils';

interface AssignPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  roleId: RoleId;
  currentPersonId: string | null;
  onSave: (personId: string | null) => void;
  people: Person[];
}

export default function AssignPersonDialog({
  isOpen,
  onClose,
  date,
  roleId,
  currentPersonId,
  onSave,
  people,
}: AssignPersonDialogProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(currentPersonId);

  useEffect(() => {
    setSelectedPersonId(currentPersonId);
  }, [currentPersonId, isOpen]);

  const roleName = ROLE_NAMES_MAP[roleId];
  const displayDate = formatDateForDisplay(date);

  // Filter people who can fill this role, or show all if no specific role capabilities defined for people
  const assignablePeople = people.filter(p => 
    !p.fillableRoleIds || p.fillableRoleIds.length === 0 || p.fillableRoleIds.includes(roleId)
  );

  const handleSubmit = () => {
    onSave(selectedPersonId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign {roleName}</DialogTitle>
          <DialogDescription>
            Assign a person to the role of {roleName} for {displayDate}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="person" className="text-right col-span-1">
              Person
            </Label>
            <Select
              value={selectedPersonId || ""}
              onValueChange={(value) => setSelectedPersonId(value === "unassign" ? null : value)}
            >
              <SelectTrigger id="person" className="col-span-3">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">-- Unassign --</SelectItem>
                {assignablePeople.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
                {assignablePeople.length === 0 && (
                    <p className="p-2 text-sm text-muted-foreground">No people available for this role.</p>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} variant="secondary">Save Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
