/**
 * Validates a JSON string and extracts line/column if syntax error occurs
 */
export function validateJson(str: string): {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
} {
  if (!str.trim()) return { isValid: true };
  try {
    JSON.parse(str);
    return { isValid: true };
  } catch (err: any) {
    const message = err.message || "Invalid JSON";
    // Try to extract line and column from error message
    // e.g. "Unexpected token } in JSON at position 42" or "at line 2 column 5"
    let line: number | undefined;
    let column: number | undefined;

    const lineColMatch = message.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      const posMatch = message.match(/position (\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const upToPos = str.slice(0, pos);
        const lines = upToPos.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    return {
      isValid: false,
      error: message,
      line,
      column,
    };
  }
}

/**
 * Prettifies a JSON string
 */
export function formatJson(str: string, indent = 2): string {
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, indent);
  } catch {
    return str;
  }
}

/**
 * Minifies a JSON string
 */
export function minifyJson(str: string): string {
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    return str;
  }
}

/**
 * Evaluates a dot-notation or JSONPath-style query against a JSON object
 * Supports:
 * - `$.posts[0].title`
 * - `products.0.price`
 * - `items[*].id` or `items.id`
 * - `data['key']`
 */
export function evaluateJsonPath(data: any, query: string): { result: any; error?: string } {
  if (data === null || data === undefined) {
    return { result: null };
  }

  let cleanQuery = query.trim();
  if (!cleanQuery) return { result: data };

  // Remove leading $. or $
  if (cleanQuery.startsWith("$.")) {
    cleanQuery = cleanQuery.slice(2);
  } else if (cleanQuery.startsWith("$")) {
    cleanQuery = cleanQuery.slice(1);
  }

  if (!cleanQuery) return { result: data };

  // Normalize bracket notation: e.g. [0] -> .0, ['key'] -> .key, ["key"] -> .key
  const normalized = cleanQuery
    .replace(/\[\s*['"]?([^'"]+?)['"]?\s*\]/g, ".$1")
    .replace(/^\./, "");

  const parts = normalized.split(".").filter(Boolean);

  try {
    let current: any = data;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (current === null || current === undefined) {
        return { result: undefined };
      }

      // Handle wildcard [*] or *
      if (part === "*") {
        if (Array.isArray(current)) {
          const remainingParts = parts.slice(i + 1);
          if (remainingParts.length === 0) {
            return { result: current };
          }
          const subQuery = remainingParts.join(".");
          const mapped = current.map((item) => evaluateJsonPath(item, subQuery).result);
          return { result: mapped };
        }
        return { result: undefined };
      }

      if (typeof current === "object") {
        current = current[part];
      } else {
        return { result: undefined };
      }
    }

    return { result: current };
  } catch (err: any) {
    return { result: null, error: err.message };
  }
}

/**
 * Counts matches for a search term inside keys and values
 */
export function countMatches(data: any, searchTerm: string): number {
  if (!searchTerm.trim() || data === null || data === undefined) return 0;
  const term = searchTerm.toLowerCase();
  let count = 0;

  function traverse(item: any) {
    if (item === null || item === undefined) return;

    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
      if (String(item).toLowerCase().includes(term)) {
        count++;
      }
      return;
    }

    if (Array.isArray(item)) {
      for (const el of item) {
        traverse(el);
      }
      return;
    }

    if (typeof item === "object") {
      for (const [key, val] of Object.entries(item)) {
        if (key.toLowerCase().includes(term)) {
          count++;
        }
        traverse(val);
      }
    }
  }

  traverse(data);
  return count;
}

/**
 * Copies text to user's clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch {
    return false;
  }
}

/**
 * Triggers a browser download of a JSON object
 */
export function downloadJsonFile(data: any, filename = "response.json") {
  const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats byte size into human readable string (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
