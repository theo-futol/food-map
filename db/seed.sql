-- Initial places from README.md. Run once on an empty DB.
-- Positions are the city centre plus a random offset of up to ~500 m, so they are flagged approx_position = 1.
WITH
  c(city, lat, lng) AS (VALUES
    ('Saint-Denis',  -20.8823, 55.4504),
    ('Sainte-Marie', -20.8969, 55.5492),
    ('Saint-Paul',   -21.0096, 55.2707),
    ('Saint-Leu',    -21.1706, 55.2884),
    ('Saint-Gilles', -21.0530, 55.2240),
    ('Sainte-Anne',  -21.0650, 55.7250),
    ('Étang-Salé',   -21.2650, 55.3500),
    ('Saint-Louis',  -21.2860, 55.4110),
    ('Saint-Pierre', -21.3393, 55.4781),
    ('Saint-Joseph', -21.3780, 55.6190)
  ),
  p(name, category, city) AS (VALUES
    ('Terrasse du Bourbon', 'restaurant', 'Saint-Denis'),
    ('Omashup',             'restaurant', 'Saint-Denis'),
    ('Vapiano',             'restaurant', 'Saint-Denis'),
    ('Comédie',             'restaurant', 'Saint-Denis'),
    ('Artemis',             'restaurant', 'Saint-Denis'),
    ('Xcellent',            'restaurant', 'Saint-Denis'),
    ('Be Lounge',           'restaurant', 'Saint-Denis'),
    ('Kalis',               'restaurant', 'Saint-Denis'),
    ('Mamzelle Pizza',      'snack',      'Saint-Denis'),
    ('Cap Méchant',         'restaurant', 'Saint-Denis'),
    ('Brioche Dorée',       'snack',      'Saint-Denis'),
    ('Choose and Eat',      'snack',      'Saint-Denis'),
    ('Pizza Uno',           'snack',      'Saint-Denis'),
    ('Farro Grillade',      'restaurant', 'Saint-Denis'),
    ('Géant',               'snack',      'Saint-Denis'),
    ('OTacos',              'snack',      'Saint-Denis'),
    ('Délices du Nord',     'restaurant', 'Saint-Denis'),
    ('Coco Canelle',        'snack',      'Saint-Denis'),

    ('McDo',                'snack',      'Sainte-Marie'),
    ('LGM (Leroy Merlin)',  'snack',      'Sainte-Marie'),

    ('Grand Baie',          'restaurant', 'Saint-Paul'),
    ('Vapiano',             'restaurant', 'Saint-Paul'),

    ('McDo',                'snack',      'Saint-Leu'),
    ('Tangor',              'restaurant', 'Saint-Leu'),
    ('Pizza Nlove',         'snack',      'Saint-Leu'),
    ('Nounous',             'restaurant', 'Saint-Leu'),
    ('Leu Pasta',           'restaurant', 'Saint-Leu'),
    ('Petit Bar chez Dimitri', 'restaurant', 'Saint-Leu'),
    ('Relais du Portail',   'restaurant', 'Saint-Leu'),
    ('Vidda Pizza',         'snack',      'Saint-Leu'),

    ('Boma Beach',          'restaurant', 'Saint-Gilles'),
    ('Boucan Canot',        'hotel',      'Saint-Gilles'),
    ('Esplanade',           'restaurant', 'Saint-Gilles'),
    ('Sao Praia',           'restaurant', 'Saint-Gilles'),
    ('Hacienda',            'restaurant', 'Saint-Gilles'),
    ('Sergio Burger',       'snack',      'Saint-Gilles'),
    ('Palmerais',           'hotel',      'Saint-Gilles'),
    ('Cap Méchant',         'restaurant', 'Saint-Gilles'),

    ('Diana Dea Lodge',     'hotel',      'Sainte-Anne'),

    ('Green Tee',           'restaurant', 'Étang-Salé'),
    ('Été Indien',          'restaurant', 'Étang-Salé'),
    ('Woody',               'restaurant', 'Étang-Salé'),
    ('Cap Méchant',         'restaurant', 'Étang-Salé'),

    ('LGM (Leroy Merlin)',  'snack',      'Saint-Louis'),

    ('Paradis du Fruit',    'restaurant', 'Saint-Pierre'),
    ('Augustin',            'restaurant', 'Saint-Pierre'),
    ('Belèm',               'restaurant', 'Saint-Pierre'),
    ('OTacos',              'snack',      'Saint-Pierre'),
    ('R''eat Chy',          'restaurant', 'Saint-Pierre'),
    ('Les Frères Métis',    'restaurant', 'Saint-Pierre'),
    ('Maison Gac',          'restaurant', 'Saint-Pierre'),
    ('McDo',                'snack',      'Saint-Pierre'),

    ('Djossy''s',           'restaurant', 'Saint-Joseph')
  )
INSERT INTO places (name, category, city, lat, lng, approx_position)
SELECT p.name, p.category, p.city,
       c.lat + (random() % 500) / 100000.0,
       c.lng + (random() % 500) / 100000.0,
       1
FROM p JOIN c USING (city);
