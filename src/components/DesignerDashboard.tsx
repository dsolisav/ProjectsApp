import ProjectTableDesigner from "./ProjectTableDesigner";

function DesignerDashboard() {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-slate-800 mb-3 text-center">Designer dashboard</p>
        <p className="text-xl font-normal text-slate-800 text-center">Here you can see the projects assigned to you.</p>
      </div>
      <ProjectTableDesigner />
    </div>
  );
}

export default DesignerDashboard;