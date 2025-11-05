# Video File RTSP Streamer - Project Structure

## โครงสร้างโดยรวม

```
video-file-rtsp-streamer/
├── backend/                    # FastAPI backend
│   ├── app.py              # Main application file
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile           # Docker configuration for backend
│   ├── .dockerignore        # Files to ignore in Docker
│   └── models/             # Database models and CRUD operations
│       ├── __init__.py
│       ├── db_crud.py
│       └── schema.py
├── frontend/                  # React frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── features/  # Feature-specific components
│   │   │   │   ├── stream/    # Stream health monitoring
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── HealthyStreamsList.tsx
│   │   │   │   │   ├── UnhealthyStreamsList.tsx
│   │   │   │   │   └── StreamSummaryCards.tsx
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── utils.tsx
│   │   │   │   └── StreamHealth.tsx
│   │   │   ├── video/      # Video management
│   │   │   │   ├── VideoList.tsx
│   │   │   │   └── VideoPreview.tsx
│   │   │   └── upload/     # File upload component
│   │   │       └── FileUpload.tsx
│   │   ├── layout/        # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   └── Header.tsx
│   │   ├── pages/          # Page components
│   │   │   └── Dashboard.tsx
│   │   ├── contexts/       # React contexts
│   │   │   └── ThemeContext.tsx
│   │   └── themes/         # Theme configurations
│   │       ├── darkTheme.ts
│   │       ├── index.ts
│   │       └── lightTheme.ts
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── Dockerfile         # Docker configuration for frontend
├── docker-compose.yml         # Docker Compose configuration
├── start.sh                 # Railway deployment script
└── README.md               # Project documentation
```

## คำอธิบายส่วนที่สำคัญ

### Backend (FastAPI)
- **app.py**: Main application file มี API endpoints สำหรับ:
  - `/api/videos/upload` - อัปโหลดวิดีโอ
  - `/api/videos/list` - ดึงรายการวิดีโอ
  - `/api/videos/{id}` - ดึงข้อมูลวิดีโอตาม ID
  - `/api/videos/{id}/start` - เริ่ม RTSP stream
  - `/api/videos/{id}/stop` - หยุด RTSP stream
  - `/api/stream/health` - ตรวจสอบสถานะของ streams
- **models/**: Database models และ CRUD operations
- **requirements.txt**: Python dependencies (FastAPI, SQLAlchemy, psutil, etc.)

### Frontend (React + TypeScript)
- **Dashboard**: หน้าหลัก แสดง VideoList และ StreamHealth
- **VideoList**: แสดงรายการวิดีโอพร้อมปุ่ม Play/Stop RTSP และ Preview
- **VideoPreview**: Modal สำหรับแสดงข้อมูล RTSP stream
- **StreamHealth**: จอสำหรับ monitoring สถานะของ streams:
  - StreamSummaryCards: แสดงจำนวน streams (total, healthy, unhealthy)
  - HealthyStreamsList: รายการ streams ที่ทำงานปกติ
  - UnhealthyStreamsList: รายการ streams ที่มีปัญหา

### Deployment
- **Docker Compose**: สำหรับรัน backend และ frontend ใน containers
- **start.sh**: Script สำหรับ deploy ไปยัง Railway.com

## การทำงานของระบบ

1. **Video Upload**: ผู้ใช้อัปโหลดวิดีโอผ่าน FileUpload component
2. **RTSP Streaming**: FFmpeg แปลงวิดีโอเป็น RTSP stream
3. **Stream Monitoring**: ตรวจสอบสถานะของ streams ทุก 30 วินาที
4. **Health Status**: แยกระหว่า streams เป็น healthy/unhealthy ตาม process status

## การเชื่อมต่อระหว่าง Components

- **VideoList** ↔ **VideoPreview**: คลิก Preview เพื่อดูข้อมูล RTSP stream
- **VideoList** ↔ **StreamHealth**: Start/Stop streams และ monitor สถานะ
- **StreamHealth** ↔ **Backend**: ดึงข้อมูลสถานะ streams ผ่าน API

## การ Deploy ด้วย Railway

1. ติดตั้ง Railway CLI: `npm install -g @railway/cli`
2. ล็อกอิน Railway: `railway login`
3. รัน deployment script: `./start.sh`
4. Script จะตรวจสอบ Railway CLI และ deploy ไปยัง Railway.com