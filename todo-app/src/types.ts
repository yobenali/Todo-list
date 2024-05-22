export interface Task {
    id: string; 
    title: string;
    completed: boolean;
  }
  
  export interface UpdateTask {
    taskId: string;
    updatedTask: Partial<Task>;
  }