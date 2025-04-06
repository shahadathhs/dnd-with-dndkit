import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  format,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";


interface CalendarCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    deadline: string;
  };
  isOverlay: boolean;
}

const CalendarCard: React.FC<CalendarCardProps> = ({ task, isOverlay }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task:${task.id}`,
    animateLayoutChanges: (args) => (args.isDragging ? false : !args.isSorting),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "8px",
    marginBottom: "4px",
  };

  // Calculate countdown until deadline
  const now = new Date();
  const deadline = parseISO(task.deadline);
  const hoursLeft = differenceInHours(deadline, now);
  const minutesLeft = differenceInMinutes(deadline, now) % 60;
  const countdown =
    hoursLeft >= 0 ? `${hoursLeft}h ${minutesLeft}m left` : "Expired";

  const publishTime = format(deadline, "PPP p");

  return (
    <>
      <div
        ref={setNodeRef}
        style={isOverlay ? { ...style, cursor: "grabbing" } : style}
        {...attributes}
        {...listeners}
        onClick={() => setIsDialogOpen(true)}
      >
        <h3 className="font-bold">{task.title}</h3>
        <p className="text-xs text-gray-500">Publish: {publishTime}</p>
        <p className="text-xs text-red-500">{countdown}</p>
      </div>

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{task.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>{task.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                Deadline: {publishTime}
              </p>
              <p className="text-sm text-red-500">{countdown}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CalendarCard;
