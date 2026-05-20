const dom = {
    utilHint: document.getElementById("utilHint"),
    utilButtons: document.querySelectorAll(".util-chip"),
    utilPanels: document.querySelectorAll(".utility-panel"),

    inputText: document.getElementById("inputText"),
    outputText: document.getElementById("outputText"),
    status: document.getElementById("status"),
    treeRoot: document.getElementById("treeRoot"),
    expandAllBtn: document.getElementById("expandAllBtn"),
    collapseAllBtn: document.getElementById("collapseAllBtn"),
    urlInput: document.getElementById("urlInput"),
    loadUrlBtn: document.getElementById("loadUrlBtn"),
    fileInput: document.getElementById("fileInput"),
    browseBtn: document.getElementById("browseBtn"),
    parseBtn: document.getElementById("parseBtn"),
    prettyBtn: document.getElementById("prettyBtn"),
    minifyBtn: document.getElementById("minifyBtn"),
    clearBtn: document.getElementById("clearBtn"),
    copyBtn: document.getElementById("copyBtn"),
    sampleBtn: document.getElementById("sampleBtn"),

    diffLeft: document.getElementById("diffLeft"),
    diffRight: document.getElementById("diffRight"),
    runDiffBtn: document.getElementById("runDiffBtn"),
    diffOutput: document.getElementById("diffOutput"),

    pathInput: document.getElementById("pathInput"),
    pathQuery: document.getElementById("pathQuery"),
    runPathBtn: document.getElementById("runPathBtn"),
    pathOutput: document.getElementById("pathOutput"),

    csvInput: document.getElementById("csvInput"),
    runCsvBtn: document.getElementById("runCsvBtn"),
    csvOutput: document.getElementById("csvOutput"),

    schemaDataInput: document.getElementById("schemaDataInput"),
    schemaInput: document.getElementById("schemaInput"),
    runSchemaBtn: document.getElementById("runSchemaBtn"),
    schemaOutput: document.getElementById("schemaOutput"),

    normalizeInput: document.getElementById("normalizeInput"),
    normalizeSortKeys: document.getElementById("normalizeSortKeys"),
    normalizeRemoveEmpty: document.getElementById("normalizeRemoveEmpty"),
    runNormalizeBtn: document.getElementById("runNormalizeBtn"),
    normalizeOutput: document.getElementById("normalizeOutput"),

    escapeInput: document.getElementById("escapeInput"),
    runEscapeBtn: document.getElementById("runEscapeBtn"),
    runUnescapeBtn: document.getElementById("runUnescapeBtn"),
    escapeOutput: document.getElementById("escapeOutput"),

    dupeInput: document.getElementById("dupeInput"),
    runDupeBtn: document.getElementById("runDupeBtn"),
    dupeOutput: document.getElementById("dupeOutput"),

    searchInput: document.getElementById("searchInput"),
    searchQuery: document.getElementById("searchQuery"),
    runSearchBtn: document.getElementById("runSearchBtn"),
    searchOutput: document.getElementById("searchOutput")
};

const sampleJson = {
    page: "Travel Blogs",
    featured: true,
    highlights: ["Assam journey", "Kerala backwaters", "Valley of flowers"],
    metrics: { readersPerMonth: 12850, avgReadTimeMinutes: 6.2 }
};

function setStatus(message, kind = "") {
    dom.status.textContent = message;
    dom.status.className = `status ${kind}`.trim();
}

function escapeControlChar(ch) {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    if (ch === "\b") return "\\b";
    if (ch === "\f") return "\\f";
    const hex = ch.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${hex}`;
}

function sanitizeControlCharsInStrings(text) {
    let output = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];

        if (!inString) {
            output += ch;
            if (ch === '"') {
                inString = true;
                escaped = false;
            }
            continue;
        }

        if (escaped) {
            output += ch;
            escaped = false;
            continue;
        }

        if (ch === "\\") {
            output += ch;
            escaped = true;
            continue;
        }

        if (ch === '"') {
            output += ch;
            inString = false;
            continue;
        }

        if (ch.charCodeAt(0) < 0x20) {
            output += escapeControlChar(ch);
            continue;
        }

        output += ch;
    }

    return output;
}

function parseJsonText(rawText, label = "JSON", options = {}) {
    const text = (rawText || "").trim();
    if (!text) {
        throw new Error(`${label} is empty.`);
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        if (!options.lenient) {
            throw error;
        }

        const sanitized = sanitizeControlCharsInStrings(text);
        return JSON.parse(sanitized);
    }
}

function parseViewerInput() {
    try {
        const data = parseJsonText(dom.inputText.value, "Input JSON");
        setStatus("Valid JSON.", "success");
        return data;
    } catch (error) {
        setStatus(`Invalid JSON: ${error.message}`, "error");
        dom.treeRoot.innerHTML = "";
        return null;
    }
}

function typeOf(value) {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderTree(value, label = "root") {
    const root = document.createElement("details");
    root.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="node-key">${escapeHtml(label)}</span> <span class="node-type">(${typeOf(value)})</span>`;
    root.appendChild(summary);

    if (value !== null && typeof value === "object") {
        const entries = Array.isArray(value)
            ? value.map((item, index) => [index, item])
            : Object.entries(value);

        if (entries.length === 0) {
            const line = document.createElement("p");
            line.className = "node-line";
            line.innerHTML = '<span class="node-value">empty</span>';
            root.appendChild(line);
            return root;
        }

        entries.forEach(([key, child]) => {
            if (child !== null && typeof child === "object") {
                root.appendChild(renderTree(child, String(key)));
            } else {
                const line = document.createElement("p");
                line.className = "node-line";
                line.innerHTML = `<span class="node-key">${escapeHtml(String(key))}</span>: <span class="node-value">${escapeHtml(String(child))}</span> <span class="node-type">(${typeOf(child)})</span>`;
                root.appendChild(line);
            }
        });
    } else {
        const line = document.createElement("p");
        line.className = "node-line";
        line.innerHTML = `<span class="node-value">${escapeHtml(String(value))}</span>`;
        root.appendChild(line);
    }

    return root;
}

function updateViewerOutput(format = "pretty") {
    const data = parseViewerInput();
    if (data === null) return;

    dom.outputText.value = format === "min"
        ? JSON.stringify(data)
        : JSON.stringify(data, null, 2);

    dom.treeRoot.innerHTML = "";
    dom.treeRoot.appendChild(renderTree(data));
}

function clearViewer() {
    dom.inputText.value = "";
    dom.outputText.value = "";
    dom.treeRoot.innerHTML = "";
    dom.urlInput.value = "";
    dom.fileInput.value = "";
    setStatus("Cleared.");
}

async function copyViewerOutput() {
    if (!dom.outputText.value) {
        setStatus("Nothing to copy yet.");
        return;
    }

    try {
        await navigator.clipboard.writeText(dom.outputText.value);
        setStatus("Copied output JSON.", "success");
    } catch {
        setStatus("Copy failed. Please copy manually.", "error");
    }
}

async function loadFromUrl() {
    const url = dom.urlInput.value.trim();
    if (!url) {
        setStatus("Enter a URL to load JSON.");
        return;
    }

    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Request failed with ${response.status}`);
        }

        dom.inputText.value = await response.text();
        updateViewerOutput("pretty");
    } catch (error) {
        setStatus(`Could not load URL JSON: ${error.message}`, "error");
    }
}

function loadFromLocalFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        dom.inputText.value = String(reader.result || "");
        updateViewerOutput("pretty");
    };
    reader.onerror = () => {
        setStatus("Could not read local file.", "error");
    };
    reader.readAsText(file);
}

function setTreeExpandedState(expanded) {
    const nodes = dom.treeRoot.querySelectorAll("details");
    nodes.forEach((node) => {
        node.open = expanded;
    });
    setStatus(expanded ? "Expanded all tree nodes." : "Collapsed all tree nodes.");
}

function flattenJson(value, prefix = "$") {
    const out = {};

    function walk(node, path) {
        if (node === null || typeof node !== "object") {
            out[path] = node;
            return;
        }

        if (Array.isArray(node)) {
            if (node.length === 0) out[path] = [];
            node.forEach((item, index) => walk(item, `${path}[${index}]`));
            return;
        }

        const keys = Object.keys(node);
        if (keys.length === 0) out[path] = {};
        keys.forEach((key) => walk(node[key], `${path}.${key}`));
    }

    walk(value, prefix);
    return out;
}

function runJsonDiff() {
    try {
        const left = parseJsonText(dom.diffLeft.value, "Left JSON");
        const right = parseJsonText(dom.diffRight.value, "Right JSON");
        const leftFlat = flattenJson(left);
        const rightFlat = flattenJson(right);
        const paths = [...new Set([...Object.keys(leftFlat), ...Object.keys(rightFlat)])].sort();

        const lines = [];
        paths.forEach((path) => {
            const hasLeft = Object.prototype.hasOwnProperty.call(leftFlat, path);
            const hasRight = Object.prototype.hasOwnProperty.call(rightFlat, path);
            if (hasLeft && !hasRight) {
                lines.push(`- ${path}: ${JSON.stringify(leftFlat[path])}`);
                return;
            }
            if (!hasLeft && hasRight) {
                lines.push(`+ ${path}: ${JSON.stringify(rightFlat[path])}`);
                return;
            }

            const leftValue = JSON.stringify(leftFlat[path]);
            const rightValue = JSON.stringify(rightFlat[path]);
            if (leftValue !== rightValue) {
                lines.push(`~ ${path}: ${leftValue} -> ${rightValue}`);
            }
        });

        dom.diffOutput.textContent = lines.length ? lines.join("\n") : "No differences found.";
    } catch (error) {
        dom.diffOutput.textContent = `Diff error: ${error.message}`;
    }
}

function evaluateSimplePath(data, rawPath) {
    const path = rawPath.trim();
    if (!path) throw new Error("Path is empty.");

    const normalized = path
        .replace(/^\$\.?/, "")
        .replace(/\[(\d+)\]/g, ".$1")
        .replace(/\["([^"]+)"\]/g, ".$1")
        .replace(/\['([^']+)'\]/g, ".$1")
        .split(".")
        .filter(Boolean);

    let current = data;
    for (const token of normalized) {
        if (current === null || current === undefined || !(token in Object(current))) {
            throw new Error(`Path token not found: ${token}`);
        }
        current = current[token];
    }
    return current;
}

function runPathTester() {
    try {
        const data = parseJsonText(dom.pathInput.value, "JSON input", { lenient: true });
        const result = evaluateSimplePath(data, dom.pathQuery.value);
        dom.pathOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        dom.pathOutput.textContent = `Path error: ${error.message}`;
    }
}

function flattenForCsv(value, prefix = "", out = {}) {
    if (value === null || typeof value !== "object") {
        out[prefix || "value"] = value;
        return out;
    }

    if (Array.isArray(value)) {
        if (!value.length) {
            out[prefix || "value"] = "";
            return out;
        }

        value.forEach((item, index) => {
            const next = prefix ? `${prefix}.${index}` : String(index);
            flattenForCsv(item, next, out);
        });
        return out;
    }

    const keys = Object.keys(value);
    if (!keys.length && prefix) out[prefix] = "";

    keys.forEach((key) => {
        const next = prefix ? `${prefix}.${key}` : key;
        flattenForCsv(value[key], next, out);
    });
    return out;
}

function toCsvValue(value) {
    const text = value === null || value === undefined ? "" : String(value);
    if (text.includes('"') || text.includes(",") || text.includes("\n")) {
        return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
}

function runJsonToCsv() {
    try {
        const data = parseJsonText(dom.csvInput.value, "JSON input");
        const rows = Array.isArray(data) ? data : [data];
        const flatRows = rows.map((row) => flattenForCsv(row));
        const headers = [...new Set(flatRows.flatMap((row) => Object.keys(row)))].sort();

        const csv = [
            headers.join(","),
            ...flatRows.map((row) => headers.map((header) => toCsvValue(row[header])).join(","))
        ].join("\n");

        dom.csvOutput.value = csv;
    } catch (error) {
        dom.csvOutput.value = `CSV error: ${error.message}`;
    }
}

function checkType(data, expected) {
    if (!expected) return true;
    if (expected === "array") return Array.isArray(data);
    if (expected === "null") return data === null;
    return typeof data === expected;
}

function validateSimpleSchema(data, schema, path = "$", errors = []) {
    if (!schema || typeof schema !== "object") return errors;

    if (schema.type && !checkType(data, schema.type)) {
        errors.push(`${path}: expected ${schema.type}, got ${Array.isArray(data) ? "array" : data === null ? "null" : typeof data}`);
        return errors;
    }

    if (schema.type === "object" && schema.required && Array.isArray(schema.required)) {
        schema.required.forEach((key) => {
            if (!data || typeof data !== "object" || !(key in data)) {
                errors.push(`${path}: missing required key '${key}'`);
            }
        });
    }

    if (schema.type === "object" && schema.properties && data && typeof data === "object" && !Array.isArray(data)) {
        Object.entries(schema.properties).forEach(([key, childSchema]) => {
            if (key in data) {
                validateSimpleSchema(data[key], childSchema, `${path}.${key}`, errors);
            }
        });
    }

    if (schema.type === "array" && schema.items && Array.isArray(data)) {
        data.forEach((item, index) => {
            validateSimpleSchema(item, schema.items, `${path}[${index}]`, errors);
        });
    }

    return errors;
}

function runSchemaValidation() {
    try {
        const data = parseJsonText(dom.schemaDataInput.value, "JSON data");
        const schema = parseJsonText(dom.schemaInput.value, "Schema");
        const errors = validateSimpleSchema(data, schema);
        dom.schemaOutput.textContent = errors.length
            ? `Invalid (${errors.length})\n${errors.join("\n")}`
            : "Valid according to the provided schema rules.";
    } catch (error) {
        dom.schemaOutput.textContent = `Schema error: ${error.message}`;
    }
}

function normalizeValue(value, options) {
    if (Array.isArray(value)) {
        const normalized = value
            .map((item) => normalizeValue(item, options))
            .filter((item) => !(options.removeEmpty && isEmptyValue(item)));
        return normalized;
    }

    if (value && typeof value === "object") {
        let entries = Object.entries(value).map(([key, val]) => [key, normalizeValue(val, options)]);
        if (options.removeEmpty) {
            entries = entries.filter(([, val]) => !isEmptyValue(val));
        }
        if (options.sortKeys) {
            entries.sort((a, b) => a[0].localeCompare(b[0]));
        }
        return Object.fromEntries(entries);
    }

    return value;
}

function isEmptyValue(value) {
    if (value === null || value === "") return true;
    if (Array.isArray(value)) return value.length === 0;
    if (value && typeof value === "object") return Object.keys(value).length === 0;
    return false;
}

function runNormalize() {
    try {
        const data = parseJsonText(dom.normalizeInput.value, "JSON input");
        const normalized = normalizeValue(data, {
            sortKeys: dom.normalizeSortKeys.checked,
            removeEmpty: dom.normalizeRemoveEmpty.checked
        });
        dom.normalizeOutput.value = JSON.stringify(normalized, null, 2);
    } catch (error) {
        dom.normalizeOutput.value = `Normalize error: ${error.message}`;
    }
}

function runEscape() {
    const text = dom.escapeInput.value || "";
    dom.escapeOutput.value = JSON.stringify(text).slice(1, -1);
}

function runUnescape() {
    try {
        const raw = dom.escapeInput.value || "";
        const wrapped = `"${raw.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
        dom.escapeOutput.value = JSON.parse(wrapped);
    } catch (error) {
        dom.escapeOutput.value = `Unescape error: ${error.message}`;
    }
}

function detectDuplicateKeys(jsonText) {
    const duplicates = new Map();
    const stack = [];
    let inString = false;
    let escaped = false;

    function skipWhitespace(index) {
        let i = index;
        while (i < jsonText.length && /\s/.test(jsonText[i])) i += 1;
        return i;
    }

    function readString(startIndex) {
        let value = "";
        let i = startIndex + 1;
        let isEscaped = false;
        while (i < jsonText.length) {
            const ch = jsonText[i];
            if (isEscaped) {
                value += ch;
                isEscaped = false;
            } else if (ch === "\\") {
                isEscaped = true;
            } else if (ch === '"') {
                return { value, end: i };
            } else {
                value += ch;
            }
            i += 1;
        }
        throw new Error("Unterminated string.");
    }

    for (let i = 0; i < jsonText.length; i += 1) {
        const ch = jsonText[i];

        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            const top = stack[stack.length - 1];
            if (top && top.type === "object" && top.expectingKey) {
                const token = readString(i);
                const next = skipWhitespace(token.end + 1);
                if (jsonText[next] === ":") {
                    if (top.keys.has(token.value)) {
                        duplicates.set(token.value, (duplicates.get(token.value) || 1) + 1);
                    } else {
                        top.keys.add(token.value);
                    }
                    top.expectingKey = false;
                }
                i = token.end;
                continue;
            }
            inString = true;
            continue;
        }

        if (ch === "{") {
            stack.push({ type: "object", keys: new Set(), expectingKey: true });
        } else if (ch === "[") {
            stack.push({ type: "array" });
        } else if (ch === "}") {
            stack.pop();
        } else if (ch === "]") {
            stack.pop();
        } else if (ch === ",") {
            const top = stack[stack.length - 1];
            if (top && top.type === "object") {
                top.expectingKey = true;
            }
        }
    }

    return duplicates;
}

function runDuplicateCheck() {
    const raw = dom.dupeInput.value || "";
    try {
        parseJsonText(raw, "JSON input");
    } catch (error) {
        dom.dupeOutput.textContent = `Invalid JSON: ${error.message}`;
        return;
    }

    try {
        const duplicates = detectDuplicateKeys(raw);
        if (!duplicates.size) {
            dom.dupeOutput.textContent = "No duplicate keys found.";
            return;
        }

        const lines = ["Duplicate keys detected:"];
        duplicates.forEach((count, key) => {
            lines.push(`- ${key} (${count} occurrences)`);
        });
        dom.dupeOutput.textContent = lines.join("\n");
    } catch (error) {
        dom.dupeOutput.textContent = `Duplicate-check error: ${error.message}`;
    }
}

function searchJson(node, query, path = "$", matches = []) {
    const q = query.toLowerCase();

    if (node !== null && typeof node === "object") {
        if (Array.isArray(node)) {
            node.forEach((item, index) => {
                searchJson(item, query, `${path}[${index}]`, matches);
            });
            return matches;
        }

        Object.entries(node).forEach(([key, value]) => {
            const nextPath = `${path}.${key}`;
            if (key.toLowerCase().includes(q)) {
                matches.push(`key match: ${nextPath}`);
            }

            if (value !== null && typeof value !== "object") {
                if (String(value).toLowerCase().includes(q)) {
                    matches.push(`value match: ${nextPath} = ${JSON.stringify(value)}`);
                }
            }
            searchJson(value, query, nextPath, matches);
        });
        return matches;
    }

    if (String(node).toLowerCase().includes(q)) {
        matches.push(`value match: ${path} = ${JSON.stringify(node)}`);
    }
    return matches;
}

function runSearch() {
    try {
        const query = dom.searchQuery.value.trim();
        if (!query) {
            throw new Error("Search query is empty.");
        }

        const data = parseJsonText(dom.searchInput.value, "JSON input");
        const matches = searchJson(data, query);
        dom.searchOutput.textContent = matches.length
            ? `Found ${matches.length} matches:\n${matches.slice(0, 200).join("\n")}`
            : "No matches found.";
    } catch (error) {
        dom.searchOutput.textContent = `Search error: ${error.message}`;
    }
}

function selectUtility(button) {
    const util = button.dataset.util;
    dom.utilButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    dom.utilPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.utilPanel === util);
    });

    dom.utilHint.textContent = `Selected: ${button.textContent.trim()}`;
}

dom.parseBtn.addEventListener("click", () => updateViewerOutput("pretty"));
dom.prettyBtn.addEventListener("click", () => updateViewerOutput("pretty"));
dom.minifyBtn.addEventListener("click", () => updateViewerOutput("min"));
dom.clearBtn.addEventListener("click", clearViewer);
dom.copyBtn.addEventListener("click", copyViewerOutput);
dom.loadUrlBtn.addEventListener("click", loadFromUrl);
dom.urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        loadFromUrl();
    }
});
dom.browseBtn.addEventListener("click", () => dom.fileInput.click());
dom.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    loadFromLocalFile(file);
});
dom.expandAllBtn.addEventListener("click", () => setTreeExpandedState(true));
dom.collapseAllBtn.addEventListener("click", () => setTreeExpandedState(false));
dom.sampleBtn.addEventListener("click", () => {
    dom.inputText.value = JSON.stringify(sampleJson, null, 2);
    updateViewerOutput("pretty");
});

dom.runDiffBtn.addEventListener("click", runJsonDiff);
dom.runPathBtn.addEventListener("click", runPathTester);
dom.runCsvBtn.addEventListener("click", runJsonToCsv);
dom.runSchemaBtn.addEventListener("click", runSchemaValidation);
dom.runNormalizeBtn.addEventListener("click", runNormalize);
dom.runEscapeBtn.addEventListener("click", runEscape);
dom.runUnescapeBtn.addEventListener("click", runUnescape);
dom.runDupeBtn.addEventListener("click", runDuplicateCheck);
dom.runSearchBtn.addEventListener("click", runSearch);

dom.utilButtons.forEach((button) => {
    button.addEventListener("click", () => selectUtility(button));
});

setStatus("Ready.");
