# Chapter 4: Subqueries & CTEs

As your queries grow in complexity, writing everything in a single level becomes difficult to read and maintain. SQL offers two main ways to structure complex queries: **Subqueries** and **Common Table Expressions (CTEs)**.

---

## 1. Subqueries

A subquery is a query nested inside another query. It can be used in the `SELECT`, `FROM`, or `WHERE` clauses.

### Subquery in `WHERE` (Scalar Subquery)
Find products that cost more than the average product price:
```sql
SELECT name, price 
FROM products 
WHERE price > (SELECT AVG(price) FROM products);
```

### Subquery with `IN`
Find all users who have placed an order:
```sql
SELECT name, email 
FROM users 
WHERE id IN (SELECT DISTINCT user_id FROM orders);
```

### Correlated Subqueries
A correlated subquery is a subquery that references columns from the outer query. It is evaluated once for each row processed by the outer query:
```sql
-- Find products that are more expensive than the average price of their own category
SELECT p1.name, p1.price, p1.category_id
FROM products p1
WHERE p1.price > (
    SELECT AVG(p2.price) 
    FROM products p2 
    WHERE p2.category_id = p1.category_id
);
```

---

## 2. Common Table Expressions (CTEs)

A CTE is a temporary result set that you can reference within another `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs are defined using the `WITH` clause and act like virtual tables created on-the-fly.

CTEs are much more readable than nested subqueries because they follow a top-down logical flow:

```sql
WITH customer_orders AS (
    -- Step 1: Calculate aggregate orders per user
    SELECT 
        user_id, 
        COUNT(id) AS total_orders, 
        SUM(total) AS lifetime_value
    FROM orders
    GROUP BY user_id
)
-- Step 2: Join the user profiles with the aggregate values
SELECT 
    u.name, 
    u.email, 
    co.total_orders, 
    co.lifetime_value
FROM users u
INNER JOIN customer_orders co ON u.id = co.user_id
ORDER BY co.lifetime_value DESC;
```

---

## 3. CTE vs Subquery: Which to use?

| Feature | Subqueries | CTEs (`WITH`) |
| :--- | :--- | :--- |
| **Readability** | Poor when nested deeply | Excellent; linear logical flow |
| **Reusability** | Cannot be referenced multiple times in same query | Can be referenced multiple times in the query |
| **Recursion** | No | Yes (using `WITH RECURSIVE`) |
| **Performance** | Historically faster, but modern PG optimizes both equally | Excellent optimization in PostgreSQL 12+ |

---

## 💥 Hands-on Challenge
Write a CTE named `high_rated_products` that finds all products with an average review rating of 4.0 or higher. Then, write a main query that joins this CTE with the `products` table and `categories` table to display the product name, average rating, and category name.
