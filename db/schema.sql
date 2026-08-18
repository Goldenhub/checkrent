CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE rent_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    formatted_address TEXT,
    annual_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    frequency VARCHAR(10) CHECK (frequency IN ('monthly', 'yearly')),
    raw_amount NUMERIC(12, 2) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'studio', 'house', 'shared_room')),
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    h3_index VARCHAR(15),
    geom GEOMETRY(Point, 4326) NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rent_geom ON rent_submissions USING GIST (geom);
CREATE INDEX idx_rent_geog ON rent_submissions USING GIST (geography(geom));
CREATE INDEX idx_rent_h3 ON rent_submissions(h3_index);
CREATE INDEX idx_rent_annual ON rent_submissions(annual_amount);
CREATE INDEX idx_rent_created ON rent_submissions(created_at);
CREATE INDEX idx_rent_bedrooms ON rent_submissions(bedrooms);
CREATE INDEX idx_rent_property ON rent_submissions(property_type);

CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    device_fingerprint VARCHAR(64) NOT NULL,
    h3_index VARCHAR(15) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_rate_lookup ON rate_limits(h3_index, device_fingerprint, submitted_at);
