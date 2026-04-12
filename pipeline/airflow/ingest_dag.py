# type: ignore
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG(
    "nexus_ingest",
    start_date=datetime(2024, 1, 1),
    schedule_interval="@hourly",
    catchup=False,
    description="NEXUS document ingestion pipeline"
) as dag:

    ingest = BashOperator(
        task_id="ingest_documents",
        bash_command="echo 'Ingestion triggered for /app/docs'",
    )

    # updated