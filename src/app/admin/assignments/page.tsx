import AssignmentManagementClient from "@/components/admin/assignments/assignment-management-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAssignmentsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Manage Assignments</CardTitle>
          <CardDescription>
            Assign individuals to roles for specific Sabbaths. You can also use AI to get suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentManagementClient />
        </CardContent>
      </Card>
    </div>
  );
}
