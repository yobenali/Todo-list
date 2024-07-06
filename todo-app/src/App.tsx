import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, addTask, updateTask, deleteTask } from './api';
import { Task, UpdateTask } from './types';
import { v4 as uuidv4 } from 'uuid';
import 'animate.css';
import { FaPlus, FaEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline, MdDoneOutline } from "react-icons/md";
import { signInWithGoogle, signOutUser, auth } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import GoogleLogo from './assets/google.png';

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', user?.uid],
    queryFn: () => fetchTasks(user!.uid), // Fetch tasks only if the user is authenticated
    enabled: !!user, // Fetch tasks only if the user is authenticated
  });

  const addMutation = useMutation<Task, Error, Task>({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
    },
  });

  const updateMutation = useMutation<Task, Error, UpdateTask>({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.uid] });
    },
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const isTitleValid = (title: string) => {
    return title.trim().length >= 3;
  };

  const handleAddTask = () => {
    if (isTitleValid(newTaskTitle) && user) {
      const newTask: Task = { id: uuidv4(), title: newTaskTitle.trim(), completed: false, userId: user.uid };
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

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in: ', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (!user) {
    return (
      <div className='main-app animate__animated animate__fadeInDown'>
        <h1>TODO List</h1>
        <button className="Gsign" onClick={handleSignIn}>
          Sign In with Google
          <img src={GoogleLogo} alt="Google logo" className="google-logo" />
        </button>
      </div>
    );
  }

  if (isLoading) return <div>Loading... 🌀</div>;

  if (!tasks) return <div>Error fetching tasks. Please check your Database is running perfectly</div>;

  return (
    <div className='main-app animate__animated animate__fadeInDown'>
      <h1>TODO List</h1>
      <p>Welcome, {user.displayName}</p>
      <button onClick={handleSignOut}>Sign Out</button>
      <div className="input-container">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
        />
        <button className="button-with-icon" onClick={handleAddTask}><FaPlus /></button>
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
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
                <button onClick={() => handleEditTask(task.id)}><FaEdit /></button>
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
