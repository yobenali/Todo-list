import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, addTask, updateTask, deleteTask } from './api';
import { Task, UpdateTask } from './types';
import { v4 as uuidv4 } from 'uuid';
import 'animate.css';
import { FaPlus, FaEdit} from "react-icons/fa";
import { MdOutlineDeleteOutline, MdDoneOutline } from "react-icons/md";



const App: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const addMutation = useMutation<Task, Error, Task>({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation<Task, Error, UpdateTask>({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const isTitleValid = (title: string) => {
    return title.trim().length >= 3;
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
      setEditingTaskId(null);
    } else {
      alert('Task title must have at least 3 characters.');
    }
  };

  const handleToggleCompleted = (task: Task) => {
    updateMutation.mutate({ taskId: task.id, updatedTask: { ...task, completed: !task.completed } });
  };

  if (isLoading) return <div>Loading... 🌀</div>;

  if (tasks === undefined) return <div>Error fetching tasks. Please check your Database is running perfectly</div>;

  return (
    <div className='main-app animate__animated animate__fadeInDown'>
      <h1>TODO List</h1>
      <div className="input-container" >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
        />
         <button className="button-with-icon" onClick={handleAddTask}><FaPlus />
  </button>
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
                  <button type="submit"><MdDoneOutline /></button>
                </form>
              ) : (
                <button onClick={() => handleEditTask(task.id)}><FaEdit />
                </button>
              )
            )}
            <button onClick={() => deleteMutation.mutate(task.id)}><MdOutlineDeleteOutline /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
