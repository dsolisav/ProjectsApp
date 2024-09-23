"use client";

import { useState, useRef, useEffect } from "react";
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
import { Textarea } from "./ui/textarea";
import { Upload } from "lucide-react";
import { getUserData } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

interface TableRow {
  id: number;
  title: string;
  description: string;
  status: string;
  files: { file_path: string }[];
}

export default function ProjectTableClient() {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<TableRow[]>([]);
  const [userId, setUserId] = useState("");

  const validateForm = () => {
    let isValid = true;

    if (!newTitle) {
      setTitleError("Title is required.");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (!newDescription) {
      setDescriptionError("Description is required.");
      isValid = false;
    } else {
      setDescriptionError("");
    }

    if (!newFile) {
      setFileError("A file must be uploaded.");
      isValid = false;
    } else {
      setFileError("");
    }

    return isValid;
  };

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
          file_path: uploadedFilepath,
          uploaded_at: new Date(),
        },
      ])
      .select();

    if (error) {
      console.log(error);
    }
  }

  const addRow = async () => {
    if (!validateForm()) {
      return;
    }

    const uploadedFilepath = await uploadFile(newFile!);
    if (!uploadedFilepath) {
      console.error("File upload failed.");
      return;
    }

    const projectResult = await createProject();
    if (projectResult && projectResult.data) {
      await createFile(projectResult.data[0].id, uploadedFilepath);
      
      // Fetch the newly created project with its file
      const { data: newProjectData, error } = await supabase
        .from("projects")
        .select("*, files(file_path)")
        .eq("id", projectResult.data[0].id)
        .single();

      if (error) {
        console.error("Error fetching new project:", error);
      } else {
        setProjects((prevProjects) => [...prevProjects, newProjectData]);
      }
    }

    setNewTitle("");
    setNewDescription("");
    setNewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
    }
  };

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
          .select("*, files(file_path)")
          .eq("client_id", userId);
        if (error) {
          console.error(error);
        } else {
          setProjects(data);
        }
      }
    }
    fetchProjects();
  }, [userId]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  async function uploadFile(file: File) {
    const fileId = uuidv4();
    const newFilepath = userId + "/" + fileId;
    const { data, error } = await supabase.storage
      .from("files")
      .upload(newFilepath, file);
    if (error) console.log(error);
    return newFilepath;
  }

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
              <TableCell>
                {row.files && row.files[0] ? (
                  <Link
                    href={getFileUrl(row.files[0].file_path)}
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
            </TableRow>
          ))}
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
          {titleError && <p className="text-red-500 text-sm">{titleError}</p>}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="min-h-[100px]"
          />
          {descriptionError && (
            <p className="text-red-500 text-sm">{descriptionError}</p>
          )}
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
          {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
        </div>
        <Button onClick={addRow}>Create new project</Button>
      </div>
    </div>
  );
}