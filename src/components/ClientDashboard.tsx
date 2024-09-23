import ProjectTableClient from "./ProjectTableClient";

function ClientDashboard() {
  return (
    <div className="p-10">
      <div className="flex items-center justify-center">
        <p className="text-xl">Create and visualize your projects</p>
      </div>
      <ProjectTableClient />
    </div>
  );
}

export default ClientDashboard;
