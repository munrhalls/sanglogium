# Scope: Homepage Data Schema

## Objective
Implement a simple, robust, and working Sanity schema for the Homepage that allows editors to input featured products, categorized accessories, and structured promotional spotlights (product reference + 3 text fields).

## Core Strategy
Permanently bypass Sanity mutation cache errors by provisioning entirely new field namespace paths for the spotlight and release objects.

## In Scope
- Renaming the 4 complex object fields to guarantee a fresh database path.
- Verifying the schema compiles correctly.
- Testing that dummy data can be added and published via the Sanity Studio UI without mutation errors.

## Out of Scope
- Debugging or salvaging corrupted Sanity document caches or ghost drafts.
- Complex data migrations from old field names.
- Hacky or unprofessional workarounds to force the old field names to work.
- Any time-consuming environment configuration beyond the schema definition.