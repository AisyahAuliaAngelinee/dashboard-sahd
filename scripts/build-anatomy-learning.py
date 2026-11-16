"""Package the Learn and Study Tools content from a pinned Enhanced checkout."""
import json
import sys
from pathlib import Path

source, output = map(Path, sys.argv[1:])
source = source / "data/learn"
output.mkdir(parents=True, exist_ok=True)

def read(name):
    return json.loads((source / name).read_text())

for subject in ("digestive", "respiratory", "lymphoid"):
    base = subject + "-study-tools/"
    data = {
        "articles": [read(f"{subject}-system-{name}.json") for name in
                     ("general-overview", "deep-dive", "how-it-connects", "exam-cram")],
        "quiz": read(base + "multiple-choice.json")["questions"],
        "fill": read(base + "fill-in-the-blank.json")["questions"],
        "flashcards": read(base + "flashcards.json")["cards"],
        "glossary": read(base + "concepts.json")["concepts"],
    }
    (output / f"{subject}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
