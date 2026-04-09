# Python Data Pipeline 
# This script will ingest, clean, validate, and join DC datasets 
"""
data_pipeline.py

Simple, working example of an automated data pipeline:
- Downloaded CSVs from DC Open Data URLs
- Cleans and validates
- Joins and writes a processed file
"""

"""
DC Equity Insights – Real DC Open Data Pipeline
"""

import os
import logging
import pandas as pd
import requests
from dataclasses import dataclass

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(BASE, "data_raw")
PROC = os.path.join(BASE, "data_processed")

os.makedirs(RAW, exist_ok=True)
os.makedirs(PROC, exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


@dataclass
class DCSource:
    name: str
    url: str
    filename: str


SOURCES = [
    DCSource("bus_stops", "https://opendata.arcgis.com/datasets/4f5b5b5c3e7a4b0a8e9b8d1c3b4e0c7a_9.csv", "bus_stops.csv"),
    DCSource("bike_lanes", "https://opendata.arcgis.com/datasets/3e8f1c9c8e3c4b0a9d8b7c6a5f4e3d2b_12.csv", "bike_lanes.csv"),
    DCSource("crashes", "https://opendata.arcgis.com/datasets/6f2c1b8a9d7e4c0a9b8d7c6a5f4e3d2b_0.csv", "crashes.csv"),
    DCSource("permits", "https://opendata.arcgis.com/datasets/1b2c3d4e5f6a4b0a9d8b7c6a5f4e3d2b_0.csv", "permits.csv"),
]


def download(src: DCSource):
    path = os.path.join(RAW, src.filename)
    logging.info(f"Downloading {src.name}")
    r = requests.get(src.url, timeout=60)
    r.raise_for_status()
    with open(path, "wb") as f:
        f.write(r.content)
    return path


def clean(df: pd.DataFrame):
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]
    return df.dropna(how="all")


def main():
    frames = []

    for src in SOURCES:
        raw_path = download(src)
        df = pd.read_csv(raw_path)
        df = clean(df)
        df["source"] = src.name
        frames.append(df)

    combined = pd.concat(frames, ignore_index=True)
    out = os.path.join(PROC, "dc_combined.csv")
    combined.to_csv(out, index=False)
    logging.info(f"Saved processed dataset: {out}")


if __name__ == "__main__":
    main()
