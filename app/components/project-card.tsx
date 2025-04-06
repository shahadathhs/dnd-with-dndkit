import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "~/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { TaskBoard } from "~/components/task-board"
import type { Project } from "~/types"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
    data: {
      type: "project",
      project,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className="cursor-move"
        {...attributes}
        {...listeners}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-3">
          <h3 className="font-medium">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{project.title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{project.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tasks</h3>
                <TaskBoard projectId={project.id} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

