"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getUserData } from "@/lib/utils"

interface TableRow {
  id: number
  title: string
  description: string
  status: string
  client_id: string
  client_name: string
  assigned_designer_id: string | null
  assigned_designer_name: string | null
  file_path: string | null
}

interface Designer {
  id: string
  username: string
}

export default function ProjectTablePM() {
  const [userId, setUserId] = useState("")
  const [projects, setProjects] = useState<TableRow[]>([])
  const [editingProject, setEditingProject] = useState<TableRow | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [designers, setDesigners] = useState<Designer[]>([])

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserData()
      if (userData) {
        setUserId(userData.id)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    async function fetchProjects() {
      if (userId) {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            client:users!projects_client_id_fkey(id, username),
            project_assignments(designer_id),
            files(file_path)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(error)
        } else {
          const formattedProjects = await Promise.all(data.map(async (project) => {
            let designerName = null
            if (project.project_assignments.length > 0) {
              const { data: designerData } = await supabase
                .from('users')
                .select('username')
                .eq('id', project.project_assignments[0].designer_id)
                .single()
              designerName = designerData?.username
            }

            return {
              ...project,
              client_name: project.client.username,
              assigned_designer_id: project.project_assignments[0]?.designer_id || null,
              assigned_designer_name: designerName,
              file_path: project.files[0]?.file_path || null
            }
          }))

          setProjects(formattedProjects)
        }
      }
    }
    fetchProjects()
  }, [userId])

  useEffect(() => {
    async function fetchDesigners() {
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('role', 'designer')
      
      if (error) {
        console.error('Error fetching designers:', error)
      } else {
        setDesigners(data)
      }
    }
    fetchDesigners()
  }, [])

  const handleEdit = (project: TableRow) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (editingProject) {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
        })
        .eq('id', editingProject.id)

      if (projectError) {
        console.error('Error updating project:', projectError)
        return
      }

      // Update project assignment
      if (editingProject.assigned_designer_id && editingProject.assigned_designer_id !== "unassigned") {
        // First, delete any existing assignment for this project
        const { error: deleteError } = await supabase
          .from('project_assignments')
          .delete()
          .eq('project_id', editingProject.id)

        if (deleteError) {
          console.error('Error removing existing project assignment:', deleteError)
          return
        }

        // Then, insert the new assignment
        const { error: insertError } = await supabase
          .from('project_assignments')
          .insert({
            project_id: editingProject.id,
            designer_id: editingProject.assigned_designer_id
          })

        if (insertError) {
          console.error('Error updating project assignment:', insertError)
          return
        }
      } else {
        // Remove assignment if no designer is selected
        const { error: deleteError } = await supabase
          .from('project_assignments')
          .delete()
          .eq('project_id', editingProject.id)

        if (deleteError) {
          console.error('Error removing project assignment:', deleteError)
          return
        }
      }

      // Refresh the projects list
      const { data: updatedProject, error: fetchError } = await supabase
        .from("projects")
        .select(`
          *,
          client:users!projects_client_id_fkey(id, username),
          project_assignments(designer_id),
          files(file_path)
        `)
        .eq('id', editingProject.id)
        .single()

      if (fetchError) {
        console.error('Error fetching updated project:', fetchError)
        return
      }

      let designerName = null
      if (updatedProject.project_assignments.length > 0) {
        const { data: designerData } = await supabase
          .from('users')
          .select('username')
          .eq('id', updatedProject.project_assignments[0].designer_id)
          .single()
        designerName = designerData?.username
      }

      const updatedProjectRow: TableRow = {
        ...updatedProject,
        client_name: updatedProject.client.username,
        assigned_designer_id: updatedProject.project_assignments[0]?.designer_id || null,
        assigned_designer_name: designerName,
        file_path: updatedProject.files[0]?.file_path || null
      }

      setProjects(projects.map(p => p.id === editingProject.id ? updatedProjectRow : p))
      setIsModalOpen(false)
      setEditingProject(null)
    }
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
    } else {
      setProjects(projects.filter(project => project.id !== id))
    }
  }

  const handleInputChange = (field: keyof TableRow, value: string) => {
    if (editingProject) {
      setEditingProject({ ...editingProject, [field]: value })
    }
  }

  return (
    <div className="container mx-auto p-4">
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
              <TableCell>{row.title}</TableCell>
              <TableCell className="max-w-[300px] break-words whitespace-pre-line">
                {row.description}
              </TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.client_name}</TableCell>
              <TableCell>{row.file_path ? row.file_path.split("/").pop() : 'No file'}</TableCell>
              <TableCell>{row.assigned_designer_name || 'Unassigned'}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(row)} className="mr-2">Edit</Button>
                <Button onClick={() => handleDelete(row.id)} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editingProject?.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="col-span-3"
              />
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
              <Label htmlFor="designer" className="text-right">
                Assigned Designer
              </Label>
              <Select
                onValueChange={(value) => handleInputChange("assigned_designer_id", value)}
                defaultValue={editingProject?.assigned_designer_id || "unassigned"}
              >
                <SelectTrigger className="col-span-3">
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
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}