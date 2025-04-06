import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Edit2, Trash2, Plus, X, Check } from "lucide-react"
import { StageBoard } from "~/components/stage-board"
import { useContentPlannerContext } from "~/context/content-planner-context"
import type { Stage as StageType } from "~/types"

interface StageProps {
  stage: StageType
  overlay?: boolean
}

export function Stage({ stage, overlay = false }: StageProps) {
  const { updateStage, deleteStage, addLayer } = useContentPlannerContext()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(stage.title)

  const handleSave = () => {
    updateStage(stage.id, { ...stage, title })
    setIsEditing(false)
  }

  const handleAddLayer = () => {
    addLayer(stage.id)
  }

  return (
    <Card className={`${overlay ? "border-2 border-primary" : ""}`}>
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
            <CardTitle>{stage.title}</CardTitle>
          )}

          {!overlay && !isEditing && (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteStage(stage.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <StageBoard stage={stage} />

        {!overlay && (
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={handleAddLayer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Layer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

