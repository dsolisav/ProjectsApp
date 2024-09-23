"use client";

import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { getUserData } from "@/lib/utils";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";

interface TableRow {
  files: any;
  id: number;
  title: string;
  description: string;
  status: string;
  fileName: string;
}

export default function ProjectTableClient() {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [filepath, setFilepath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<TableRow[]>([]);

  // const [media, setMedia] = useState([]);
  const [userId, setUserId] = useState("");

  async function createProject() {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          client_id: userId,
          title: newTitle,
          description: newDescription,
          status: "pending",
          created_at: new Date(),
        },
      ])
      .select();
    return { data, error };
  }

  async function createFile(project_id: string, uploadedFilepath: string) {
    const { data, error } = await supabase
      .from("files")
      .insert([
        {
          project_id: project_id,
          file_path: uploadedFilepath,  // Use the file path passed from uploadFile
          uploaded_at: new Date(),
        },
      ])
      .select();
  
    if (error) {
      console.log(error);
    }
  }

  const addRow = async () => {
    if (newTitle && newDescription && newFile) {
      const newRow: TableRow = {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        status: "pending",
        fileName: newFile.name,
        files: [{ file_path: newFile.name }],
      };
      const uploadedFilepath = await uploadFile(newFile);
      if (!uploadedFilepath) {
        console.error("File upload failed.");
        return;
      }

      const projectResult = await createProject();
      if (projectResult && projectResult.data) {

        await createFile(projectResult.data[0].id, uploadedFilepath);
      }
      setProjects((prevProjects) => [...prevProjects, newRow]);
      setNewTitle("");
      setNewDescription("");
      setNewFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
    }
  };

  React.useEffect(() => {
    async function fetchUser() {
      const userData = await getUserData();
      if (userData) {
        setUserId(userData.id);
      }
    }
    fetchUser();
  }, []);

  React.useEffect(() => {
    async function fetchProjects() {
      if (userId) {
        const { data, error } = await supabase
          .from("projects")
          .select("*,files(file_path)")
          .eq("client_id", userId);
        if (error) {
          console.error(error);
        } else {
          console.log(data);
          setProjects(data);
        }
      }
    }
    fetchProjects();
  }, [userId]);

  const handleFileButtonClick = async () => {
    fileInputRef.current?.click();
  };

  async function uploadFile(file: File) {
    const fileId = uuidv4();
    const newFilepath = userId + "/" + file.name;
    const { data, error } = await supabase.storage
      .from("files")
      .upload(newFilepath, file);
    if (error) console.log(error);
    return newFilepath;
  }

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
          {projects.map((row) => {
            console.log(row);
            return (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell className="max-w-[300px] break-words whitespace-pre-line">
                  {row.description}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.files[0].file_path.split("/").pop()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Enter description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="file">Upload File</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFileButtonClick}
            >
              <Upload className="h-4 w-4" />
              <span className="sr-only">Choose file</span>
            </Button>
            <span className="text-sm text-gray-500">
              {newFile ? newFile.name : "No file chosen"}
            </span>
          </div>
          <Input
            id="file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="sr-only"
          />
        </div>
        <Button onClick={addRow}>Create new project</Button>
      </div>
    </div>
  );
}
