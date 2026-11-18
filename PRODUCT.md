# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
One person (the owner), keeping a private log of restaurants, snacks and hotels tried on La Réunion. Often used on a phone, out and about, to log a visit or look up past ones.

## Product Purpose
A personal food-and-stay map: pin a place, record visits with date, stars, comment and souvenir photos, and filter by city or category to remember where to go back.

## Capabilities and Constraints
- Categories: restaurant, snack, hotel (stored in English, displayed in French).
- Places can have an approximate position, corrected by dragging the marker.
- Address search via Nominatim, restricted to La Réunion.
- SQLite storage, photos on disk, self-hosted with Docker.
- Interface language: French.

## Brand Commitments
- Name shown in the UI: "MoumouneFood".
- Tone: personal travel journal, not a public guide.

## Evidence on Hand
Seed data in `db/seed.sql`. No public reviews, ratings or third-party content to display.
