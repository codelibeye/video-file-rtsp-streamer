# Migration Plan: Sequential Video Loop Feature

## วัตถุประสงค์
เพิ่มฟีเจอร์การเล่นวิดีโอแบบ sequence (เล่นตามลำดับ) และเมื่อเล่นครบแล้วจะกลับไปเริ่มที่วิดีโอแรกใหม่

## สิ่งที่ต้องการเปลี่ยนแปลง

### 1. Backend Changes

#### 1.1 แก้ไขคำสั่ง FFmpeg ใน `backend/app.py`
- **ปัญหาปัจจุบัน**: แต่ละวิดีโอ stream แยกกัน ไม่สามารถเล่นต่อเนื่องได้
- **วิธีแก้ไข**: สร้างคำสั่ง FFmpeg ที่สามารถรับหลายวิดีโอและเล่นต่อเนื่องกันได้
- **ตำแหน่งไฟล์**: `backend/app.py` ในฟังก์ชัน `start_rtsp_stream`

#### 1.2 เพิ่ม API Endpoint สำหรับจัดการ Playlist
- **ฟังก์ชันใหม่**: 
  - `POST /api/playlist/create` - สร้าง playlist ใหม่
  - `GET /api/playlist/{id}` - ดูข้อมูล playlist
  - `POST /api/playlist/{id}/add` - เพิ่มวิดีโอใน playlist
  - `DELETE /api/playlist/{id}/remove/{video_id}` - ลบวิดีโอจาก playlist
  - `GET /api/playlist/{id}/start` - เริ่มเล่น playlist
  - `GET /api/playlist/{id}/stop` - หยุดเล่น playlist

#### 1.3 อัปเดต Database Schema
- **ตารางใหม่**: `playlists` และ `playlist_videos`
- **คอลัมน์ที่ต้องการ**:
  - `playlists`: id, name, created_at, updated_at, is_active
  - `playlist_videos`: id, playlist_id, video_id, order

### 2. Frontend Changes

#### 2.1 สร้าง Playlist Management Components
- **ไฟล์ใหม่**:
  - `frontend/src/components/features/playlist/PlaylistManager.tsx`
  - `frontend/src/components/features/playlist/PlaylistForm.tsx`
  - `frontend/src/components/features/playlist/PlaylistVideoList.tsx`

#### 2.2 อัปเดต VideoList Component
- **การเปลี่ยนแปลง**: เพิ่มปุ่ม "Add to Playlist" ในแต่ละวิดีโอ
- **ตำแหน่งไฟล์**: `frontend/src/components/features/video/VideoList.tsx`

#### 2.3 อัปเดต Dashboard
- **การเปลี่ยนแปลง**: เพิ่มส่วนจัดการ Playlist ในหน้า Dashboard
- **ตำแหน่งไฟล์**: `frontend/src/components/pages/Dashboard.tsx`

#### 2.4 สร้าง Playlist Preview
- **ไฟล์ใหม่**: `frontend/src/components/features/playlist/PlaylistPreview.tsx`
- **ฟังก์ชัน**: แสดงรายการวิดีโอใน playlist และสถานะการเล่นปัจจุบัน

### 3. FFmpeg Command Enhancement

#### 3.1 คำสั่ง FFmpeg สำหรับ Sequential Playback
```bash
ffmpeg -re -stream_loop -1 -i video1.mp4 -re -stream_loop -1 -i video2.mp4 -re -stream_loop -1 -i video3.mp4 \
-filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]" \
-map "[outv]" -map "[outa]" -c:v libx264 -preset ultrafast -tune zerolatency -f rtsp rtsp://localhost:8554/playlist
```

#### 3.2 การจัดการ Dynamic Playlist
- ใช้ FFmpeg concat demuxer สำหรับการเชื่อมต่อวิดีโอหลายไฟล์
- สร้าง text file ที่มีรายการวิดีโอที่ต้องการเล่นตามลำดับ
- ใช้คำสั่ง: `ffmpeg -re -f concat -i playlist.txt -c:v libx264 -f rtsp rtsp://localhost:8554/playlist`

## ขั้นตอนการดำเนินการ

### Phase 1: Backend Foundation
1. อัปเดต database schema
2. สร้าง API endpoints สำหรับ playlist
3. แก้ไขคำสั่ง FFmpeg ใน `start_rtsp_stream`

### Phase 2: Frontend Implementation
1. สร้าง Playlist components
2. อัปเดต VideoList component
3. อัปเดต Dashboard

### Phase 3: Integration & Testing
1. เชื่อมต่อ frontend กับ backend API
2. ทดสอบการสร้างและเล่น playlist
3. ทดสอบการเล่นวิดีโอแบบ sequence และ loop

## ไฟล์ที่ต้องสร้าง/แก้ไข

### Backend
- `backend/app.py` (แก้ไข)
- `backend/models/schema.py` (แก้ไข)
- `backend/models/db_crud.py` (แก้ไข)

### Frontend
- `frontend/src/components/features/playlist/PlaylistManager.tsx` (สร้างใหม่)
- `frontend/src/components/features/playlist/PlaylistForm.tsx` (สร้างใหม่)
- `frontend/src/components/features/playlist/PlaylistVideoList.tsx` (สร้างใหม่)
- `frontend/src/components/features/playlist/PlaylistPreview.tsx` (สร้างใหม่)
- `frontend/src/components/features/video/VideoList.tsx` (แก้ไข)
- `frontend/src/components/pages/Dashboard.tsx` (แก้ไข)

## ประโยชน์ที่คาดว่าจะได้รับ
1. ผู้ใช้สามารถสร้าง playlist ของวิดีโอได้
2. วิดีโอจะเล่นตามลำดับที่กำหนด
3. เมื่อเล่นถึงวิดีโอสุดท้ายจะกลับไปเริ่มที่วิดีโอแรกใหม่ (loop)
4. สามารถจัดการ playlist ได้ (เพิ่ม/ลบวิดีโอ)
5. มีหน้าต่างสำหรับ preview และจัดการ playlist