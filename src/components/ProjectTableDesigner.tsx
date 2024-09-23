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
import { getUserData } from "@/lib/utils";

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  files: { file_path: string }[];
}

interface ProjectAssignment {
  project_id: number;
  projects: Project;
}

interface TableRow {
  id: number;
  title: string;
  description: string;
  status: string;
  file_path: string | null;
}

export default function ProjectTableDesigner() {
  const [userId, setUserId] = useState('');
  const [projects, setProjects] = useState<TableRow[]>([]);

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
          .from("project_assignments")
          .select(`
            project_id,
            projects (
              id,
              title,
              description,
              status,
              files (file_path)
            )
          `)
          .eq("designer_id", userId);

        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          const formattedProjects: TableRow[] = (data as unknown as ProjectAssignment[]).map((item) => ({
            id: item.projects.id,
            title: item.projects.title,
            description: item.projects.description,
            status: item.projects.status,
            file_path: item.projects.files[0]?.file_path || null,
          }));
          setProjects(formattedProjects);
        }
      }
    }
    fetchProjects();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>File</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell className="max-w-[300px] break-words whitespace-pre-line">
                {row.description}
              </TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.file_path ? row.file_path.split("/").pop() : 'No file'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}