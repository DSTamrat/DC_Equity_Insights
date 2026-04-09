# Data Dictionary

Definitions of all variables used in the project.

# Data Dictionary (Example)

Because the current pipeline uses generic sample CSVs, the variables below are illustrative.
When you switch to DC datasets, update this file with precise definitions.

## Common fields

- **source**  
  Text label indicating which raw file a row came from (e.g., `sample_a`, `sample_b`).

- **<numeric_column_1>**  
  First numeric column found in the processed dataset. Used as the outcome in the example regression.

- **<numeric_column_2>**  
  Second numeric column found in the processed dataset. Used as the predictor in the example regression.

## To customize

1. Replace the sample URLs in `data_pipeline.py` with real DC open data endpoints.
2. Re-run the pipeline to generate a new `combined_processed.csv`.
3. Inspect the columns and update this dictionary with:
   - Variable name
   - Description
   - Units
   - Source dataset
   - Any transformations applied
