"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getUserData } from "@/lib/utils";
import Link from "next/link";

interface TableRow {
  id: number;
  title: string;
  description: string;
  status: string;
  client_id: string;
  client_name: string;
  assigned_designer_id: string | null;
  assigned_designer_name: string | null;
  file_path: string | null;
}

interface Designer {
  id: string;
  username: string;
}

export default function ProjectTablePM() {
  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState<TableRow[]>([]);
  const [editingProject, setEditingProject] = useState<TableRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(0)
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    status: "",
    assigned_designer_id: "",
  });

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserData();
      if (userData) {
        setUserId(userData.id);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      if (userId) {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            *,
            client:users!projects_client_id_fkey(id, username),
            project_assignments(designer_id),
            files(file_path)
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
        } else {
          const formattedProjects = await Promise.all(
            data.map(async (project) => {
              let designerName = null;
              if (project.project_assignments.length > 0) {
                const { data: designerData } = await supabase
                  .from("users")
                  .select("username")
                  .eq("id", project.project_assignments[0].designer_id)
                  .single();
                designerName = designerData?.username;
              }

              return {
                ...project,
                client_name: project.client.username,
                assigned_designer_id:
                  project.project_assignments[0]?.designer_id || null,
                assigned_designer_name: designerName,
                file_path: project.files[0]?.file_path || null,
              };
            })
          );

          setProjects(formattedProjects);
        }
      }
    }
    fetchProjects();
  }, [userId]);

  useEffect(() => {
    async function fetchDesigners() {
      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .eq("role", "designer");

      if (error) {
        console.error("Error fetching designers:", error);
      } else {
        setDesigners(data);
      }
    }
    fetchDesigners();
  }, []);

  const handleEdit = (project: TableRow) => {
    setEditingProject(project);
    setErrors({
      title: "",
      description: "",
      status: "",
      assigned_designer_id: "",
    });
    setIsModalOpen(true);
  };

  const setToDelete = (project_id : number) => {
    setProjectToDelete(project_id)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
    } else {
      setProjects(projects.filter((project) => project.id !== id));
    }
    setIsDeleteModalOpen(false)

  };

  const handleSave = async () => {
    if (!editingProject) return;

    const newErrors = {
      title: editingProject.title.trim() ? "" : "Title is required",
      description: editingProject.description.trim()
        ? ""
        : "Description is required",
      status: editingProject.status ? "" : "Status is required",
      assigned_designer_id: editingProject.assigned_designer_id
        ? ""
        : "Designer assignment is required",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => !error)) {
      const { error: projectError } = await supabase
        .from("projects")
        .update({
          title: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
        })
        .eq("id", editingProject.id);

      if (projectError) {
        console.error("Error updating project:", projectError);
        return;
      }

      if (
        editingProject.assigned_designer_id &&
        editingProject.assigned_designer_id !== "unassigned"
      ) {
        const { error: deleteError } = await supabase
          .from("project_assignments")
          .delete()
          .eq("project_id", editingProject.id);

        if (deleteError) {
          console.error(
            "Error removing existing project assignment:",
            deleteError
          );
          return;
        }

        const { error: insertError } = await supabase
          .from("project_assignments")
          .insert({
            project_id: editingProject.id,
            designer_id: editingProject.assigned_designer_id,
          });

        if (insertError) {
          console.error("Error updating project assignment:", insertError);
          return;
        }
      } else {
        const { error: deleteError } = await supabase
          .from("project_assignments")
          .delete()
          .eq("project_id", editingProject.id);

        if (deleteError) {
          console.error("Error removing project assignment:", deleteError);
          return;
        }
      }

      const { data: updatedProject, error: fetchError } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:users!projects_client_id_fkey(id, username),
          project_assignments(designer_id),
          files(file_path)
        `
        )
        .eq("id", editingProject.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated project:", fetchError);
        return;
      }

      let designerName = null;
      if (updatedProject.project_assignments.length > 0) {
        const { data: designerData } = await supabase
          .from("users")
          .select("username")
          .eq("id", updatedProject.project_assignments[0].designer_id)
          .single();
        designerName = designerData?.username;
      }

      const updatedProjectRow: TableRow = {
        ...updatedProject,
        client_name: updatedProject.client.username,
        assigned_designer_id:
          updatedProject.project_assignments[0]?.designer_id || null,
        assigned_designer_name: designerName,
        file_path: updatedProject.files[0]?.file_path || null,
      };

      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === editingProject.id ? updatedProjectRow : p
        )
      );
      setIsModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleInputChange = (field: keyof TableRow, value: string) => {
    if (editingProject) {
      setEditingProject({ ...editingProject, [field]: value });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("files").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="p-7">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Assigned Designer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-semibold">{row.title}</TableCell>
              <TableCell className="max-w-[300px] break-words whitespace-pre-line">
                {row.description}
              </TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.client_name}</TableCell>
              <TableCell>
                {row.file_path ? (
                  <Link
                    href={getFileUrl(row.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Project file
                  </Link>
                ) : (
                  "No file"
                )}
              </TableCell>
              <TableCell>
                {row.assigned_designer_name || "Unassigned"}
              </TableCell>
              <TableCell className="">
                <Button onClick={() => handleEdit(row)} className="mr-2 mb-2">
                  Edit
                </Button>
                <Button
                  onClick={() => setToDelete(row.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open = {isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this project?
          </p>
          <DialogFooter>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(projectToDelete)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editingProject?.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`col-span-3 ${errors.title ? "border-red-500" : ""}`}
              />
              {errors.title && (
                <span className="text-red-500 col-span-3">{errors.title}</span>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editingProject?.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={`col-span-3 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <span className="text-red-500 col-span-3">
                  {errors.description}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                onValueChange={(value) => handleInputChange("status", value)}
                defaultValue={editingProject?.status}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned_designer_id" className="text-right">
                Designer
              </Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("assigned_designer_id", value)
                }
                value={editingProject?.assigned_designer_id || "unassigned"}
              >
                <SelectTrigger
                  className={`col-span-3 ${
                    errors.assigned_designer_id ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a designer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {designers.map((designer) => (
                    <SelectItem key={designer.id} value={designer.id}>
                      {designer.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assigned_designer_id && (
                <span className="text-red-500 col-span-3">
                  {errors.assigned_designer_id}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
