# Developing & Adding Chapters

This guide explains how to develop this PostgreSQL notebook, including adding new learning chapters, custom SQL seeds, and adjusting configuration.

---

## ✍️ Adding New Chapters

To expand your personal notebook with new topics:

1. **Create the Markdown file**:
   Add a new `.md` file inside the `notes/` directory (e.g., `notes/09_transactions.md`).

2. **Register the chapter**:
   Add your file to the `CHAPTERS` config array at the top of [app.js](file:///app.js):
   ```javascript
   const CHAPTERS = [
       ...
       { file: '08_wsl_databases.md', title: 'Chapter 8: WSL DB & psql Basics' },
       { file: '09_transactions.md', title: 'Chapter 9: PostgreSQL Transactions' }
   ];
   ```

3. **Write SQL Blocks**:
   * **Interactive SQL Blocks**: Wrap standard PostgreSQL queries in standard ` ```sql ` code blocks to automatically render an interactive **Run Query** button in the notebook.
   * **Static SQL Blocks**: For administrative `psql` meta-commands (e.g. `\dt`, `\q`) or blocks you do not want executed, start the code block with a `-- NO_RUN` comment or prefix with backslashes (which the parser automatically skips).

---

## 🛠️ Local Development

To run the application locally, you must serve it using a local HTTP server to avoid CORS issues with WebAssembly loading:

* **Node/npx**: `npx http-server`
* **Python**: `python -m http.server 8080`

Open `http://localhost:8080` in your browser to view changes.
