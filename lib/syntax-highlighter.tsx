export function highlightPythonCode(code: string): string {
  // Python keywords
  const keywords = [
    "def",
    "class",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "break",
    "continue",
    "return",
    "import",
    "from",
    "as",
    "try",
    "except",
    "finally",
    "with",
    "lambda",
    "yield",
    "pass",
    "raise",
    "assert",
    "del",
    "global",
    "nonlocal",
    "True",
    "False",
    "None",
    "and",
    "or",
    "not",
    "in",
    "is",
  ]

  const builtins = [
    "print",
    "len",
    "range",
    "str",
    "int",
    "float",
    "list",
    "dict",
    "set",
    "tuple",
    "bool",
    "type",
    "isinstance",
    "sum",
    "max",
    "min",
    "sorted",
    "enumerate",
    "zip",
    "map",
    "filter",
    "abs",
    "round",
    "pow",
    "input",
  ]

  let html = code
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Comments
  html = html.replace(/^(\s*#.*)$/gm, '<span class="syntax-comment">$1</span>')

  // Strings (double quotes)
  html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="syntax-string">$&</span>')

  // Strings (single quotes)
  html = html.replace(/'([^'\\]|\\.)*'/g, '<span class="syntax-string">$&</span>')

  // Numbers
  html = html.replace(/\b(\d+\.?\d*|\.\d+)\b/g, '<span class="syntax-number">$1</span>')

  // Keywords
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "g")
    html = html.replace(regex, `<span class="syntax-keyword">${keyword}</span>`)
  })

  // Built-in functions
  builtins.forEach((builtin) => {
    const regex = new RegExp(`\\b${builtin}\\b`, "g")
    html = html.replace(regex, `<span class="syntax-builtin">${builtin}</span>`)
  })

  // Function definitions
  html = html.replace(/def\s+(\w+)/g, 'def <span class="syntax-function">$1</span>')

  // Class definitions
  html = html.replace(/class\s+(\w+)/g, 'class <span class="syntax-class">$1</span>')

  return html
}

export function highlightJavaScriptCode(code: string): string {
  const keywords = [
    "function",
    "const",
    "let",
    "var",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "this",
    "class",
    "extends",
    "import",
    "export",
    "default",
    "async",
    "await",
    "yield",
    "true",
    "false",
    "null",
    "undefined",
  ]

  const builtins = [
    "console",
    "log",
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
    "Math",
    "Date",
    "JSON",
    "Promise",
    "setTimeout",
    "setInterval",
  ]

  let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Comments (single line)
  html = html.replace(/\/\/.*$/gm, '<span class="syntax-comment">$&</span>')

  // Comments (multi-line)
  html = html.replace(/\/\*[\s\S]*?\*\//g, '<span class="syntax-comment">$&</span>')

  // Strings
  html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="syntax-string">$&</span>')
  html = html.replace(/'([^'\\]|\\.)*'/g, '<span class="syntax-string">$&</span>')
  html = html.replace(/`([^`\\]|\\.)*`/g, '<span class="syntax-string">$&</span>')

  // Numbers
  html = html.replace(/\b(\d+\.?\d*|\.\d+)\b/g, '<span class="syntax-number">$1</span>')

  // Keywords
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "g")
    html = html.replace(regex, `<span class="syntax-keyword">${keyword}</span>`)
  })

  // Built-ins
  builtins.forEach((builtin) => {
    const regex = new RegExp(`\\b${builtin}\\b`, "g")
    html = html.replace(regex, `<span class="syntax-builtin">${builtin}</span>`)
  })

  return html
}

export function highlightCode(code: string, language: string): string {
  switch (language) {
    case "python":
      return highlightPythonCode(code)
    case "javascript":
      return highlightJavaScriptCode(code)
    default:
      return code
  }
}
