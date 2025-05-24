import AssignmentManagementClient from "@/components/admin/assignments/assignment-management-client";

export default function AdminAssignmentsPage() {
  return (
    <div className="container">
      <section className="section">
        <h2 className="section-title">Manage Assignments</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Assign individuals to roles for specific Sabbaths.
        </p>
        <AssignmentManagementClient />
      </section>
    </div>
  );
}
