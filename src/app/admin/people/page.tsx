import PeopleManagementClient from "@/components/admin/people/people-management-client";

export default function AdminPeoplePage() {
  return (
    <div className="container">
      <section className="section">
        <h2 className="section-title">Manage People</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Add, edit, or remove individuals. These people can then be assigned to various roles.
        </p>
        <PeopleManagementClient />
      </section>
    </div>
  );
}
