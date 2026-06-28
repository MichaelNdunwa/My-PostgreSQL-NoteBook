import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js';

// Configuration
const CHAPTERS = [
    { file: '01_basics.md', title: 'Chapter 1: Basics & Filtering' },
    { file: '02_joins.md', title: 'Chapter 2: Relational Joins' },
    { file: '03_aggregations.md', title: 'Chapter 3: Aggregations & Grouping' },
    { file: '04_subqueries_ctes.md', title: 'Chapter 4: Subqueries & CTEs' },
    { file: '05_window_functions.md', title: 'Chapter 5: Window Functions' },
    { file: '06_jsonb_nosql.md', title: 'Chapter 6: JSONB & NoSQL' },
    { file: '07_performance_tuning.md', title: 'Chapter 7: Performance & Index' },
    { file: '08_wsl_databases.md', title: 'Chapter 8: WSL DB & psql Basics' }
];

const CHEATSHEET_DATA = [
    {
        title: "Basic Queries",
        items: [
            { cmd: "SELECT col1, col2 FROM table;", desc: "Select specific columns from a table" },
            { cmd: "SELECT * FROM table WHERE condition;", desc: "Filter rows with WHERE clause" },
            { cmd: "SELECT * FROM table ORDER BY col DESC LIMIT 5;", desc: "Sort descending and limit output rows" },
            { cmd: "SELECT DISTINCT col FROM table;", desc: "Select unique values in a column" }
        ]
    },
    {
        title: "Table Joins",
        items: [
            { cmd: "SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.t1_id;", desc: "Select rows matching in both tables" },
            { cmd: "SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.t1_id;", desc: "All rows from left, matching from right" },
            { cmd: "SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.t1_id;", desc: "All rows from right, matching from left" },
            { cmd: "SELECT col FROM t1 UNION SELECT col FROM t2;", desc: "Combine rows, removing duplicates" }
        ]
    },
    {
        title: "Aggregation",
        items: [
            { cmd: "SELECT COUNT(*), AVG(col), SUM(col) FROM table;", desc: "Count, average, and sum columns" },
            { cmd: "SELECT category, COUNT(*) FROM table GROUP BY category;", desc: "Group rows by category column" },
            { cmd: "SELECT cat, AVG(val) FROM t GROUP BY cat HAVING AVG(val) > 50;", desc: "Filter groups based on aggregation" },
            { cmd: "SELECT string_agg(name, ', ') FROM users;", desc: "Concatenate string values into single cell" }
        ]
    },
    {
        title: "Subqueries & CTEs",
        items: [
            { cmd: "SELECT * FROM t WHERE val > (SELECT AVG(val) FROM t);", desc: "Filter where value is greater than aggregate subquery" },
            { cmd: "WITH summary AS (\n  SELECT cat, SUM(val) AS tot FROM t GROUP BY cat\n)\nSELECT * FROM summary WHERE tot > 100;", desc: "Define temporary CTE block to query" }
        ]
    },
    {
        title: "Window Functions",
        items: [
            { cmd: "ROW_NUMBER() OVER (PARTITION BY cat ORDER BY val DESC)", desc: "Row counter in category window" },
            { cmd: "RANK() OVER (ORDER BY val DESC)", desc: "Rank value, skipping tied counts (1, 2, 2, 4)" },
            { cmd: "DENSE_RANK() OVER (ORDER BY val DESC)", desc: "Rank value, dense numbering (1, 2, 2, 3)" },
            { cmd: "LAG(val, 1) OVER (ORDER BY date_col)", desc: "Retrieve value from the previous row in ordering" }
        ]
    },
    {
        title: "JSONB Operations",
        items: [
            { cmd: "specs->>'brand'", desc: "Get JSONB object field value as string text" },
            { cmd: "specs->'colors'", desc: "Get JSONB nested field as raw JSONB value" },
            { cmd: "specs#>>'{dimensions,weight}'", desc: "Get nested JSONB attribute at path as text" },
            { cmd: "specs @> '{\"waterproof\": true}'", desc: "Boolean: check if JSONB contains target object" }
        ]
    },
    {
        title: "Performance & Admin",
        items: [
            { cmd: "EXPLAIN ANALYZE SELECT * FROM table;", desc: "Execute query, show actual runtime planner plans" },
            { cmd: "CREATE INDEX idx_name ON table_name(column_name);", desc: "Create default B-Tree performance index" },
            { cmd: "CREATE INDEX idx_json ON table USING gin(json_col);", desc: "Create GIN index for nested JSONB searches" },
            { cmd: "DROP TABLE IF EXISTS table_name CASCADE;", desc: "Drop table structure, removing foreign references" }
        ]
    }
];

// App State
let db = null;
let currentChapterIndex = 0;
let markdownCache = {}; // Cache raw markdown contents

// DOM Elements
const dbStatusIndicator = document.getElementById('db-status-indicator');
const dbStatusText = document.getElementById('db-status-text');
const btnResetDb = document.getElementById('btn-reset-db');
const notesMenuList = document.getElementById('notes-menu-list');
const notesRendererTarget = document.getElementById('notes-renderer-target');
const navTabs = document.querySelectorAll('.nav-tab');
const pages = document.querySelectorAll('.page-content');
const btnEditNote = document.getElementById('btn-edit-note');
const btnDownloadNote = document.getElementById('btn-download-note');

// Sandbox Elements
const sandboxTextarea = document.getElementById('sandbox-textarea');
const btnSandboxRun = document.getElementById('btn-sandbox-run');
const sandboxResultsContent = document.getElementById('sandbox-results-content');
const sandboxResultsSummary = document.getElementById('sandbox-results-summary');
const schemaExplorerTarget = document.getElementById('schema-explorer-target');

// Cheatsheet Elements
const cheatsheetGrid = document.getElementById('cheatsheet-grid');
const cheatsheetSearch = document.getElementById('cheatsheet-search');

// Modal Elements
const editNoteModal = document.getElementById('edit-note-modal');
const editNoteTextarea = document.getElementById('edit-note-textarea');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelNoteEdit = document.getElementById('btn-cancel-note-edit');
const btnSaveNoteEdit = document.getElementById('btn-save-note-edit');
const editNoteTitle = document.getElementById('edit-note-title');

// Initialize Application
async function init() {
    setupTabListeners();
    setupCheatsheet();
    setupModalListeners();
    setupDatabaseReset();
    
    // Connect to PostgreSQL WASM
    updateDbStatus('booting', 'Booting WASM...');
    try {
        // Try IndexedDB persistence, fallback to memory if fails
        db = new PGlite('idb://pg-notebook');
        await db.waitReady;
        updateDbStatus('connected', 'Connected');
    } catch (e) {
        console.warn("IndexedDB initialization failed. Falling back to in-memory store.", e);
        try {
            db = new PGlite();
            await db.waitReady;
            updateDbStatus('connected', 'In-Memory DB');
            document.getElementById('db-storage-name').textContent = 'Ephemeral (In-Memory)';
        } catch (err) {
            updateDbStatus('error', 'WASM Error');
            console.error("PGlite initialization failed entirely", err);
            alert("Could not load PostgreSQL WASM. Please check your browser support.");
            return;
        }
    }

    // Seed database if empty
    await ensureDatabaseSeeded();
    
    // Load Schema Explorer
    await refreshSchemaExplorer();
    
    // Load Menu and Chapter 1
    buildNotesMenu();
    await loadChapter(0);
}

// Database Seeding Logic
async function ensureDatabaseSeeded() {
    try {
        // Check if users table exists
        const res = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        
        const exists = res.rows[0].exists;
        if (!exists) {
            console.log("Database not seeded. Running seed.sql...");
            await seedDatabase();
        }
    } catch (err) {
        console.error("Error checking seeded state", err);
    }
}

async function seedDatabase() {
    updateDbStatus('booting', 'Seeding DB...');
    try {
        const response = await fetch('./seed.sql');
        if (!response.ok) throw new Error("Could not find seed.sql file");
        const sql = await response.text();
        await db.exec(sql);
        updateDbStatus('connected', 'Seeded & Ready');
    } catch (e) {
        console.error("Database seeding failed", e);
        updateDbStatus('error', 'Seeding Error');
        alert("Failed to seed database: " + e.message);
    }
}

function updateDbStatus(status, text) {
    dbStatusIndicator.className = 'status-indicator ' + status;
    dbStatusText.textContent = text;
}

function setupDatabaseReset() {
    btnResetDb.addEventListener('click', async () => {
        if (confirm("Are you sure you want to reset your PostgreSQL database? All custom modifications and indices will be deleted, and the seed schema will be reloaded.")) {
            try {
                updateDbStatus('booting', 'Resetting...');
                // We drop all tables dynamically or run seed.sql directly since seed.sql contains drop statements
                const response = await fetch('./seed.sql');
                if (!response.ok) throw new Error("Could not find seed.sql file");
                const sql = await response.text();
                await db.exec(sql);
                updateDbStatus('connected', 'Database Reset');
                await refreshSchemaExplorer();
                
                // Re-run currently displayed chapter outputs if any
                const activeResults = notesRendererTarget.querySelectorAll('.sql-runner-results');
                activeResults.forEach(panel => {
                    panel.classList.remove('active');
                    panel.innerHTML = '';
                });
                
                // If in Sandbox, clear results
                sandboxResultsContent.innerHTML = `
                    <div class="sandbox-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
                        <p>Database Reset Successful. Run a new query.</p>
                    </div>
                `;
                sandboxResultsSummary.textContent = "Database tables reset to initial state.";
            } catch (err) {
                console.error(err);
                updateDbStatus('error', 'Reset Failed');
                alert("Reset database failed: " + err.message);
            }
        }
    });
}

// Sidebar Navigation Builders
function buildNotesMenu() {
    notesMenuList.innerHTML = '';
    CHAPTERS.forEach((chapter, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item ${index === currentChapterIndex ? 'active' : ''}`;
        menuItem.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>${chapter.title}</span>
        `;
        menuItem.addEventListener('click', () => {
            loadChapter(index);
        });
        notesMenuList.appendChild(menuItem);
    });
}

async function loadChapter(index) {
    currentChapterIndex = index;
    const chapter = CHAPTERS[index];
    
    // Update Active Sidebar Link
    const items = notesMenuList.querySelectorAll('.menu-item');
    items.forEach((item, idx) => {
        if (idx === index) item.classList.add('active');
        else item.classList.remove('active');
    });

    let markdown = '';
    
    // Check local drafts first
    const draftKey = `pg_note_draft_${chapter.file}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
        markdown = draft;
    } else if (markdownCache[chapter.file]) {
        markdown = markdownCache[chapter.file];
    } else {
        try {
            const response = await fetch(`./notes/${chapter.file}`);
            if (!response.ok) throw new Error("Could not find note file " + chapter.file);
            markdown = await response.text();
            markdownCache[chapter.file] = markdown;
        } catch (e) {
            console.error("Failed loading markdown note", e);
            markdown = `# Error\nCould not fetch chapter note. Make sure file exists at \`notes/${chapter.file}\`.`;
        }
    }

    renderMarkdown(markdown);
}

// Markdown Rendering with Inline Query Runner Injection
function renderMarkdown(markdown) {
    // Basic setup for marked options (if needed)
    marked.setOptions({
        gfm: true,
        breaks: true
    });
    
    const rawHtml = marked.parse(markdown);
    
    // Replace raw SQL blocks with custom Interactive Runners
    // The marked library produces <pre><code class="language-sql">...</code></pre> structures
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;
    
    const codeBlocks = tempDiv.querySelectorAll('pre code.language-sql');
    
    codeBlocks.forEach((codeBlock, blockIdx) => {
        const pre = codeBlock.parentElement;
        const sqlQuery = codeBlock.textContent.trim();
        
        // Skip creating runners for blocks that aren't executable queries (like schema definitions inside text blocks or psql meta-commands)
        if (sqlQuery.startsWith('\\') || sqlQuery.toUpperCase().startsWith('-- NO_RUN') || sqlQuery.toUpperCase().startsWith('CREATE TABLE') && !sqlQuery.includes('INSERT INTO') && blockIdx > 10) {
            // Keep as basic code block
            return;
        }

        // Create Container Card
        const card = document.createElement('div');
        card.className = 'sql-runner-card';
        
        // Header
        const header = document.createElement('div');
        header.className = 'sql-runner-header';
        header.innerHTML = `
            <div class="sql-runner-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                PostgreSQL Block Runner
            </div>
            <div class="sql-runner-actions">
                <button class="btn-run-sql">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Run Query
                </button>
            </div>
        `;

        // Code display area
        const codeDisplay = document.createElement('pre');
        codeDisplay.className = 'sql-runner-code language-sql';
        
        // Copy the colored content if Prism has already highlighted it, otherwise copy text
        codeDisplay.innerHTML = Prism.highlight(sqlQuery, Prism.languages.sql, 'sql');
        
        // Output panel
        const outputPanel = document.createElement('div');
        outputPanel.className = 'sql-runner-results';
        
        card.appendChild(header);
        card.appendChild(codeDisplay);
        card.appendChild(outputPanel);
        
        // Setup listener
        const runBtn = header.querySelector('.btn-run-sql');
        runBtn.addEventListener('click', () => runInlineQuery(sqlQuery, outputPanel));

        // Replace original pre
        pre.parentNode.replaceChild(card, pre);
    });

    notesRendererTarget.innerHTML = '';
    notesRendererTarget.appendChild(tempDiv);
    
    // Highlight any remaining non-SQL blocks or basic inline styles
    Prism.highlightAllUnder(notesRendererTarget);
}

// Inline Query Runner Execution
async function runInlineQuery(sql, resultsPanel) {
    resultsPanel.innerHTML = '<div style="padding: 12px 20px; font-size: 0.8rem; color: var(--text-secondary);">Executing query in PostgreSQL WASM...</div>';
    resultsPanel.classList.add('active');

    const start = performance.now();
    try {
        const res = await db.query(sql);
        const elapsed = (performance.now() - start).toFixed(1);
        
        displayResultsTable(res, resultsPanel, elapsed);
        await refreshSchemaExplorer();
    } catch (err) {
        resultsPanel.innerHTML = `
            <div class="query-error">
                <strong>PostgreSQL Error:</strong><br>${err.message}
            </div>
        `;
        console.error("SQL Run Error:", err);
    }
}

// General Results Formatter Table
function displayResultsTable(result, targetDiv, elapsedMs) {
    targetDiv.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'results-summary';
    
    if (result.rows.length === 0) {
        summary.innerHTML = `<span>Query executed successfully.</span><span>Time: ${elapsedMs}ms</span>`;
        targetDiv.appendChild(summary);
        
        const info = document.createElement('div');
        info.style.padding = '14px 20px';
        info.style.color = 'var(--accent-emerald)';
        info.style.fontSize = '0.85rem';
        info.style.fontFamily = 'var(--font-mono)';
        info.textContent = `Command: ${result.affectedRows !== undefined ? result.affectedRows : 0} rows affected.`;
        targetDiv.appendChild(info);
        return;
    }

    summary.innerHTML = `<span>Returned ${result.rows.length} rows</span><span>Time: ${elapsedMs}ms</span>`;
    targetDiv.appendChild(summary);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'results-table-container';

    const table = document.createElement('table');
    table.className = 'query-table';

    // Build Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    result.fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.name;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Build Body
    const tbody = document.createElement('tbody');
    result.rows.forEach(row => {
        const tr = document.createElement('tr');
        result.fields.forEach(field => {
            const td = document.createElement('td');
            const val = row[field.name];
            if (val === null) {
                td.textContent = 'NULL';
                td.style.color = 'var(--text-muted)';
                td.style.fontStyle = 'italic';
            } else if (typeof val === 'object') {
                td.textContent = JSON.stringify(val);
                td.style.color = 'var(--accent-cyan)';
            } else {
                td.textContent = val.toString();
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    targetDiv.appendChild(tableContainer);
}

// Sandbox Execution Logic
async function runSandboxQuery() {
    const sql = sandboxTextarea.value.trim();
    if (!sql) return;

    sandboxResultsContent.innerHTML = '<div style="padding: 24px; color: var(--text-secondary); font-size: 0.9rem;">Executing...</div>';
    
    const start = performance.now();
    try {
        const res = await db.query(sql);
        const elapsed = (performance.now() - start).toFixed(1);
        
        displayResultsTable(res, sandboxResultsContent, elapsed);
        sandboxResultsSummary.innerHTML = `Query completed successfully. ${res.rows.length} rows affected/returned.`;
        await refreshSchemaExplorer();
    } catch (err) {
        sandboxResultsSummary.textContent = "Execution encountered an error.";
        sandboxResultsContent.innerHTML = `
            <div class="query-error">
                <strong>PostgreSQL Error:</strong><br>${err.message}
            </div>
        `;
        console.error("Sandbox Error:", err);
    }
}

btnSandboxRun.addEventListener('click', runSandboxQuery);

// Bind F5 / Ctrl+Enter key inside Sandbox editor
sandboxTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        runSandboxQuery();
    }
});

// Schema Explorer Introspection
async function refreshSchemaExplorer() {
    if (!db) return;
    
    try {
        // Query to get user tables
        const tablesRes = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        schemaExplorerTarget.innerHTML = '';
        
        if (tablesRes.rows.length === 0) {
            schemaExplorerTarget.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; margin-top: 24px;">
                    No user tables found in database.
                </div>
            `;
            return;
        }

        for (const tableRow of tablesRes.rows) {
            const tableName = tableRow.table_name;
            
            // Get columns for this table
            const columnsRes = await db.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `, [tableName]);

            const tableItem = document.createElement('div');
            tableItem.className = 'schema-table-item';
            
            const tableHeader = document.createElement('div');
            tableHeader.className = 'schema-table-header';
            tableHeader.innerHTML = `
                <span>${tableName}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">(${columnsRes.rows.length} cols)</span>
            `;
            
            const columnsContainer = document.createElement('div');
            columnsContainer.className = 'schema-table-columns';
            
            columnsRes.rows.forEach(col => {
                const colDiv = document.createElement('div');
                colDiv.className = 'schema-column';
                colDiv.innerHTML = `
                    <span class="schema-column-name">${col.column_name}</span>
                    <span class="schema-column-type">${col.data_type.toLowerCase()}${col.is_nullable === 'NO' ? ' *' : ''}</span>
                `;
                columnsContainer.appendChild(colDiv);
            });

            tableHeader.addEventListener('click', () => {
                columnsContainer.classList.toggle('active');
            });

            tableItem.appendChild(tableHeader);
            tableItem.appendChild(columnsContainer);
            schemaExplorerTarget.appendChild(tableItem);
        }
    } catch (e) {
        console.error("Failed to build schema explorer", e);
        schemaExplorerTarget.innerHTML = `
            <div style="color: var(--accent-rose); font-size: 0.8rem; text-align: center; margin-top: 24px; padding: 12px;">
                Introspection failed: ${e.message}
            </div>
        `;
    }
}

// Cheatsheet Builder & Search Logic
function setupCheatsheet() {
    renderCheatsheet(CHEATSHEET_DATA);

    cheatsheetSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (!query) {
            renderCheatsheet(CHEATSHEET_DATA);
            return;
        }

        const filtered = CHEATSHEET_DATA.map(section => {
            const filteredItems = section.items.filter(item => 
                item.cmd.toLowerCase().includes(query) || 
                item.desc.toLowerCase().includes(query)
            );
            return { ...section, items: filteredItems };
        }).filter(section => section.items.length > 0);

        renderCheatsheet(filtered);
    });
}

function renderCheatsheet(data) {
    cheatsheetGrid.innerHTML = '';
    
    if (data.length === 0) {
        cheatsheetGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
                No matching reference operations found.
            </div>
        `;
        return;
    }

    data.forEach(section => {
        const card = document.createElement('div');
        card.className = 'cheat-card';
        
        const title = document.createElement('div');
        title.className = 'cheat-title';
        title.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m10 16 1.5 1.5 3-3"/><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/></svg>
            ${section.title}
        `;
        
        const list = document.createElement('div');
        list.className = 'cheat-list';
        
        section.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cheat-item';
            
            // Clean displaying of multiline cheat codes
            const lines = item.cmd.split('\n');
            const multilineHtml = lines.map(line => `<code>${line}</code>`).join('<br>');
            
            itemDiv.innerHTML = `
                <span class="cheat-cmd">${multilineHtml}</span>
                <span class="cheat-desc">${item.desc}</span>
            `;
            list.appendChild(itemDiv);
        });
        
        card.appendChild(title);
        card.appendChild(list);
        cheatsheetGrid.appendChild(card);
    });
}

// Tab Switching Listeners
function setupTabListeners() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Toggle Tab Buttons
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle Display Pages
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            // Header actions display
            if (target === 'tab-notes') {
                btnEditNote.style.display = 'flex';
                btnDownloadNote.style.display = 'flex';
            } else {
                btnEditNote.style.display = 'none';
                btnDownloadNote.style.display = 'none';
            }
            
            // Focus textarea if switching to Sandbox
            if (target === 'tab-sandbox') {
                setTimeout(() => sandboxTextarea.focus(), 100);
            }
        });
    });
}

// Modal Edit Note Listeners
function setupModalListeners() {
    btnEditNote.addEventListener('click', () => {
        const chapter = CHAPTERS[currentChapterIndex];
        const draftKey = `pg_note_draft_${chapter.file}`;
        const draft = localStorage.getItem(draftKey);
        
        editNoteTitle.textContent = `Drafting Local Edits - ${chapter.title}`;
        
        if (draft) {
            editNoteTextarea.value = draft;
        } else if (markdownCache[chapter.file]) {
            editNoteTextarea.value = markdownCache[chapter.file];
        } else {
            editNoteTextarea.value = '';
        }
        
        editNoteModal.classList.add('active');
        editNoteTextarea.focus();
    });

    const closeModal = () => {
        editNoteModal.classList.remove('active');
    };

    btnCloseModal.addEventListener('click', closeModal);
    btnCancelNoteEdit.addEventListener('click', closeModal);
    
    btnSaveNoteEdit.addEventListener('click', () => {
        const chapter = CHAPTERS[currentChapterIndex];
        const updatedMarkdown = editNoteTextarea.value;
        const draftKey = `pg_note_draft_${chapter.file}`;
        
        localStorage.setItem(draftKey, updatedMarkdown);
        markdownCache[chapter.file] = updatedMarkdown;
        
        renderMarkdown(updatedMarkdown);
        closeModal();
    });

    // Export markdown file logic
    btnDownloadNote.addEventListener('click', () => {
        const chapter = CHAPTERS[currentChapterIndex];
        const draftKey = `pg_note_draft_${chapter.file}`;
        const draft = localStorage.getItem(draftKey);
        let content = draft || markdownCache[chapter.file] || '';
        
        if (!content) {
            alert("No content available to export!");
            return;
        }

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', chapter.file);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
