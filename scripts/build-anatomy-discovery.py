"""Adapt pinned Human Atlas Enhanced discovery metadata to local model part IDs."""
import json
import sys
from pathlib import Path

upstream, output = map(Path, sys.argv[1:])
def read(path):
    return json.loads(path.read_text())

regions = read(upstream / "regions/canonical-regions-v1.json")
areas = read(upstream / "areas/canonical-areas-v1.json")
scopes = read(upstream / "areas/area-representation-scopes-v1.json")
for model, suffix, prefix in [
    ("atlas.json", "male", "bp3d-male-4"),
    ("atlas-female.json", "female", "female-study-v1"),
]:
    ids = {p["id"] for p in read(output / model)["parts"]}
    if suffix == "female":
        prefix = next(s["modelId"] for s in scopes["scopes"] if s["modelId"] != "bp3d-male-4")
    region_parts = {}
    for membership in regions["memberships"]:
        for evidence in membership["evidence"]:
            part = evidence.get("sourcePartId", {}).get("value")
            if part in ids:
                region_parts.setdefault(membership["regionId"], set()).add(part)
    area_parts = {}
    for scope in scopes["scopes"]:
        if scope["modelId"] == prefix:
            area_parts[scope["areaId"]] = {part.rsplit(":", 1)[-1] for part in scope["representationIds"]} & ids
    def groups(source, lookup):
        return [{"id": row["id"], "name": row["name"], "elements": sorted(lookup[row["id"]])}
                for row in source if lookup.get(row["id"])]
    data = {"regions": groups(regions["regions"], region_parts), "areas": groups(areas["areas"], area_parts)}
    if not data["regions"] or not data["areas"]:
        raise ValueError(f"Missing discovery mappings for {suffix}")
    (output / f"discovery-{suffix}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
