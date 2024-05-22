import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTasks, addTask, updateTask, deleteTask } from './api';
import { Task } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery('tasks', fetchTasks);
  const addMutation = useMutation(addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });
  const updateMutation = useMutation(updateTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });
  const deleteMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); // Track the ID of the task being edited

  const handleAddTask = () => {
    const newTask: Task = { id: uuidv4(), title: newTaskTitle, completed: false };
    addMutation.mutate(newTask);
    setNewTaskTitle('');
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleUpdateTask = (taskId: string, updatedTitle: string) => {
    updateMutation.mutate({ taskId, updatedTask: { title: updatedTitle } });
    setEditingTaskId(null); // Reset editing state after updating task
  };
  

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>TODO List</h1>
      <input
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks?.map((task) => (
          <li key={task.id}>
            {editingTaskId === task.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateTask(task.id, editTaskTitle);
                }}
              >
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  placeholder="Enter new title"
                />
                <button type="submit">Update</button>
              </form>
            ) : (
              <>
                <span>{task.title}</span>
                <button onClick={() => handleEditTask(task.id)}>Edit</button>
              </>
            )}
            <button onClick={() => deleteMutation.mutate(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
