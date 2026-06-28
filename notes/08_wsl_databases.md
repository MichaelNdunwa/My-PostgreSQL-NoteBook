# Chapter 8: PostgreSQL WSL Connection & psql Basics

This guide documents how to list PostgreSQL databases in WSL, and what to do if you encounter **peer authentication** errors. It also covers how to explore tables inside a specific database, query data, exit cleanly, and use common `psql` meta‑commands.

---

## 1. Basic Command to List Databases
From your WSL terminal:

```bash
psql -U postgres -l
```

or log into the `psql` prompt and run:

```bash
psql -U postgres
\l
```

---

## 2. If You Get a "Peer Authentication Failed" Error
PostgreSQL may reject the login because your Linux username does not match the PostgreSQL role. You have several options:

### Option A: Switch to the `postgres` System User
```bash
sudo -i -u postgres
psql
```
Then inside `psql`:
```sql
\l
```

---

### Option B: Change Authentication from Peer to MD5 (Password)
1. Edit the `pg_hba.conf` file:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
   *(replace `14` with your installed version)*

2. Find the line:
   ```
   local   all             postgres                                peer
   ```
   Change `peer` to `md5`:
   ```
   local   all             postgres                                md5
   ```

3. Restart PostgreSQL:
   ```bash
   sudo service postgresql restart
   ```

4. Set a password for the `postgres` role:
   ```bash
   sudo -i -u postgres psql
   ALTER USER postgres WITH PASSWORD 'yourpassword';
   ```

5. Connect with password prompt:
   ```bash
   psql -U postgres -W
   ```

---

### Option C: Create a Role Matching Your WSL Username
If your WSL username is `xx`, create a matching PostgreSQL role:

```bash
sudo -i -u postgres psql
CREATE ROLE xx WITH LOGIN SUPERUSER PASSWORD 'mypassword';
```

Then connect directly:
```bash
psql -U xx -W
```

---

## 3. Switching Databases Inside `psql`
If you’re already inside the `psql` shell, you can connect to another database without exiting:

```sql
\c mydatabase
```

Optionally specify a user:
```sql
\c mydatabase username
```

---

## 4. Listing Tables Inside a Specific Database
Once connected to a database:

- List all tables:
  ```sql
  \dt
  ```

- List tables in a specific schema:
  ```sql
  \dt schema_name.*
  ```

- List all relations (tables, views, sequences):
  ```sql
  \d
  ```

- Inspect a specific table’s structure:
  ```sql
  \d table_name
  ```

---

## 5. Querying Data from a Table
To view data inside a table:

- Show all rows (⚠️ may be large):
  ```sql
  SELECT * FROM table_name;
  ```

- Show only the first 10 rows:
  ```sql
  SELECT * FROM table_name LIMIT 10;
  ```

- Show specific columns:
  ```sql
  SELECT id, name FROM table_name LIMIT 10;
  ```

- Filter rows with a condition:
  ```sql
  SELECT * FROM table_name WHERE status = 'active' LIMIT 10;
  ```

---

## 6. Exiting `psql` Cleanly
When you’re done, exit the `psql` shell with:

```sql
\q
```

This will return you to your WSL terminal prompt.

---

## 7. Common `psql` Meta‑Commands Cheat Sheet
Here are useful meta‑commands to remember:

- `\?` → Show help for all commands  
- `\l` → List databases  
- `\c dbname` → Connect to a database  
- `\dt` → List tables in the current database  
- `\d table_name` → Describe a table’s structure  
- `\du` → List roles and users  
- `\conninfo` → Show current connection info  
- `\q` → Quit `psql`  

---

## Summary
- **List databases:** `psql -U postgres -l` or `\l`
- **If peer fails:** use `sudo -i -u postgres psql`
- **For password login:** change `peer` → `md5` in `pg_hba.conf`
- **For convenience:** create a PostgreSQL role matching your WSL username
- **Switch DB inside shell:** `\c dbname`
- **List tables:** `\dt`
- **Inspect table:** `\d table_name`
- **Query data:** `SELECT * FROM table_name LIMIT 10;`
- **Exit cleanly:** `\q`
- **Cheat sheet:** use `\?`, `\du`, `\conninfo` for quick info
