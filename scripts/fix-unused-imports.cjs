// Removes unused named/default imports and destructured bindings flagged by
// TS6133/TS6196, and whole unused imports flagged by TS6192.
// Usage: node scripts/fix-unused-imports.js
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

function getErrors() {
  let out = '';
  try {
    out = execSync('npx tsc -b --force', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: true });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }
  const re = /^(.+?)\((\d+),(\d+)\): error (TS6133|TS6192|TS6196)(?:: '([^']+)')?/;
  const errors = [];
  for (const line of out.split('\n')) {
    const m = line.match(re);
    if (m) errors.push({ file: m[1], line: +m[2], code: m[4], name: m[5] });
  }
  return errors;
}

function fixFile(file, entries) {
  const names = new Set(entries.filter((e) => e.name).map((e) => e.name));
  const removeLines = new Set(entries.filter((e) => e.code === 'TS6192').map((e) => e.line));
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const edits = [];

  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

  const collect = (node) => {
    if (ts.isImportDeclaration(node) && node.importClause) {
      const clause = node.importClause;
      if (removeLines.has(lineOf(node.getStart(sf)))) {
        edits.push({ start: node.getFullStart(), end: node.getEnd(), text: '' });
        return;
      }
      if (clause.name && names.has(clause.name.text)) {
        if (clause.namedBindings) {
          edits.push({ start: clause.name.getStart(sf), end: clause.namedBindings.getStart(sf), text: '' });
        } else {
          edits.push({ start: node.getFullStart(), end: node.getEnd(), text: '' });
        }
      }
      const nb = clause.namedBindings;
      if (nb && ts.isNamedImports(nb)) {
        const kept = nb.elements.filter((e) => !names.has(e.name.text));
        if (kept.length !== nb.elements.length) {
          if (!kept.length && !clause.name) {
            edits.push({ start: node.getFullStart(), end: node.getEnd(), text: '' });
          } else {
            edits.push({
              start: nb.getStart(sf),
              end: nb.getEnd(),
              text: `{ ${kept.map((e) => e.getText(sf)).join(', ')} }`,
            });
          }
        }
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name)) {
      const kept = node.name.elements.filter((e) => !names.has(e.name.text));
      if (kept.length !== node.name.elements.length) {
        if (!kept.length) {
          const stmt = node.parent.parent;
          edits.push({ start: stmt.getFullStart(), end: stmt.getEnd(), text: '' });
        } else {
          edits.push({
            start: node.name.getStart(sf),
            end: node.name.getEnd(),
            text: `{ ${kept.map((e) => e.getText(sf)).join(', ')} }`,
          });
        }
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);

  if (!edits.length) return false;
  edits.sort((a, b) => b.start - a.start);
  let out = src;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  fs.writeFileSync(file, out);
  return true;
}

for (let pass = 0; pass < 5; pass++) {
  const errors = getErrors();
  if (!errors.length) break;
  const byFile = {};
  for (const e of errors) (byFile[e.file] = byFile[e.file] || []).push(e);
  let changed = 0;
  for (const [file, entries] of Object.entries(byFile)) {
    if (fixFile(file, entries)) changed++;
  }
  console.log(`pass ${pass}: ${errors.length} errors, ${changed} files changed`);
  if (!changed) break;
}
