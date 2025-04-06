import { createContext, useContext, useState, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Stage, Layer, Project, TaskColumn, Task } from "~/types";

interface ContentPlannerContextType {
  stages: Stage[];
  layers: Layer[];
  projects: Project[];
  taskColumns: TaskColumn[];
  tasks: Task[];

  // Stage actions
  setStages: (stages: Stage[]) => void;
  addStage: () => void;
  updateStage: (id: string, stage: Stage) => void;
  deleteStage: (id: string) => void;

  // Layer actions
  addLayer: (stageId: string) => void;
  updateLayer: (id: string, layer: Layer) => void;
  deleteLayer: (id: string) => void;
  updateLayerOrder: (stageId: string, layers: Layer[]) => void;

  // Project actions
  addProject: (layerId: string) => void;
  updateProject: (id: string, project: Project) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, targetLayerId: string) => void;

  // Task Column actions
  addTaskColumn: (projectId: string) => void;
  updateTaskColumn: (id: string, column: TaskColumn) => void;
  deleteTaskColumn: (id: string) => void;
  updateTaskColumnOrder: (projectId: string, columns: TaskColumn[]) => void;

  // Task actions
  addTask: (columnId: string) => void;
  updateTask: (id: string, task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumnId: string) => void;
}

const ContentPlannerContext = createContext<
  ContentPlannerContextType | undefined
>(undefined);

export function ContentPlannerProvider({ children }: { children: ReactNode }) {
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "stage-1",
      title: "Production",
    },
    {
      id: "stage-2",
      title: "Post Production",
    },
  ]);

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "layer-1",
      stageId: "stage-1",
      title: "Idea",
    },
    {
      id: "layer-2",
      stageId: "stage-1",
      title: "Writing",
    },
    {
      id: "layer-3",
      stageId: "stage-1",
      title: "Editing",
    },
    {
      id: "layer-4",
      stageId: "stage-2",
      title: "Review",
    },
    {
      id: "layer-5",
      stageId: "stage-2",
      title: "Schedule",
    },
    {
      id: "layer-6",
      stageId: "stage-2",
      title: "Publish",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "project-1",
      layerId: "layer-1",
      title: "Blog Post: Getting Started with React",
      description: "An introductory guide to React for beginners.",
    },
    {
      id: "project-2",
      layerId: "layer-2",
      title: "Video Tutorial: CSS Grid",
      description: "A comprehensive tutorial on CSS Grid layout.",
    },
    {
      id: "project-3",
      layerId: "layer-4",
      title: "Podcast: Future of Web Development",
      description: "Discussion about emerging trends in web development.",
    },
  ]);

  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>([
    {
      id: "task-column-1",
      projectId: "project-1",
      title: "To Do",
    },
    {
      id: "task-column-2",
      projectId: "project-1",
      title: "In Progress",
    },
    {
      id: "task-column-3",
      projectId: "project-1",
      title: "Done",
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      columnId: "task-column-1",
      title: "Research React basics",
      description: "Gather information about React fundamentals.",
    },
    {
      id: "task-2",
      columnId: "task-column-1",
      title: "Create outline",
      description: "Structure the blog post content.",
    },
    {
      id: "task-3",
      columnId: "task-column-2",
      title: "Write introduction",
      description: "Create an engaging introduction to React.",
    },
  ]);

  // Stage actions
  const addStage = () => {
    const newStage: Stage = {
      id: `stage-${uuidv4()}`,
      title: "New Stage",
    };

    setStages([...stages, newStage]);
  };

  const updateStage = (id: string, stage: Stage) => {
    setStages(stages.map((s) => (s.id === id ? stage : s)));
  };

  const deleteStage = (id: string) => {
    // Delete the stage
    setStages(stages.filter((s) => s.id !== id));

    // Delete all layers in the stage
    const stageLayerIds = layers
      .filter((l) => l.stageId === id)
      .map((l) => l.id);
    setLayers(layers.filter((l) => l.stageId !== id));

    // Delete all projects in those layers
    const layerProjectIds = projects
      .filter((p) => stageLayerIds.includes(p.layerId))
      .map((p) => p.id);
    setProjects(projects.filter((p) => !stageLayerIds.includes(p.layerId)));

    // Delete all task columns in those projects
    const projectTaskColumnIds = taskColumns
      .filter((tc) => layerProjectIds.includes(tc.projectId))
      .map((tc) => tc.id);
    setTaskColumns(
      taskColumns.filter((tc) => !layerProjectIds.includes(tc.projectId))
    );

    // Delete all tasks in those columns
    setTasks(tasks.filter((t) => !projectTaskColumnIds.includes(t.columnId)));
  };

  // Layer actions
  const addLayer = (stageId: string) => {
    const newLayer: Layer = {
      id: `layer-${uuidv4()}`,
      stageId,
      title: "New Layer",
    };

    setLayers([...layers, newLayer]);
  };

  const updateLayer = (id: string, layer: Layer) => {
    setLayers(layers.map((l) => (l.id === id ? layer : l)));
  };

  const deleteLayer = (id: string) => {
    // Delete the layer
    setLayers(layers.filter((l) => l.id !== id));

    // Delete all projects in the layer
    const layerProjectIds = projects
      .filter((p) => p.layerId === id)
      .map((p) => p.id);
    setProjects(projects.filter((p) => p.layerId !== id));

    // Delete all task columns in those projects
    const projectTaskColumnIds = taskColumns
      .filter((tc) => layerProjectIds.includes(tc.projectId))
      .map((tc) => tc.id);
    setTaskColumns(
      taskColumns.filter((tc) => !layerProjectIds.includes(tc.projectId))
    );

    // Delete all tasks in those columns
    setTasks(tasks.filter((t) => !projectTaskColumnIds.includes(t.columnId)));
  };

  const updateLayerOrder = (stageId: string, newLayers: Layer[]) => {
    // Update only the layers for this stage, keep others unchanged
    const otherLayers = layers.filter((l) => l.stageId !== stageId);
    setLayers([...otherLayers, ...newLayers]);
  };

  // Project actions
  const addProject = (layerId: string) => {
    const newProject: Project = {
      id: `project-${uuidv4()}`,
      layerId,
      title: "New Project",
      description: "",
    };

    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, project: Project) => {
    setProjects(projects.map((p) => (p.id === id ? project : p)));
  };

  const deleteProject = (id: string) => {
    // Delete the project
    setProjects(projects.filter((p) => p.id !== id));

    // Delete all task columns in the project
    const projectTaskColumnIds = taskColumns
      .filter((tc) => tc.projectId === id)
      .map((tc) => tc.id);
    setTaskColumns(taskColumns.filter((tc) => tc.projectId !== id));

    // Delete all tasks in those columns
    setTasks(tasks.filter((t) => !projectTaskColumnIds.includes(t.columnId)));
  };

  const moveProject = (id: string, targetLayerId: string) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, layerId: targetLayerId } : p))
    );
  };

  // Task Column actions
  const addTaskColumn = (projectId: string) => {
    const newTaskColumn: TaskColumn = {
      id: `task-column-${uuidv4()}`,
      projectId,
      title: "New Column",
    };

    setTaskColumns([...taskColumns, newTaskColumn]);
  };

  const updateTaskColumn = (id: string, column: TaskColumn) => {
    setTaskColumns(taskColumns.map((tc) => (tc.id === id ? column : tc)));
  };

  const deleteTaskColumn = (id: string) => {
    // Delete the task column
    setTaskColumns(taskColumns.filter((tc) => tc.id !== id));

    // Delete all tasks in the column
    setTasks(tasks.filter((t) => t.columnId !== id));
  };

  const updateTaskColumnOrder = (
    projectId: string,
    newColumns: TaskColumn[]
  ) => {
    // Update only the columns for this project, keep others unchanged
    const otherColumns = taskColumns.filter((tc) => tc.projectId !== projectId);
    setTaskColumns([...otherColumns, ...newColumns]);
  };

  // Task actions
  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: `task-${uuidv4()}`,
      columnId,
      title: "New Task",
      description: "",
    };

    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, task: Task) => {
    setTasks(tasks.map((t) => (t.id === id ? task : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTask = (id: string, targetColumnId: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, columnId: targetColumnId } : t))
    );
  };

  return (
    <ContentPlannerContext.Provider
      value={{
        stages,
        layers,
        projects,
        taskColumns,
        tasks,
        setStages,
        addStage,
        updateStage,
        deleteStage,
        addLayer,
        updateLayer,
        deleteLayer,
        updateLayerOrder,
        addProject,
        updateProject,
        deleteProject,
        moveProject,
        addTaskColumn,
        updateTaskColumn,
        deleteTaskColumn,
        updateTaskColumnOrder,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </ContentPlannerContext.Provider>
  );
}

export function useContentPlannerContext() {
  const context = useContext(ContentPlannerContext);

  if (context === undefined) {
    throw new Error(
      "useContentPlannerContext must be used within a ContentPlannerProvider"
    );
  }

  return context;
}
