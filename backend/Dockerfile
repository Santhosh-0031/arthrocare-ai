# =============================
# 1. Use Python 3.12 (matches Colab)
# =============================
FROM python:3.12-slim

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# =============================
# 2. Install system dependencies
# =============================
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# =============================
# 3. Set working directory
# =============================
WORKDIR /app

# Copy all backend files
COPY . /app

# =============================
# 4. Install EXACT package versions 
#    (matching your Google Colab environment)
# =============================
RUN pip install --upgrade pip

# Core dependencies
RUN pip install numpy==2.0.2
RUN pip install pandas==2.2.2
RUN pip install scikit-learn==1.6.1
RUN pip install xgboost==3.1.1
RUN pip install joblib==1.5.2
RUN pip install scipy==1.16.3

# Flask API dependencies
RUN pip install flask flask-cors openpyxl

# =============================
# 5. Expose backend port
# =============================
EXPOSE 5000

# =============================
# 6. Start the backend
# =============================
CMD ["python", "app.py"]
