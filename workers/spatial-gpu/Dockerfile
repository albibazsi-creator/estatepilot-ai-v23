FROM python:3.12-slim
WORKDIR /worker
COPY worker.py /worker/worker.py
COPY worker-contract.sample.json /worker/worker-contract.sample.json
ENV PYTHONUNBUFFERED=1
CMD ["python", "worker.py", "worker-contract.sample.json"]
