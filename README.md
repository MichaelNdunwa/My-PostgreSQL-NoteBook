# 🐘 Interactive PostgreSQL Notebook

An interactive, in-browser notebook for learning and practicing PostgreSQL. This repository contains a beautiful, zero-build Single Page Application (SPA) designed to run **PostgreSQL directly in the browser via WebAssembly (PGlite)**.

No database servers, docker containers, or cloud credentials required. It runs 100% locally and is fully compatible with **GitHub Pages** for easy, persistent sharing.

---

## ⚡ Key Features

1. **PostgreSQL WASM Engine**: Powered by `@electric-sql/pglite` (a WebAssembly build of Postgres), running real PostgreSQL database queries in the client.
2. **IndexedDB Persistence**: Automatically saves your database updates, newly created tables, or custom data values in your browser's persistent storage.
3. **Interactive Lesson Chapters**: Renders structured markdown notes (from the `/notes` folder). Each SQL query block features an inline **Run Query** button that executes the code and renders output tables directly below the block.
4. **Interactive SQL Sandbox**: A fully-featured SQL console with syntax highlighting, schema reference panels, execution timing metrics, and row count outputs.
5. **Dynamic Schema Explorer**: Automatically inspects the PostgreSQL catalog (`information_schema`) to show tables, column structures, and datatypes.
6. **Pre-Seeded Dataset**: Comes pre-populated with a rich relational schema (`users`, `categories`, `products`, `orders`, `order_items`, and `reviews`) to practice complex Joins, aggregates, and JSONB queries.
7. **Built-in Searchable Cheatsheet**: Quick reference tables for common PostgreSQL syntax, window functions, array aggregations, and performance commands.
8. **In-app Note Editor & Exporter**: Make changes to note drafts directly in the app. Export the modified Markdown files with 1-click to update your repository files.

---

## 🚀 Running Locally

Because WebAssembly and fetching localized Markdown notes require a valid HTTP server context (browsers block dynamic ESM and WASM loading over `file://` protocols for security), you must serve the folder using a local web server:

### Quick Run
Using Node/npx (no installation required):
```bash
npx http-server
```

Or using Python:
```bash
python -m http.server
```

Or using PHP:
```bash
php -S localhost:8000
```

Once the server is running, open the provided URL (typically `http://localhost:8080` or `http://localhost:8000`) in your web browser.

---

## 🌐 Deploying to GitHub Pages

Since this project requires no server-side compilation or backend components, it can be deployed to GitHub Pages instantly:

1. Push your notebook project code to your GitHub repository.
2. Navigate to your repository settings page on GitHub.
3. In the sidebar under **Code and automation**, click **Pages**.
4. Set the **Source** to **Deploy from a branch**.
5. Select your main/master branch and folder `/ (root)`, then click **Save**.
6. GitHub will deploy your interactive notebook in a few minutes, making it accessible at `https://<your-username>.github.io/<your-repo-name>/`.

---

## 📁 Repository Structure

* `index.html` - Main HTML layout and assets links.
* `index.css` - Visual styling system (glassmorphism cosmic design).
* `app.js` - Database initialization and notebook application logic.
* `seed.sql` - PostgreSQL initialization seed script.
* `notes/` - Directory containing chapter note files:
  * `01_basics.md` - Basics, comparisons, and pagination.
  * `02_joins.md` - Relational joins, unions, and set operations.
  * `03_aggregations.md` - Count, sum, average, grouping and HAVING.
  * `04_subqueries_ctes.md` - Subqueries and Common Table Expressions (CTEs).
  * `05_window_functions.md` - Rows partitions, ranking and lagged fields.
  * `06_jsonb_nosql.md` - Semi-structured JSONB documents and query operators.
  * `07_performance_tuning.md` - Indexing and query planning analysis.
  * `08_wsl_databases.md` - WSL connection guides and psql command lines reference.


---

## ✍️ Development & Contribution

Want to add new chapters, customize schema data, or run the notebook locally? See the [DEVELOPMENT.md](file:////wsl.localhost/Debian/home/xx/dev/My-PostgreSQL-NoteBook/DEVELOPMENT.md) guide.