# R Modeling Script 
# Regression and ML models for equity analysis 
# 01_regression_equity.R
# Simple modeling example on the processed dataset

# 01_regression_equity.R

library(dplyr)
library(readr)
library(broom)

base_dir <- normalizePath(file.path("..", "..", ".."), winslash = "/")
data_processed <- file.path(base_dir, "data_processed", "dc_combined.csv")

if (!file.exists(data_processed)) {
  stop("Processed data not found. Run data_pipeline.py first.")
}

df <- read_csv(data_processed, show_col_types = FALSE)

# ---------------------------------------------------------
# 1. Ensure required columns exist
# ---------------------------------------------------------
required <- c("crash_rate", "transit_density", "bike_lane_density", 
              "poverty_rate", "median_income")

missing <- setdiff(required, names(df))
if (length(missing) > 0) {
  stop(paste("Missing required columns:", paste(missing, collapse = ", ")))
}

# ---------------------------------------------------------
# 2. Fit an equity‑relevant model
# ---------------------------------------------------------
model <- lm(
  crash_rate ~ transit_density + bike_lane_density + poverty_rate + median_income,
  data = df
)

print(summary(model))

# ---------------------------------------------------------
# 3. Save coefficients
# ---------------------------------------------------------
coef_df <- tidy(model)
out_path <- file.path(base_dir, "data_processed", "model_coefficients.csv")
write.csv(coef_df, out_path, row.names = FALSE)

message("Model coefficients saved to: ", out_path)
