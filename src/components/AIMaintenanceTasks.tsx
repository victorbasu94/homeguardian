import React from 'react';
import { Task } from '../types/Task';
import TaskDetail from './TaskDetail';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

interface AIMaintenanceTasksProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onTaskUpdate: (updatedTask: Task) => void;
  currentHomeId: string | null;
}

const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps> = ({
  tasks,
  isLoading,
  error,
  onTaskUpdate,
  currentHomeId
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="info">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Box mt={2}>
        <Alert severity="info">
          No maintenance tasks found. Please complete home setup to generate your maintenance plan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {tasks.map((task) => (
        <TaskDetail
          key={task.id}
          task={task}
          onTaskUpdate={onTaskUpdate}
          currentHomeId={currentHomeId}
        />
      ))}
    </Box>
  );
};

export default AIMaintenanceTasks; 