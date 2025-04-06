import React, { useState } from 'react';
import { DndContext, type DragEndEvent, type DragOverEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanTaskColumn';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '~/components/ui/button';

export interface Task {
  id: string;
  title: string;
  description?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: '1', title: 'Research competitor products', description: 'Look into similar products and identify opportunities' },
        { id: '2', title: 'Create wireframes', description: 'Design low-fidelity wireframes for the new feature' },
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: '3', title: 'Implement auth flow', description: 'Build user authentication and authorization' },
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: '4', title: 'Set up project repository', description: 'Create GitHub repository and initial structure' },
      ]
    }
  ]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    // Check if we're dragging a task
    if (id.includes('task:')) {
      const taskId = id.replace('task:', '');
      const columnId = id.split(':')[2];
      
      const column = columns.find((col) => col.id === columnId);
      const task = column?.tasks.find((t) => t.id === taskId);
      
      if (task) {
        setActiveTask(task);
      }
    } else if (id.includes('column:')) {
      // We're dragging a column
      const columnId = id.replace('column:', '');
      const column = columns.find((col) => col.id === columnId);
      
      if (column) {
        setActiveColumn(column);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If not dragging a task or over nothing/itself, return
    if (!activeId.includes('task:') || activeId === overId) return;
    
    const activeColumnId = activeId.split(':')[2];
    let overColumnId = overId.split(':')[2];
    
    // If over a task, extract the column id from the task id
    if (overId.includes('task:')) {
      overColumnId = overId.split(':')[2];
    } else if (overId.includes('column:')) {
      overColumnId = overId.replace('column:', '');
    }
    
    if (activeColumnId === overColumnId) return;
    
    setColumns(prev => {
      const activeColumn = prev.find(col => col.id === activeColumnId);
      const overColumn = prev.find(col => col.id === overColumnId);
      
      if (!activeColumn || !overColumn) return prev;
      
      const activeTaskIndex = activeColumn.tasks.findIndex(task => `task:${task.id}:${activeColumnId}` === activeId);
      if (activeTaskIndex === -1) return prev;
      
      const task = activeColumn.tasks[activeTaskIndex];
      
      return prev.map(column => {
        // Remove from the active column
        if (column.id === activeColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((_, index) => index !== activeTaskIndex)
          };
        }
        
        // Add to the over column
        if (column.id === overColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, task]
          };
        }
        
        return column;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // For column reordering
    if (activeId.includes('column:') && overId.includes('column:')) {
      const activeColumnId = activeId.replace('column:', '');
      const overColumnId = overId.replace('column:', '');
      
      if (activeColumnId !== overColumnId) {
        setColumns(prev => {
          const activeColumnIndex = prev.findIndex(col => col.id === activeColumnId);
          const overColumnIndex = prev.findIndex(col => col.id === overColumnId);
          
          return arrayMove(prev, activeColumnIndex, overColumnIndex);
        });
      }
    }
    
    // For task reordering within the same column
    if (activeId.includes('task:') && overId.includes('task:')) {
      const activeTaskId = activeId.split(':')[1];
      const overTaskId = overId.split(':')[1];
      const activeColumnId = activeId.split(':')[2];
      const overColumnId = overId.split(':')[2];
      
      if (activeTaskId !== overTaskId && activeColumnId === overColumnId) {
        setColumns(prev => {
          return prev.map(column => {
            if (column.id === activeColumnId) {
              const activeTaskIndex = column.tasks.findIndex(task => task.id === activeTaskId);
              const overTaskIndex = column.tasks.findIndex(task => task.id === overTaskId);
              
              return {
                ...column,
                tasks: arrayMove(column.tasks, activeTaskIndex, overTaskIndex)
              };
            }
            return column;
          });
        });
      }
    }
    
    setActiveTask(null);
    setActiveColumn(null);
  };

  const addNewColumn = () => {
    const newColumn: Column = {
      id: uuidv4(),
      title: 'New Column',
      tasks: []
    };
    
    setColumns([...columns, newColumn]);
  };

  const addNewTask = (columnId: string) => {
    const newTask: Task = {
      id: uuidv4(),
      title: 'New Task',
      description: 'Add description here'
    };
    
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { ...column, title: newTitle }
          : column
      )
    );
  };

  const updateTask = (columnId: string, taskId: string, updatedTask: Partial<Task>) => {
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { 
              ...column, 
              tasks: column.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, ...updatedTask }
                  : task
              )
            }
          : column
      )
    );
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { 
              ...column, 
              tasks: column.tasks.filter(task => task.id !== taskId)
            }
          : column
      )
    );
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(column => column.id !== columnId));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notion-like Kanban Board</h1>
        <Button onClick={addNewColumn} className="flex items-center gap-1">
          <Plus size={16} /> Add Column
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              addNewTask={addNewTask}
              updateColumnTitle={updateColumnTitle}
              updateTask={updateTask}
              deleteTask={deleteTask}
              deleteColumn={deleteColumn}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;