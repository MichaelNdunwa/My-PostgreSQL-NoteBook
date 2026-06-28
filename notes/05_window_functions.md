# Chapter 5: Window Functions

Window functions perform calculations across a set of table rows that are somehow related to the current row. This is comparable to the type of calculation that can be done with an aggregate function. However, unlike regular aggregate functions, window functions do not cause rows to be grouped into a single output row—the rows retain their separate identities.

Behind the scenes, the window function is able to access more than just the current row of the query result.

---

## 1. Syntax of Window Functions

The basic syntax is:
```sql
function_name() OVER (
    [PARTITION BY partition_column]
    [ORDER BY sort_column]
)
```

- `PARTITION BY`: Divides rows into groups or partitions (similar to `GROUP BY` but rows aren't collapsed).
- `ORDER BY`: Determines the order in which rows inside a partition are processed.

---

## 2. Row Numbering and Ranking

### `ROW_NUMBER()`
Assigns a unique, sequential integer to each row inside a partition, starting at 1:
```sql
SELECT 
    name, 
    price, 
    category_id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank_in_category
FROM products;
```

### `RANK()` vs `DENSE_RANK()`
- `RANK()`: Assigns ranking values. If there is a tie, it skips rank numbers. (e.g. 1, 2, 2, 4).
- `DENSE_RANK()`: Assigns ranking values. If there is a tie, it does NOT skip rank numbers (e.g. 1, 2, 2, 3).

```sql
SELECT 
    name, 
    price, 
    RANK() OVER (ORDER BY price DESC) as rnk,
    DENSE_RANK() OVER (ORDER BY price DESC) as dense_rnk
FROM products;
```

---

## 3. Running Totals and Moving Averages

You can run normal aggregate functions like `SUM`, `AVG`, or `COUNT` as window functions. This is perfect for calculating running totals:

```sql
SELECT 
    id AS order_id, 
    order_date, 
    total,
    SUM(total) OVER (ORDER BY order_date) AS running_total_revenue
FROM orders;
```

---

## 4. Accessing Neighboring Rows (`LAG` & `LEAD`)

- `LAG(column, offset)`: Accesses data from a previous row in the partition.
- `LEAD(column, offset)`: Accesses data from a subsequent row in the partition.

This is ideal for analyzing trends or changes over time:

```sql
WITH daily_sales AS (
    SELECT 
        DATE(order_date) AS sales_date,
        SUM(total) AS daily_total
    FROM orders
    GROUP BY DATE(order_date)
)
SELECT 
    sales_date,
    daily_total,
    LAG(daily_total, 1) OVER (ORDER BY sales_date) AS previous_day_sales,
    (daily_total - LAG(daily_total, 1) OVER (ORDER BY sales_date)) AS sales_growth
FROM daily_sales;
```

---

## 💥 Hands-on Challenge
Write a query to find the most expensive product in each category. Show the category name, product name, and product price. (Hint: Use a CTE with `ROW_NUMBER()` or `DENSE_RANK()` partitioned by `category_id` and filter where the rank equals 1).
