package org.cooperative.services.forecast;

import java.time.LocalDate;
import java.util.*;

public class MockForecastEngine {

  public static List<Map<String, Object>> generatePredictions(
      List<Map<String, Object>> dailyDemand,
      List<Map<String, Object>> capacity,
      List<Map<String, Object>> categories,
      int horizonDays) {

    // Aggregate real historical bookings per category over past data
    Map<String, Integer> categoryBookingCounts = new HashMap<>();
    for (var row : dailyDemand) {
      String catId = row.get("categoryId") != null ? row.get("categoryId").toString() : null;
      if (catId != null) {
        int bookings = ((Number) row.getOrDefault("bookings", 0)).intValue();
        categoryBookingCounts.merge(catId, bookings, Integer::sum);
      }
    }

    // Map verified active workers per category
    Map<String, Integer> categoryCapacityCounts = new HashMap<>();
    for (var row : capacity) {
      String catId = row.get("categoryId") != null ? row.get("categoryId").toString() : null;
      if (catId != null) {
        int workers = ((Number) row.getOrDefault("workers", 0)).intValue();
        categoryCapacityCounts.put(catId, workers);
      }
    }

    List<Map<String, Object>> result = new ArrayList<>();

    for (var cat : categories) {
      String catId = cat.get("id").toString();
      String catName = cat.get("name").toString();

      int pastBookings = categoryBookingCounts.getOrDefault(catId, 0);
      int verifiedWorkers = categoryCapacityCounts.getOrDefault(catId, 0);

      // Model projection:
      // Base daily demand = pastBookings / 30.0 (if pastBookings == 0, realistic cooperative baseline ~ 2.0/day)
      double avgDailyDemand = pastBookings > 0 ? (pastBookings / 30.0) : 2.0;
      // Seasonality / trend slight factor (1.1x growth)
      int projectedHorizonBookings = Math.max(1, (int) Math.round(avgDailyDemand * horizonDays * 1.1));

      // Worker capacity estimate over horizon (each active worker handles ~2-3 jobs/day)
      int workerCapacityOverHorizon = verifiedWorkers * horizonDays * 2;

      String demandLevel;
      if (projectedHorizonBookings > 40) {
        demandLevel = "HIGH";
      } else if (projectedHorizonBookings > 15) {
        demandLevel = "MEDIUM";
      } else {
        demandLevel = "LOW";
      }

      String capacityLevel;
      if (verifiedWorkers >= 6) {
        capacityLevel = "HIGH";
      } else if (verifiedWorkers >= 2) {
        capacityLevel = "MEDIUM";
      } else {
        capacityLevel = "LOW";
      }

      String gapStatus;
      String recommendation;
      double ratio = (workerCapacityOverHorizon == 0) ? 999.0 : ((double) projectedHorizonBookings / workerCapacityOverHorizon);

      if (verifiedWorkers == 0 || ratio > 1.25) {
        gapStatus = "GAP";
        recommendation = String.format(
            "Recruit %d more verified technicians for %s to absorb projected %d jobs over next %d days.",
            Math.max(2, (int) Math.ceil((projectedHorizonBookings - workerCapacityOverHorizon) / (double) (horizonDays * 2))),
            catName,
            projectedHorizonBookings,
            horizonDays
        );
      } else if (ratio < 0.6 && verifiedWorkers > 3) {
        gapStatus = "SURPLUS";
        recommendation = String.format(
            "Surplus capacity detected in %s (%d active workers). Consider offering multi-trade training or cross-society deployment.",
            catName,
            verifiedWorkers
        );
      } else {
        gapStatus = "OPTIMAL";
        recommendation = String.format(
            "Capacity is well balanced in %s with %d active workers meeting projected demand.",
            catName,
            verifiedWorkers
        );
      }

      Map<String, Object> item = new HashMap<>();
      item.put("id", UUID.nameUUIDFromBytes((catId + "_forecast").getBytes()).toString());
      item.put("serviceCategoryId", catId);
      item.put("serviceCategoryName", catName);
      item.put("area", "Regional Federation Coverage");
      item.put("period", String.format("Next %d Days (%s to %s)", horizonDays, LocalDate.now(), LocalDate.now().plusDays(horizonDays)));
      item.put("forecastDemand", demandLevel);
      item.put("availableCapacity", capacityLevel);
      item.put("capacityGap", gapStatus);
      item.put("recommendation", recommendation);
      item.put("expectedBookings", projectedHorizonBookings);
      item.put("verifiedWorkers", verifiedWorkers);
      item.put("gapRatio", Math.round(ratio * 100.0) / 100.0);

      result.add(item);
    }

    // Sort so categories with GAP appear first
    result.sort((a, b) -> {
      String gA = (String) a.get("capacityGap");
      String gB = (String) b.get("capacityGap");
      if ("GAP".equals(gA) && !"GAP".equals(gB)) return -1;
      if (!"GAP".equals(gA) && "GAP".equals(gB)) return 1;
      return ((String) a.get("serviceCategoryName")).compareTo((String) b.get("serviceCategoryName"));
    });

    return result;
  }
}
