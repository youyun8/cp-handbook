"""
Align trailing // comments within consecutive lines in ```cpp code blocks.

Only topics.json and subtopics.json store handbook code snippets.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILES = [ROOT / "data" / "topics.json", ROOT / "data" / "subtopics.json"]

CPP_BLOCK_RE = re.compile(r"```cpp\n(.*?)```", re.DOTALL)
MIN_GAP = 2


def split_trailing_comment(line: str) -> tuple[str, str] | None:
    idx = line.find("//")
    if idx == -1:
        return None
    code = line[:idx].rstrip()
    if not code:
        return None
    return code, line[idx + 2 :]


def align_codeblock(code: str) -> str:
    lines = code.split("\n")
    result = list(lines)
    i = 0
    while i < len(lines):
        group: list[int] = []
        j = i
        while j < len(lines):
            line = lines[j]
            if not line.strip():
                break
            if split_trailing_comment(line) is None:
                break
            group.append(j)
            j += 1

        if len(group) >= 2:
            parsed = [split_trailing_comment(lines[k]) for k in group]
            assert all(p is not None for p in parsed)
            max_code_len = max(len(code) for code, _ in parsed)
            for k, (code_part, comment) in zip(group, parsed):
                gap = max(MIN_GAP, max_code_len - len(code_part) + MIN_GAP)
                result[k] = f"{code_part}{' ' * gap}//{comment}"

        i = j if j > i else i + 1

    return "\n".join(result)


def align_markdown(text: str) -> tuple[str, int]:
    changes = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changes
        original = match.group(1)
        aligned = align_codeblock(original)
        if aligned != original:
            changes += 1
        return f"```cpp\n{aligned}```"

    return CPP_BLOCK_RE.sub(repl, text), changes


def process_json_file(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    total = 0

    def walk(node):
        nonlocal total
        if isinstance(node, dict):
            for key, value in node.items():
                if isinstance(value, str) and "```cpp" in value:
                    new_value, changes = align_markdown(value)
                    if changes:
                        node[key] = new_value
                        total += changes
                else:
                    walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(data)
    if total:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return total


def main() -> None:
    grand_total = 0
    for path in DATA_FILES:
        count = process_json_file(path)
        print(f"{path.name}: aligned {count} code block(s)")
        grand_total += count
    print(f"done: {grand_total} code block(s) updated")


if __name__ == "__main__":
    main()
