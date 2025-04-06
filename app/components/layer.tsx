import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Edit2, Trash2, Plus, X, Check } from "lucide-react"
import { ProjectCard } from "~/components/project-card"
import { useContentPlannerContext } from "~/context/content-planner-context"
import type { Layer as LayerType, Project } from "~/types"

interface LayerProps {
  layer: LayerType
  projects: Project[]
  overlay?: boolean
}

export function Layer({ layer, projects, overlay = false }: LayerProps) {
  const { updateLayer, deleteLayer, addProject } = useContentPlannerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(layer.title)

  const handleSave = () => {
    updateLayer(layer.id, { ...layer, title })
    setIsEditing(false)
  }

  const handleAddProject = () => {
    addProject(layer.id)
  }

  return (
    <Card className={`w-72 shrink-0 ${overlay ? "border-2 border-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8" autoFocus />
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <CardTitle className="text-base">{layer.title}</CardTitle>
          )}

          {!overlay && !isEditing && (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteLayer(layer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

          {!overlay && (
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAddProject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

