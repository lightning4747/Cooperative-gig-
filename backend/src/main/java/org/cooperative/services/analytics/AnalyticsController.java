package org.cooperative.services.analytics;

import static org.cooperative.services.common.Db.p;

import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AnalyticsController {
  private final Db db;

  public AnalyticsController(Db db) {
    this.db = db;
  }

  private void requireAdmin() {
    Actor.current().require("ADMIN");
  }

  @GetMapping("/historical")
  public Map<String, Object> getHistoricalAnalytics(@RequestParam(defaultValue = "30") int days) {
    requireAdmin();
    int intervalDays = Math.max(7, Math.min(days, 90));

    // Daily volume trend over past N days
    var dailyTrends = db.list(
        """
        SELECT 
          d.day::text AS date,
          count(j.id) AS "totalJobs",
          count(j.id) FILTER (WHERE j.status = 'COMPLETED') AS "completedJobs",
          count(j.id) FILTER (WHERE j.status = 'CANCELLED' OR j.status = 'EXPIRED') AS "cancelledJobs",
          count(j.id) FILTER (WHERE j.booking_type = 'EMERGENCY') AS "emergencyJobs",
          COALESCE(sum(p.gross_amount), 0) AS revenue,
          COALESCE(sum(p.welfare_contribution), 0) AS welfare
        FROM generate_series(
          CURRENT_DATE - CAST(:days || ' days' AS interval),
          CURRENT_DATE,
          '1 day'::interval
        ) d(day)
        LEFT JOIN job j ON date_trunc('day', j.created_at) = d.day
        LEFT JOIN payment p ON p.job_id = j.id
        GROUP BY d.day
        ORDER BY d.day ASC
        """,
        p("days", intervalDays));

    // Category breakdown
    var categoryMetrics = db.list(
        """
        SELECT 
          c.id AS "categoryId",
          c.name AS "categoryName",
          count(j.id) AS "totalJobs",
          count(j.id) FILTER (WHERE j.status = 'COMPLETED') AS "completedJobs",
          COALESCE(round(avg(r.stars), 1), 0) AS "avgRating",
          COALESCE(sum(p.gross_amount), 0) AS "totalRevenue",
          (SELECT count(DISTINCT ws.worker_id)
           FROM worker_skill ws 
           JOIN worker w ON w.user_id = ws.worker_id 
           WHERE ws.category_id = c.id AND ws.verified AND w.verification_status = 'ACTIVE'
          ) AS "verifiedWorkers"
        FROM category c
        LEFT JOIN subservice s ON s.category_id = c.id
        LEFT JOIN job j ON j.subservice_id = s.id AND j.created_at >= CURRENT_DATE - CAST(:days || ' days' AS interval)
        LEFT JOIN payment p ON p.job_id = j.id
        LEFT JOIN rating r ON r.job_id = j.id
        GROUP BY c.id, c.name
        ORDER BY "totalJobs" DESC, c.name ASC
        """,
        p("days", intervalDays));

    // Capacity metrics summary
    var capacitySummary = db.one(
        """
        SELECT 
          count(w.user_id) AS "totalRegisteredWorkers",
          count(w.user_id) FILTER (WHERE w.verification_status = 'ACTIVE') AS "verifiedWorkers",
          count(w.user_id) FILTER (WHERE w.verification_status = 'PENDING_VERIFICATION') AS "pendingWorkers",
          count(w.user_id) FILTER (WHERE w.is_available AND w.verification_status = 'ACTIVE') AS "activeOnlineWorkers"
        FROM worker w
        """,
        Map.of());

    // Summary totals over the interval
    var overallSummary = db.one(
        """
        SELECT 
          count(j.id) AS "totalBookings",
          count(j.id) FILTER (WHERE j.status = 'COMPLETED') AS "completedBookings",
          count(j.id) FILTER (WHERE j.booking_type = 'EMERGENCY') AS "emergencyBookings",
          COALESCE(sum(p.gross_amount), 0) AS "grossRevenue",
          COALESCE(sum(p.welfare_contribution), 0) AS "welfareFund",
          COALESCE(round(avg(r.stars), 2), 0) AS "averageRating"
        FROM job j
        LEFT JOIN payment p ON p.job_id = j.id
        LEFT JOIN rating r ON r.job_id = j.id
        WHERE j.created_at >= CURRENT_DATE - CAST(:days || ' days' AS interval)
        """,
        p("days", intervalDays));

    return p(
        "days", intervalDays,
        "summary", overallSummary,
        "capacity", capacitySummary,
        "dailyTrends", dailyTrends,
        "categories", categoryMetrics
    );
  }
}
