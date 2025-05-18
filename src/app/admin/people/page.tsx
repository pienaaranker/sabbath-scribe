import PeopleManagementClient from "@/components/admin/people/people-management-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPeoplePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Manage People</CardTitle>
          <CardDescription>
            Add, edit, or remove individuals. These people can then be assigned to various roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeopleManagementClient />
        </CardContent>
      </Card>
    </div>
  );
}
