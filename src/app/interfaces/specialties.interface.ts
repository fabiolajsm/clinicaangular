export interface Specialties {
  id: string;
  name: string;
  img: string | undefined;
}

export interface Schedules {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
}

export type ScheduleTime = { startTime: string; endTime: string };
