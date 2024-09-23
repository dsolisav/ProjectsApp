import ProjectTableDesigner from "./ProjectTableDesigner";

function DesignerDashboard() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-center">
        <p className="text-xl">Review your design projects</p>
      </div>
      <ProjectTableDesigner />
    </div>
  );
}

export default DesignerDashboard;