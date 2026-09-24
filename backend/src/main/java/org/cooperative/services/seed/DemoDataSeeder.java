package org.cooperative.services.seed;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataSeeder implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

  private final DemoResetService resetService;
  private final boolean demoMode;

  public DemoDataSeeder(
      DemoResetService resetService,
      @Value("${app.demo-mode:true}") boolean demoMode) {
    this.resetService = resetService;
    this.demoMode = demoMode;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (!demoMode) {
      log.info("DemoDataSeeder: demoMode is disabled, skipping startup seed.");
      return;
    }

    try {
      log.info("DemoDataSeeder: Bootstrapping demo dataset on server boot...");
      var stats = resetService.resetAndSeed();
      log.info("DemoDataSeeder: Auto-seeded demo state successfully on boot: {}", stats);
    } catch (Exception e) {
      log.error("DemoDataSeeder: Error during boot demo seeding", e);
    }
  }
}
