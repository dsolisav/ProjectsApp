import ProjectTablePM from "./ProjectTablePM";

function PMDashboard() {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-slate-800 mb-3 text-center">Manager dashboard</p>
        <p className="text-xl font-normal text-slate-800 text-center">Here you can edit, assign and delete projects.</p>
      </div>
      <ProjectTablePM />
    </div>
  );
}

export default PMDashboard;