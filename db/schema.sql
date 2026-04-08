-- ============================================================
-- Automotive Social Media Content Generator — DB Schema
-- ============================================================

-- Products table (car mods / imports inventory)
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100),        -- e.g. "suspension", "exhaust", "wheels", "body kits", "aero", "intake", "brakes"
  brand       VARCHAR(100),
  description TEXT,
  sku         VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Brand guidelines (key-value store, editable via admin UI)
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id         SERIAL PRIMARY KEY,
  key        VARCHAR(100) UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated content history
CREATE TABLE IF NOT EXISTS content_history (
  id                   SERIAL PRIMARY KEY,
  product_id           INTEGER REFERENCES products(id),
  marketing_objective  TEXT NOT NULL,
  trend_context        TEXT,
  tiktok_script        TEXT,
  instagram_caption    TEXT,
  visual_direction     TEXT,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Seed: Brand Guidelines (automotive car mods / JDM / imports)
-- ============================================================
INSERT INTO brand_guidelines (key, value) VALUES
  ('tone',            'Energetic, bold, technical but accessible — hype the build, speak the culture'),
  ('target_audience', 'JDM and Euro car enthusiasts aged 18-35 who live the import scene'),
  ('brand_voice',     'We speak like a fellow car enthusiast, not a salesperson. Raw, authentic, no corporate fluff'),
  ('content_style',   'Fast-paced, street-credible, performance-focused. Show the product in action on real builds'),
  ('hashtags',        '#CarMods #JDM #ImportScene #CarCulture #AutoMods #StanceNation #HellaFlush #BuildNotBought #TunerCar #ModLife')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Seed: Sample Products (car mods / imports catalogue)
-- ============================================================
INSERT INTO products (name, category, brand, description, sku) VALUES
  ('Catback Exhaust System', 'exhaust', 'HKS', 'Stainless steel cat-back exhaust with 4" polished tip. Gains 12-18whp over stock. Deep aggressive tone without drone at highway speeds.', 'HKS-32009-AK006'),
  ('Coilover Suspension Kit', 'suspension', 'BC Racing', 'BR series coilover kit with 30-way damper adjustment. Lowers ride height 1-3 inches. Street/track dual-purpose build.', 'BC-BR-H06'),
  ('Forged Aluminum Wheels 18x9.5', 'wheels', 'Enkei', 'RPF1 forged monoblock 18x9.5 +38 offset. Race-proven, lightweight at 17.4 lbs per wheel. Fits most JDM applications.', 'ENK-RPF1-189538'),
  ('Carbon Fiber Hood', 'body kits', 'Seibon', 'OEM-style carbon fiber hood with vented cowl. UV-resistant clear coat. Direct OEM bolt-on replacement, no drilling required.', 'SBN-HD-CF-OEM'),
  ('Cold Air Intake System', 'intake', 'Injen', 'SP series cold air intake with oiled filter. Dyno-proven +8-12whp. Heat shield included. Polished aluminium piping.', 'INJ-SP1871P'),
  ('Big Brake Kit 6-Piston', 'brakes', 'StopTech', '6-piston front big brake kit with 355mm 2-piece rotors. Street/track spec. Massive fade resistance under repeated hard stops.', 'STP-83.839.6800'),
  ('Widebody Fender Flares', 'aero', 'Rocket Bunny', 'Version 2 wide-body fender flares. +60mm front, +70mm rear. FRP construction, primer finish ready to paint. Bolt-on no-cut installation.', 'RB-V2-FF-014'),
  ('Turbo Intercooler Kit', 'engine', 'Mishimoto', 'Stepped-core front-mount intercooler with aluminum charge piping. Compatible with most 4-cylinder turbo applications. Proven to drop IATs 40-60F.', 'MSM-MMINT-UNI-01')
ON CONFLICT DO NOTHING;
