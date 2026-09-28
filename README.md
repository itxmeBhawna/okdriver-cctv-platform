# okDriver CCTV Platform

The okDriver CCTV Platform is a monitoring and surveillance prototype designed for fleet and facility operations. It combines CCTV video stream management, automated video analytics, and real-time watchlist alerting into a unified interface for okDriver. The platform helps operators track camera feeds across locations, monitor operational events, and trigger notifications when watchlist criteria are met.

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ (with npm)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your remote MySQL database credentials and JWT secret.

5. Run the backend development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will be available at `http://localhost:8000`. Health check endpoint: `http://localhost:8000/health`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173`.

---

## Architecture

## API Documentation

## Database Schema

## Known Limitations
