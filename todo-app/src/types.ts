export interface Task {
    id: string; 
    title: string;
    completed: boolean;
    userId: string; 
  }
  
  export interface UpdateTask {
    taskId: string;
    updatedTask: Partial<Task>;
  }