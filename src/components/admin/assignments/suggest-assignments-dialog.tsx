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
import { useAppContext } from '@/context/app-context';
import type { Person, RoleId, Assignment } from '@/types';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import { suggestAssignments, SuggestAssignmentsInput, SuggestAssignmentsOutput } from '@/ai/flows/suggest-assignments';
import { formatDateForDisplay, formatDateForDb } from '@/lib/date-utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SuggestAssignmentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string; // YYYY-MM-DD
}

export default function SuggestAssignmentsDialog({
  isOpen,
  onClose,
  targetDate,
}: SuggestAssignmentsDialogProps) {
  const { people, assignments, assignPersonToRole, getPersonById } = useAppContext();
  const { toast } = useToast();
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestedAssignments, setSuggestedAssignments] = useState<SuggestAssignmentsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError(null);
    setSuggestedAssignments(null);

    const availablePeopleForAI = people.map(p => ({
      name: p.name, // AI flow uses name to map back
      roles: p.fillableRoleIds, 
      availability: p.unavailableDates?.filter(d => d === targetDate) || [], // Simplified: only check targetDate for unavailability
    }));
    
    // Prepare historical data (simple version: list of past assignments for context)
    // More complex historical data could be beneficial for the AI.
    const historicalDataString = assignments
      .slice(0, 50) // Limit to recent 50 assignments for brevity
      .map(a => `${a.date} - ${ROLE_NAMES_MAP[a.roleId]}: ${getPersonById(a.personId || "")?.name || 'Unassigned'}`)
      .join('\n');

    const input: SuggestAssignmentsInput = {
      date: targetDate,
      roles: ROLES_CONFIG.map(r => r.name), // AI uses role names
      availablePeople: availablePeopleForAI,
      historicalData: historicalDataString || "No historical data available.",
    };

    try {
      const result = await suggestAssignments(input);
      setSuggestedAssignments(result);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
      setError("Failed to get suggestions from AI. Please try again.");
      toast({ title: "AI Suggestion Error", description: "Could not fetch suggestions.", variant: "destructive"});
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  // Fetch suggestions when dialog opens and targetDate is valid
  useEffect(() => {
    if (isOpen && targetDate) {
        fetchSuggestions();
    }
  }, [isOpen, targetDate]);


  const handleApplySuggestion = (roleName: string, personName: string | null) => {
    const role = ROLES_CONFIG.find(r => r.name === roleName);
    if (!role) return;

    let personIdToAssign: string | null = null;
    if (personName) {
      const person = people.find(p => p.name === personName);
      if (person) {
        personIdToAssign = person.id;
      } else {
        toast({ title: "Person Not Found", description: `Could not find person '${personName}' to assign.`, variant: "destructive"});
        return;
      }
    }
    
    assignPersonToRole(targetDate, role.id, personIdToAssign);
    toast({ title: "Suggestion Applied", description: `${role.name} assigned to ${personName || 'Unassigned'}.` });
    
    // Refresh suggestions or mark as applied
    if(suggestedAssignments) {
        const newSuggestions = {...suggestedAssignments};
        delete newSuggestions[roleName]; // Remove applied suggestion from display list
        if (Object.keys(newSuggestions).length === 0) {
            onClose(); // Close dialog if all suggestions applied
        } else {
            setSuggestedAssignments(newSuggestions);
        }
    }
  };
  
  const applyAllSuggestions = () => {
    if (!suggestedAssignments) return;
    let appliedCount = 0;
    Object.entries(suggestedAssignments).forEach(([roleName, personName]) => {
        const role = ROLES_CONFIG.find(r => r.name === roleName);
        if (!role) return;

        let personIdToAssign: string | null = null;
        if (personName) {
            const person = people.find(p => p.name === personName);
            if (person) {
                personIdToAssign = person.id;
            } else {
                 // Skip if person not found, or handle as error
                console.warn(`Person ${personName} not found for role ${roleName}`);
                return;
            }
        }
        assignPersonToRole(targetDate, role.id, personIdToAssign);
        appliedCount++;
    });
    if (appliedCount > 0) {
        toast({ title: "All Suggestions Applied", description: `${appliedCount} assignments updated based on AI suggestions.` });
    } else {
        toast({ title: "No Suggestions Applied", description: "No valid suggestions to apply or people not found." });
    }
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-primary" /> AI Suggested Assignments
          </DialogTitle>
          <DialogDescription>
            Review and apply AI-generated suggestions for {formatDateForDisplay(targetDate)}.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSuggestions && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Getting suggestions...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestedAssignments && !isLoadingSuggestions && Object.keys(suggestedAssignments).length > 0 && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-4 pr-2">
            {Object.entries(suggestedAssignments).map(([roleName, personName]) => (
              <Card key={roleName} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-primary">{roleName}</p>
                    <p className={`text-sm ${personName ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                      {personName || 'Suggests unassigning'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleApplySuggestion(roleName, personName)}>
                    Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {suggestedAssignments && !isLoadingSuggestions && Object.keys(suggestedAssignments).length === 0 && !error && (
            <p className="text-center text-muted-foreground py-4">No further suggestions available or all applied.</p>
        )}


        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          {suggestedAssignments && Object.keys(suggestedAssignments).length > 0 && (
            <Button type="button" variant="secondary" onClick={applyAllSuggestions} disabled={isLoadingSuggestions}>
                Apply All Remaining
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
