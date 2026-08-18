DO $$
DECLARE
    lat DOUBLE PRECISION;
    lng DOUBLE PRECISION;
    city_name VARCHAR(100);
    neighborhood_name VARCHAR(100);
    amount NUMERIC(12,2);
    prop_type VARCHAR(20);
    br INT;
    ba INT;
    freq VARCHAR(10);
    years_old INT;
BEGIN
    FOR i IN 1..80 LOOP
        CASE (i % 5)
            WHEN 0 THEN city_name := 'New York'; neighborhood_name := 'Manhattan';
            WHEN 1 THEN city_name := 'New York'; neighborhood_name := 'Brooklyn';
            WHEN 2 THEN city_name := 'San Francisco'; neighborhood_name := 'Mission District';
            WHEN 3 THEN city_name := 'Chicago'; neighborhood_name := 'Logan Square';
            WHEN 4 THEN city_name := 'Austin'; neighborhood_name := 'East Austin';
        END CASE;

        lng := -74.006 + (random() * 42 - 20);
        lat := 40.7128 + (random() * 14 - 7);
        amount := (1200 + random() * 3800)::NUMERIC(12,2);
        br := (floor(random() * 4))::INT;
        ba := GREATEST(1, (floor(random() * 3) + 1))::INT;
        freq := CASE WHEN random() > 0.15 THEN 'monthly' ELSE 'yearly' END;
        prop_type := CASE (floor(random() * 4))::INT
            WHEN 0 THEN 'apartment'
            WHEN 1 THEN 'studio'
            WHEN 2 THEN 'house'
            WHEN 3 THEN 'shared_room'
        END;
        years_old := (random() * 5)::INT;

        INSERT INTO rent_submissions (
            city, neighborhood, formatted_address,
            annual_amount, currency, frequency, raw_amount,
            property_type, bedrooms, bathrooms, h3_index, geom
        ) VALUES (
            city_name, neighborhood_name,
            floor(random() * 9999 + 1)::INT || ' Main St, ' || neighborhood_name || ', ' || city_name,
            CASE WHEN freq = 'monthly' THEN amount * 12 ELSE amount END,
            'USD', freq, amount,
            prop_type, br, ba,
            NULL,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)
        );
    END LOOP;
END $$;
