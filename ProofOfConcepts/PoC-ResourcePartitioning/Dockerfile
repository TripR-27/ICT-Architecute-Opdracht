FROM python:3.9-slim
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY app.py .
CMD ["python", "app.py"]