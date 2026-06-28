# Chapter 2: Relational Joins

Relational databases store related data in separate tables. To combine rows from two or more tables based on a related column, SQL uses the `JOIN` operation.

---

## 1. The Inner Join (`INNER JOIN`)

An `INNER JOIN` selects records that have matching values in both tables. If a row in the first table doesn't match any row in the second table, it is excluded from the result.

```sql
SELECT p.name AS product_name, c.name AS category_name, p.price
FROM products p
INNER JOIN categories c ON p.category_id = c.id;
```

---

## 2. Left Outer Join (`LEFT JOIN`)

A `LEFT JOIN` returns all records from the left table (`products`), and the matched records from the right table (`categories`). If there is no match, the result contains `NULL` values for columns of the right table.

Let's insert a temporary product without a category to demonstrate this (or write a query showing all products):
```sql
SELECT p.name AS product_name, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

---

## 3. Right Outer Join (`RIGHT JOIN`)

A `RIGHT JOIN` returns all records from the right table (`categories`), and the matched records from the left table (`products`). If there is no match, the result contains `NULL` for columns on the left.

This is helpful to find categories that currently do not have any products assigned:
```sql
SELECT c.name AS category_name, p.name AS product_name
FROM products p
RIGHT JOIN categories c ON p.category_id = c.id;
```

---

## 4. Multi-Table Joins

You can join more than two tables in a single query. For example, let's join `orders`, `users`, and `order_items` to understand who purchased what.

```sql
SELECT 
    o.id AS order_id,
    u.name AS customer_name,
    p.name AS product_name,
    oi.quantity,
    (oi.quantity * oi.unit_price) AS item_total
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
ORDER BY o.id;
```

---

## 5. Set Operations (`UNION`, `INTERSECT`, `EXCEPT`)

Set operations combine the results of two or more queries into a single result set. The queries must select the same number of columns with matching data types.

- `UNION`: Combines results and removes duplicates.
- `UNION ALL`: Combines results but retains duplicates.
- `INTERSECT`: Returns only rows present in both query results.
- `EXCEPT`: Returns rows from the first query that are not present in the second.

```sql
-- Union Example: Get a list of all distinct brands and categories in the store
SELECT DISTINCT specs->>'brand' AS name, 'Brand' AS type
FROM products
WHERE specs->>'brand' IS NOT NULL
UNION
SELECT name, 'Category' AS type
FROM categories;
```

---

## 💥 Hands-on Challenge
Write a query to list all products that have been reviewed, showing the product name, the rating, and the reviewer's name. Sort the results by the rating in descending order.
