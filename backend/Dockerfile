FROM python:latest
RUN useradd -ms /bin/sh -u 1001 app


WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

USER app

COPY --chown=app:app . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]