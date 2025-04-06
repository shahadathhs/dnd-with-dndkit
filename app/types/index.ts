export interface Stage {
  id: string
  title: string
}

export interface Layer {
  id: string
  stageId: string
  title: string
}

export interface Project {
  id: string
  layerId: string
  title: string
  description: string
}

export interface TaskColumn {
  id: string
  projectId: string
  title: string
}

export interface Task {
  id: string
  columnId: string
  title: string
  description: string
}

