import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTasks, addTask, updateTask, deleteTask } from './api';
import { Task } from './types';
import { v4 as uuidv4 } from 'uuid';
import 'animate.css';


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

  const isTitleValid = (title: string) => {
    return title.trim().length >= 3; // Check if title has at least 3 characters after removing leading whitespace
  };

  const handleAddTask = () => {
    if (isTitleValid(newTaskTitle)) {
      const newTask: Task = { id: uuidv4(), title: newTaskTitle.trim(), completed: false };
      addMutation.mutate(newTask);
      setNewTaskTitle('');
    } else {
      alert('Task title must have at least 3 characters.');
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleUpdateTask = (taskId: string, updatedTitle: string) => {
    if (isTitleValid(updatedTitle)) {
      updateMutation.mutate({ taskId, updatedTask: { title: updatedTitle.trim() } });
      setEditingTaskId(null); // Reset editing state after updating task
    } else {
      alert('Task title must have at least 3 characters.');
    }
  };

  const handleToggleCompleted = (task: Task) => {
    updateMutation.mutate({ taskId: task.id, updatedTask: { ...task, completed: !task.completed } });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='main-app animate__animated animate__fadeInDown'>
      <h1>TODO List</h1>
      <div className="input-container">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <ul className="task-list">
        {tasks?.map((task) => (
          <li key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleCompleted(task)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            {!task.completed && (
              editingTaskId === task.id ? (
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
                <button onClick={() => handleEditTask(task.id)}>Edit</button>
              )
            )}
            <button onClick={() => deleteMutation.mutate(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;