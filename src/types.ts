export type Report = {
  projects: { project_no: number };
  id: number;
  report_date: string;
  task_description: string;
  work_hours: number;
  overtime_hours: number;
  manpower: number;
  project_id: number;
  user_id: string;
  profiles?: {
    name: string;
  };
};
