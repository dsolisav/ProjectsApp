import ProjectTablePM from "./ProjectTablePM";

function PMDashboard() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-center">
        <p className="text-xl">Manage your projects</p>
      </div>
      <ProjectTablePM />
    </div>
  );
}

export default PMDashboard;