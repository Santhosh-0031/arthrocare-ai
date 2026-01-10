# ArthroCare AI  
### Personalized Prediction & Lifestyle Guidance for Rheumatoid Arthritis

ArthroCare AI is an intelligent, end-to-end clinical decision support system designed to assist in the **early detection, longitudinal monitoring, and personalized management of Rheumatoid Arthritis (RA)**. The system integrates **machine learning–based risk prediction**, **follow-up comparison analytics**, and a **doctor-style recommendation engine** to bridge gaps in traditional RA diagnosis and care.


## Problem Statement

Rheumatoid Arthritis is a chronic autoimmune disorder that often remains **under-diagnosed in its early stages** because:
- Early symptoms mimic normal fatigue or age-related stiffness
- Biomarker values (ESR, CRP, RF, Anti-CCP) vary with **age and gender**
- Doctors rely on **single-visit lab reports**, not longitudinal trends
- Lifestyle guidance is often **generic and non-personalized**

Delayed diagnosis leads to **irreversible joint damage**, reduced quality of life, and increased treatment costs.

## Project Objectives

- Enable **early RA risk prediction** using clinical biomarkers
- Compare **first vs follow-up tests** to assess improvement or worsening
- Provide **personalized, explainable lifestyle recommendations**
- Support clinicians with **data-driven, objective insights**
- Improve patient awareness and proactive disease management


## Key Features

### 1. RA Risk Prediction
- Machine Learning model using **XGBoost**
- Inputs: ESR, CRP, RF, Anti-CCP, Age, Gender
- Outputs: Calibrated RA probability & severity classification
- Uses clinically accepted reference ranges

### 2. Longitudinal Comparison
- Compares previous and current tests
- Detects improvement, stability, or worsening

### 3. Personalized Recommendation Engine
- Diet, exercise, sleep, hydration, and mental wellness guidance
- Severity-aware and behavior-aware recommendations


## System Architecture

1. Data ingestion  
2. Clinical preprocessing  
3. ML prediction layer  
4. Comparison engine  
5. Recommendation engine  
6. Frontend visualization  


## Repository Structure

arthrocare-ai/  
├── notebooks/  
├── models/  
├── backend/  
├── src/  
├── public/  
└── README.md

## Tech Stack
- Frontend: React, Vite, JSX
- Backend: Node.js (Express) and Python (Flask) for model inference
- Auth: Firebase
- Deployment: Docker / Render (config included)

## Limitations

- Depends on lab report accuracy
- Not a replacement for doctors
- Limited dataset size

## Contributors

Santhosh Kumar R  
Amaljosh Maadhav J  
Harish S