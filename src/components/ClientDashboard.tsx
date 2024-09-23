import ProjectTableClient from "./ProjectTableClient";

function ClientDashboard() {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-slate-800 mb-3 text-center">Client dashboard</p>
        <p className="text-xl font-normal text-slate-800 text-center">Here you can create new projects and review the status of existing ones.</p>
      </div>
      <ProjectTableClient />
    </div>
  );
}

export default ClientDashboard;
