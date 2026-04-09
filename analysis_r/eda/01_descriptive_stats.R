# R Exploratory Data Analysis 
# This script performs descriptive statistics and visualizations 

# 01_descriptive_stats.R
# Basic EDA on the processed dataset created by data_pipeline.py

library(dplyr)
library(ggplot2)
library(readr)

base_dir <- normalizePath(file.path("..", "..", ".."), winslash = "/")
data_processed <- file.path(base_dir, "data_processed", "combined_processed.csv")

if (!file.exists(data_processed)) {
  stop("Processed data not found. Run data_pipeline.py first.")
}

df <- read_csv(data_processed, show_col_types = FALSE)

df <- df %>%
  mutate(
    crash_rate = crashes / population * 10000,
    transit_density = bus_stops / area_sq_miles,
    bike_lane_density = bike_lane_miles / area_sq_miles
  )


# Quick structure and summary
print("=== Structure ===")
print(str(df))

print("=== Summary ===")
print(summary(df))

# Example: if there is any numeric column, plot its distribution
num_cols <- df %>% select(where(is.numeric)) %>% names()

if (length(num_cols) > 0) {
  first_num <- num_cols[1]
  message(paste("Plotting histogram for:", first_num))

  p <- ggplot(df, aes_string(x = first_num)) +
    geom_histogram(bins = 30, fill = "#0072B2", color = "white") +
    theme_minimal() +
    labs(
      title = paste("Distribution of", first_num),
      x = first_num,
      y = "Count"
    )

  plots_dir <- file.path(base_dir, "data_processed", "plots")
  dir.create(plots_dir, showWarnings = FALSE, recursive = TRUE)
  out_path <- file.path(plots_dir, paste0("hist_", first_num, ".png"))
  ggsave(out_path, p, width = 7, height = 5)
  message(paste("Saved plot to:", out_path))
} else {
  message("No numeric columns found to plot.")
}
