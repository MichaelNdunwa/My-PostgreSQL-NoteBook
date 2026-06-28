# Chapter 1: PostgreSQL Basics

Welcome to your PostgreSQL Notebook! This guide covers basic query constructs. All code blocks below are interactive—click the **Run Query** button next to any code block to execute it directly against your WASM-powered PostgreSQL database.

---

## 1. Retrieving Data with `SELECT`

The `SELECT` statement is the foundation of querying in SQL. It allows you to specify which columns you want to retrieve from a table.

### Querying All Columns
Use `*` to fetch all columns from a table:
```sql
SELECT * FROM users;
```

### Selecting Specific Columns
It is a best practice to only fetch the columns you actually need. This reduces database workload and network transfer size:
```sql
SELECT name, email, role FROM users;
```

---

## 2. Filtering Rows with `WHERE`

The `WHERE` clause filters records so you only retrieve rows that satisfy a specified condition.

### Basic Comparison Operators
You can filter using standard comparisons (`=`, `>`, `<`, `>=`, `<=`, `!=` or `<>`):
```sql
SELECT name, price, stock 
FROM products 
WHERE price > 100.00;
```

### Combining Conditions with `AND` & `OR`
Use `AND` to select rows that satisfy multiple conditions, and `OR` for rows that satisfy at least one condition:
```sql
SELECT name, price, stock 
FROM products 
WHERE price < 200.00 AND stock > 30;
```

---

## 3. Sorting Results with `ORDER BY`

By default, relational databases do not guarantee the order of query results. Use `ORDER BY` to sort your results in ascending (`ASC`, default) or descending (`DESC`) order:

```sql
SELECT name, price 
FROM products 
ORDER BY price DESC;
```

You can also sort by multiple columns. For example, sort by category id ascending, then price descending:
```sql
SELECT name, category_id, price 
FROM products 
ORDER BY category_id ASC, price DESC;
```

---

## 4. Limiting Rows with `LIMIT` & `OFFSET`

The `LIMIT` clause restricts the number of rows returned by a query, which is useful for pagination or when you only want to see top results:

```sql
SELECT name, price 
FROM products 
ORDER BY price DESC 
LIMIT 3;
```

Use `OFFSET` to skip a specific number of rows before returning the results:
```sql
-- Skips the top 3 most expensive products and returns the next 3
SELECT name, price 
FROM products 
ORDER BY price DESC 
LIMIT 3 OFFSET 3;
```

---

## 💥 Hands-on Challenge
Write a query to retrieve all customers (`role = 'customer'`) sorted by their creation date (`created_at`) from oldest to newest, showing only the first 5 records. Click **Run Query** on your sandbox editor or try it directly in the editor panel to verify!
