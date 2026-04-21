# Exercise Posture Analyzer

## Overview
AI Fitness Form Analyzer is a computer vision–based application that monitors exercise movements using a webcam and provides real-time feedback. It helps users improve exercise form, reduce injury risk, and train more effectively without requiring professional supervision.

## Features
- Google OAuth-based authentication  
- Real-time pose detection using a webcam  
- Exercise form analysis via joint angle calculations  
- Automatic repetition counting  
- Real-time corrective feedback  
- Voice assistance for guidance and error correction  
- Session-level performance reports  
- Weekly progress tracking and analytics  

## Tech Stack

### Frontend
- React  
- CSS  

### Backend
- FastAPI  

### Computer Vision
- MediaPipe  
- OpenCV  

### Database
- PostgreSQL  

### Authentication
- Google OAuth 2.0  
- JWT (JSON Web Tokens)  

### External Services
- GROQ API  

## System Workflow
1. The webcam captures the user performing an exercise  
2. Pose estimation detects key body joints  
3. Joint angles are computed and analyzed  
4. Movements are compared against predefined exercise standards  
5. The system provides real-time feedback, repetition counting, and voice guidance  
6. Performance data is stored and used for session and weekly reports  

## Goal
To provide an accessible and cost-effective system for improving exercise technique using real-time computer vision.
