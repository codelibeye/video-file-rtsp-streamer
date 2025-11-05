from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
import signal
from datetime import datetime
import psutil

from models import VideoCRUD

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rtsp_host = os.getenv('RTSP_SERVER_HOST', 'localhost')

VideoCRUD.create_tables()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/api/videos/upload")
async def upload_video(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    status = "uploading"
    error_msg = ""
    try:
        with open(file_location, "wb") as f:
            # f.write(await file.read())
            content = await file.read()
            f.write(content)
        status = "completed"
    except Exception as e:
        status = "failed"
        error_msg = str(e)
    video_crud = VideoCRUD()
    video = video_crud.create(title=file.filename, file_path=file_location, status=status)
    video_crud.close()
    return {
        "id": video.id,
        "title": video.title,
        "status": video.status,
        "upload_time": video.upload_time.isoformat(),
        "file_path": video.file_path,
        "error_msg": error_msg
    }

@app.get("/api/videos/list")
def list_videos():
    video_crud = VideoCRUD()
    videos = video_crud.list()
    video_crud.close()
    videos = [{
        "id": video.id,
        "title": video.title,
        "status": video.status,
        "time": video.upload_time.isoformat(),
        "file_path": video.file_path,
        "proc": video.proc,
    } for video in videos]
    return videos

@app.get("/api/videos/{video_id}")
def get_video(video_id: int):
    video_crud = VideoCRUD()
    video = video_crud.get(video_id)
    video_crud.close()
    if video:
        return {
            "id": video.id,
            "title": video.title,
            "status": video.status,
            "upload_time": video.upload_time.isoformat(),
            "file_path": video.file_path
        }
    return {"error": "Video not found"}

@app.delete("/api/videos/{video_id}")
def delete_video(video_id: int):
    video_crud = VideoCRUD()
    success = video_crud.delete(video_id)
    video_crud.close()
    if success:
        return {"message": "Video deleted successfully"}
    return {"error": "Video not found or could not be deleted"}

@app.get("/api/stream/{video_id}/start")
def start_rtsp_stream(video_id: int):
    print(f"Starting RTSP stream for video ID {video_id}")
    video_crud = VideoCRUD()
    video = video_crud.get(video_id)
    video_crud.close()
    if not video:
        print("Video not found")
        return {"status": "error", "message": "Video not found"}
    if not video.proc is None:
        print("Stream already running for this video")
        return {"status": "error", "message": "Stream already running for this video"}
    try:
        video_path = video.file_path
        cmd = [
            "ffmpeg",
            "-re",
            "-stream_loop", "-1",
            "-i", video_path,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-tune", "zerolatency",
            "-f", "rtsp",
            f"rtsp://{rtsp_host}:8554/stream/{video_id}"
        ]
        if os.name == 'nt':
            proc = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
        else:
            proc = subprocess.Popen(cmd)
        video.proc = proc.pid
        video_crud = VideoCRUD()
        video_crud.update(video_id, proc=proc.pid)
        video_crud.close()
        print(f"Started RTSP stream for video ID {video_id} with PID {proc.pid}")
        return {"status": "success", "id": video_id, "message": f"RTSP stream started for video ID {video_id}"}
    except Exception as e:
        video_crud = VideoCRUD()
        video_crud.update(video_id, proc=None)
        video_crud.close()
        print(f"Error starting RTSP stream: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/stream/{video_id}/stop")
def stop_rtsp_stream(video_id: int):
    video_crud = VideoCRUD()
    video = video_crud.get(video_id)
    video_crud.close()
    if not video:
        print("Video not found")
        return {"status": "error", "message": "Video not found"}
    if video.proc is None:
        print("Stream already stopped for this video")
        return {"status": "error", "message": "Stream already stopped for this video"}
    try:
        # Terminate the process
        if os.name == 'nt':  # Windows
            os.kill(video.proc, signal.CTRL_BREAK_EVENT)
        else:  # Unix系
            os.kill(video.proc, signal.SIGTERM)
        video_crud = VideoCRUD()
        video_crud.update(video_id, proc=None)
        video_crud.close()
        return {"status": "success", "id": video_id, "message": f"RTSP stream stopped for video ID {video_id}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stream/health")
def stream_health_check():
    """Check health of all active RTSP streams"""
    video_crud = VideoCRUD()
    videos = video_crud.list()
    video_crud.close()
    
    health_status = []
    unhealthy_streams = []
    
    for video in videos:
        if video.proc is not None:
            try:
                # Check if process is still running
                if psutil.pid_exists(video.proc):
                    process = psutil.Process(video.proc)
                    process_name = process.name().lower()
                    
                    if "ffmpeg" in process_name:
                        # Check if process is responsive by checking CPU usage
                        cpu_percent = process.cpu_percent(interval=0.1)
                        memory_info = process.memory_info()
                        
                        health_status.append({
                            "video_id": video.id,
                            "video_title": video.title,
                            "status": "healthy",
                            "pid": video.proc,
                            "cpu_percent": cpu_percent,
                            "memory_mb": memory_info.rss / 1024 / 1024,
                            "uptime": "unknown"  # Could be enhanced with start time tracking
                        })
                    else:
                        unhealthy_streams.append({
                            "video_id": video.id,
                            "video_title": video.title,
                            "status": "invalid_process",
                            "pid": video.proc,
                            "process_name": process_name
                        })
                        # Update database to clear invalid process
                        video_crud = VideoCRUD()
                        video_crud.update(video.id, proc=None)
                        video_crud.close()
                else:
                    unhealthy_streams.append({
                        "video_id": video.id,
                        "video_title": video.title,
                        "status": "process_not_found",
                        "pid": video.proc
                    })
                    # Update database to clear dead process
                    video_crud = VideoCRUD()
                    video_crud.update(video.id, proc=None)
                    video_crud.close()
            except Exception as e:
                unhealthy_streams.append({
                    "video_id": video.id,
                    "video_title": video.title,
                    "status": "error",
                    "pid": video.proc,
                    "error": str(e)
                })
    
    return {
        "total_streams": len(health_status) + len(unhealthy_streams),
        "healthy_streams": len(health_status),
        "unhealthy_streams_count": len(unhealthy_streams),
        "health_status": health_status,
        "unhealthy_streams": unhealthy_streams,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)