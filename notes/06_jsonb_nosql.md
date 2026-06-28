# Chapter 6: JSONB & NoSQL in PostgreSQL

PostgreSQL supports semi-structured data using the `JSON` and `JSONB` data types. While `JSON` stores data as exact text representation, `JSONB` stores data in a decomposed binary format. 

`JSONB` is almost always preferred because:
1. It is faster to process and query.
2. It supports **indexing**, which makes JSON document queries highly performant.
3. It trims whitespace and removes duplicate keys automatically.

---

## 1. Extracting Data from JSONB

PostgreSQL provides several operators to extract values from JSON structures:

- `->` : Returns JSON object or array element.
- `->>` : Returns JSON object field or array element **as text**.
- `#>` : Extracts JSON sub-object at a specified path.
- `#>>` : Extracts JSON sub-object path **as text**.

Let's query our `products` table, which contains a `specs` JSONB column:

### Extracting Top-Level Fields
```sql
SELECT 
    name, 
    specs->>'brand' AS brand, 
    specs->>'storage_gb' AS storage
FROM products
WHERE category_id = 1;
```

### Extracting Nested Objects
```sql
-- Extracting specs -> dimensions -> screen_inches
SELECT 
    name, 
    specs#>>'{dimensions,screen_inches}' AS screen_size,
    specs#>>'{dimensions,weight_kg}' AS weight
FROM products
WHERE specs#>>'{dimensions,screen_inches}' IS NOT NULL;
```

---

## 2. Checking Containment & Existence (`@>`, `?`)

- `@>` : Checks if the left JSONB value contains the right JSONB path/value.
- `?` : Checks if a string exists as a top-level key or array element.

Containment checks are highly optimized and can leverage GIN (Generalized Inverted Index) indexes:

```sql
-- Find all products that have a brand of "GearUp" in their specs
SELECT name, specs
FROM products
WHERE specs @> '{"brand": "GearUp"}';
```

Check if a JSONB document contains a key:
```sql
-- Find products that specify ram_gb in their specs
SELECT name, specs
FROM products
WHERE specs ? 'ram_gb';
```

---

## 3. Querying Arrays Inside JSONB

If your JSONB column contains arrays (like `colors` inside our `specs`), you can query elements inside it:

```sql
-- Find products that are available in "silver"
SELECT name, specs->'colors' AS colors
FROM products
WHERE specs->'colors' @> '["silver"]';
```

---

## 4. Modifying JSONB Data

PostgreSQL provides functions like `jsonb_set` to modify JSON documents on the fly:

```sql
-- Simulate updating specs to add a new property "refurbished": true
SELECT 
    name, 
    jsonb_set(specs, '{refurbished}', 'true'::jsonb) AS updated_specs
FROM products
WHERE category_id = 1
LIMIT 2;
```

---

## 💥 Hands-on Challenge
Write a query to list all products that have specs with `"waterproof": true`. (Hint: Make sure to check that the boolean value is parsed correctly or use containment `@>`).
