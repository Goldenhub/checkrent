DO $$
DECLARE
    lat DOUBLE PRECISION;
    lng DOUBLE PRECISION;
    city_name VARCHAR(100);
    neighborhood_name VARCHAR(100);
    neighborhood_data RECORD;
    amount NUMERIC(12,2);
    prop_type VARCHAR(20);
    br INT;
    ba INT;
    freq VARCHAR(10);
BEGIN
    -- NYC: Manhattan and Brooklyn
    FOR i IN 1..33 LOOP
        IF i <= 17 THEN
            city_name := 'New York';
            neighborhood_name := 'Manhattan';
            lng := -73.9857 + (random() * 0.08 - 0.04);
            lat := 40.7484 + (random() * 0.06 - 0.03);
        ELSE
            city_name := 'New York';
            neighborhood_name := 'Brooklyn';
            lng := -73.9654 + (random() * 0.08 - 0.04);
            lat := 40.6782 + (random() * 0.06 - 0.03);
        END IF;
        amount := (1800 + random() * 4200)::NUMERIC(12,2);
        br := (floor(random() * 4))::INT;
        ba := GREATEST(1, (floor(random() * 3) + 1))::INT;
        freq := CASE WHEN random() > 0.15 THEN 'monthly' ELSE 'yearly' END;
        prop_type := CASE (floor(random() * 4))::INT
            WHEN 0 THEN 'apartment'
            WHEN 1 THEN 'studio'
            WHEN 2 THEN 'house'
            WHEN 3 THEN 'shared_room'
        END;
        INSERT INTO rent_submissions (
            city, neighborhood, formatted_address,
            annual_amount, currency, frequency, raw_amount,
            property_type, bedrooms, bathrooms, h3_index, geom
        ) VALUES (
            city_name, neighborhood_name,
            floor(random() * 9999 + 1)::INT || ' Main St, ' || neighborhood_name || ', ' || city_name,
            CASE WHEN freq = 'monthly' THEN amount * 12 ELSE amount END,
            'USD', freq, amount,
            prop_type, br, ba, NULL,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        );
    END LOOP;

    -- San Francisco: Mission District
    FOR i IN 1..16 LOOP
        lng := -122.4194 + (random() * 0.04 - 0.02);
        lat := 37.7599 + (random() * 0.04 - 0.02);
        amount := (2200 + random() * 3800)::NUMERIC(12,2);
        br := (floor(random() * 3))::INT;
        ba := GREATEST(1, (floor(random() * 3) + 1))::INT;
        freq := CASE WHEN random() > 0.15 THEN 'monthly' ELSE 'yearly' END;
        prop_type := CASE (floor(random() * 4))::INT
            WHEN 0 THEN 'apartment'
            WHEN 1 THEN 'studio'
            WHEN 2 THEN 'house'
            WHEN 3 THEN 'shared_room'
        END;
        INSERT INTO rent_submissions (
            city, neighborhood, formatted_address,
            annual_amount, currency, frequency, raw_amount,
            property_type, bedrooms, bathrooms, h3_index, geom
        ) VALUES (
            'San Francisco', 'Mission District',
            floor(random() * 9999 + 1)::INT || ' Main St, Mission District, San Francisco',
            CASE WHEN freq = 'monthly' THEN amount * 12 ELSE amount END,
            'USD', freq, amount,
            prop_type, br, ba, NULL,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        );
    END LOOP;

    -- Chicago: Logan Square
    FOR i IN 1..16 LOOP
        lng := -87.7024 + (random() * 0.04 - 0.02);
        lat := 41.9277 + (random() * 0.04 - 0.02);
        amount := (1200 + random() * 2800)::NUMERIC(12,2);
        br := (floor(random() * 4))::INT;
        ba := GREATEST(1, (floor(random() * 3) + 1))::INT;
        freq := CASE WHEN random() > 0.15 THEN 'monthly' ELSE 'yearly' END;
        prop_type := CASE (floor(random() * 4))::INT
            WHEN 0 THEN 'apartment'
            WHEN 1 THEN 'studio'
            WHEN 2 THEN 'house'
            WHEN 3 THEN 'shared_room'
        END;
        INSERT INTO rent_submissions (
            city, neighborhood, formatted_address,
            annual_amount, currency, frequency, raw_amount,
            property_type, bedrooms, bathrooms, h3_index, geom
        ) VALUES (
            'Chicago', 'Logan Square',
            floor(random() * 9999 + 1)::INT || ' Main St, Logan Square, Chicago',
            CASE WHEN freq = 'monthly' THEN amount * 12 ELSE amount END,
            'USD', freq, amount,
            prop_type, br, ba, NULL,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        );
    END LOOP;

    -- Austin: East Austin
    FOR i IN 1..16 LOOP
        lng := -97.7131 + (random() * 0.04 - 0.02);
        lat := 30.2500 + (random() * 0.04 - 0.02);
        amount := (1000 + random() * 2500)::NUMERIC(12,2);
        br := (floor(random() * 3))::INT;
        ba := GREATEST(1, (floor(random() * 3) + 1))::INT;
        freq := CASE WHEN random() > 0.15 THEN 'monthly' ELSE 'yearly' END;
        prop_type := CASE (floor(random() * 4))::INT
            WHEN 0 THEN 'apartment'
            WHEN 1 THEN 'studio'
            WHEN 2 THEN 'house'
            WHEN 3 THEN 'shared_room'
        END;
        INSERT INTO rent_submissions (
            city, neighborhood, formatted_address,
            annual_amount, currency, frequency, raw_amount,
            property_type, bedrooms, bathrooms, h3_index, geom
        ) VALUES (
            'Austin', 'East Austin',
            floor(random() * 9999 + 1)::INT || ' Main St, East Austin, Austin',
            CASE WHEN freq = 'monthly' THEN amount * 12 ELSE amount END,
            'USD', freq, amount,
            prop_type, br, ba, NULL,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        );
    END LOOP;
END $$;
