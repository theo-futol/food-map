-- Initial places from README.md. Run once on an empty DB.

-- Addresses found on the web (Nov 2026), geocoded with the Base Adresse Nationale (api-adresse.data.gouv.fr).
-- approx_position = 1 where only the street or area is known.
INSERT INTO places (name, category, city, address, lat, lng, approx_position) VALUES
  ('Terrasse du Bourbon', 'restaurant', 'Saint-Denis', '7 Rue de l''Amiral Lacaze, 97400 Saint-Denis', -20.874569, 55.447943, 0),
  ('Vapiano', 'restaurant', 'Saint-Denis', 'Place Sarda Garriga, 97400 Saint-Denis', -20.873278, 55.447885, 1),
  ('Be Lounge', 'restaurant', 'Saint-Denis', '84 Rue Sainte-Anne, 97400 Saint-Denis', -20.880554, 55.455994, 0),
  ('Brioche Dorée', 'snack', 'Saint-Denis', 'Rue du Karting, 97490 Saint-Denis', -20.894071, 55.500173, 1),
  ('Pizza Uno', 'snack', 'Saint-Denis', '220 Boulevard Jean Jaurès, 97490 Saint-Denis', -20.900105, 55.480347, 0),
  ('OTacos', 'snack', 'Saint-Denis', '35 Rue de la Compagnie, 97400 Saint-Denis', -20.877822, 55.450217, 0),
  ('Délices du Nord', 'restaurant', 'Saint-Denis', '33 Route de la Rivière des Pluies, 97490 Saint-Denis', -20.903493, 55.503583, 0),
  ('McDo', 'snack', 'Sainte-Marie', '20 Rue Michel Ange, 97438 Sainte-Marie', -20.898890, 55.518773, 0),
  ('LGM (Leroy Merlin)', 'snack', 'Sainte-Marie', '43 Rue Michel Ange, 97438 Sainte-Marie', -20.902104, 55.518337, 0),
  ('Grand Baie', 'restaurant', 'Saint-Paul', '14 Rue des Filaos, 97434 Saint-Paul', -21.013939, 55.261154, 0),
  ('Vapiano', 'restaurant', 'Saint-Paul', '6 Quai Gilbert, 97460 Saint-Paul', -21.008656, 55.269447, 0),
  ('Tangor', 'restaurant', 'Saint-Leu', '160 Rue du Général Lambert, 97436 Saint-Leu', -21.172014, 55.287923, 0),
  ('Vidda Pizza', 'snack', 'Saint-Leu', 'Rue Adrien Lagourgue, 97424 Saint-Leu', -21.220465, 55.313227, 1),
  ('Boucan Canot', 'hotel', 'Saint-Gilles', '32 Rue de Boucan Canot, 97434 Saint-Paul', -21.027147, 55.226720, 0),
  ('Esplanade', 'restaurant', 'Saint-Gilles', '15 Rue de la Plage, 97434 Saint-Paul', -21.051989, 55.223370, 0),
  ('Sao Praia', 'restaurant', 'Saint-Gilles', '25 Rue de la Plage, 97434 Saint-Paul', -21.052603, 55.223885, 0),
  ('Hacienda', 'restaurant', 'Saint-Gilles', 'Plage de l''Hermitage, 97434 Saint-Paul', -21.081243, 55.227171, 1),
  ('Diana Dea Lodge', 'hotel', 'Sainte-Anne', '94 Chemin Helvetia, 97437 Sainte-Anne', -21.123112, 55.704709, 0),
  ('Green Tee', 'restaurant', 'Étang-Salé', 'Golf de Bourbon, 140 Les Sables, 97427 L''Étang-Salé', -21.277460, 55.361350, 0),
  ('Été Indien', 'restaurant', 'Étang-Salé', '1 Rue des Salines, 97427 L''Étang-Salé', -21.266637, 55.334666, 0),
  ('Cap Méchant', 'restaurant', 'Étang-Salé', '2 bis Impasse Henri Madoré, 97427 L''Étang-Salé', -21.273701, 55.370629, 0),
  ('LGM (Leroy Merlin)', 'snack', 'Saint-Louis', '39 Avenue de Toulouse, 97450 Saint-Louis', -21.294003, 55.405293, 0),
  ('Les Frères Métis', 'restaurant', 'Saint-Pierre', '96 Rue Luc Lorion, 97410 Saint-Pierre', -21.334915, 55.470948, 0),
  ('Maison Gac', 'restaurant', 'Saint-Pierre', '51 Rue François de Mahy, 97410 Saint-Pierre', -21.338958, 55.475783, 0),
  ('McDo', 'snack', 'Saint-Pierre', 'Boulevard Banks, 97410 Saint-Pierre', -21.331680, 55.474423, 1);

-- No address found online: city centre plus a random offset of up to ~500 m, flagged approx_position = 1.
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
    ('Omashup', 'restaurant', 'Saint-Denis'),
    ('Comédie', 'restaurant', 'Saint-Denis'),
    ('Artemis', 'restaurant', 'Saint-Denis'),
    ('Xcellent', 'restaurant', 'Saint-Denis'),
    ('Kalis', 'restaurant', 'Saint-Denis'),
    ('Mamzelle Pizza', 'snack', 'Saint-Denis'),
    ('Cap Méchant', 'restaurant', 'Saint-Denis'),
    ('Choose and Eat', 'snack', 'Saint-Denis'),
    ('Farro Grillade', 'restaurant', 'Saint-Denis'),
    ('Géant', 'snack', 'Saint-Denis'),
    ('Coco Canelle', 'snack', 'Saint-Denis'),
    ('McDo', 'snack', 'Saint-Leu'),
    ('Pizza Nlove', 'snack', 'Saint-Leu'),
    ('Nounous', 'restaurant', 'Saint-Leu'),
    ('Leu Pasta', 'restaurant', 'Saint-Leu'),
    ('Petit Bar chez Dimitri', 'restaurant', 'Saint-Leu'),
    ('Relais du Portail', 'restaurant', 'Saint-Leu'),
    ('Boma Beach', 'restaurant', 'Saint-Gilles'),
    ('Sergio Burger', 'snack', 'Saint-Gilles'),
    ('Palmerais', 'hotel', 'Saint-Gilles'),
    ('Cap Méchant', 'restaurant', 'Saint-Gilles'),
    ('Woody', 'restaurant', 'Étang-Salé'),
    ('Paradis du Fruit', 'restaurant', 'Saint-Pierre'),
    ('Augustin', 'restaurant', 'Saint-Pierre'),
    ('Belèm', 'restaurant', 'Saint-Pierre'),
    ('OTacos', 'snack', 'Saint-Pierre'),
    ('R''eat Chy', 'restaurant', 'Saint-Pierre'),
    ('Djossy''s', 'restaurant', 'Saint-Joseph')
  )
INSERT INTO places (name, category, city, lat, lng, approx_position)
SELECT p.name, p.category, p.city,
       c.lat + (random() - 0.5) / 100,
       c.lng + (random() - 0.5) / 100,
       1
FROM p JOIN c USING (city);
