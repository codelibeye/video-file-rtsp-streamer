export interface StreamHealth {
  video_id: number;
  video_title: string;
  status: "healthy" | "invalid_process" | "process_not_found" | "error";
  pid?: number;
  cpu_percent?: number;
  memory_mb?: number;
  process_name?: string;
  error?: string;
}

export interface HealthResponse {
  total_streams: number;
  healthy_streams: number;
  unhealthy_streams_count: number;
  health_status: StreamHealth[];
  unhealthy_streams: StreamHealth[];
  timestamp: string;
}
