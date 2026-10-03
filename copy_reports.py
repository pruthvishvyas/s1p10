"""
copy_reports.py  -  run after python main.py and before npm run dev / deploy

  python copy_reports.py

Copies every report image the pipeline wrote under reports/ into
react_frontend/public/reports/ (where the dashboard looks for them) and writes
public/reports/manifest.json listing what was copied.
"""
import os, sys, json, shutil

SRC = 'reports'
DST = 'react_frontend/public/reports'
EXTS = ('.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.html')
SKIP_DIRS = {'frontend'}          # JSON data lives there, not report images

if not os.path.isdir(SRC):
    print(f'ERROR: {SRC}/ not found. Run this from your project root after python main.py.')
    sys.exit(1)

os.makedirs(DST, exist_ok=True)
copied, seen = [], {}

for root, dirs, files in os.walk(SRC):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for name in sorted(files):
        if not name.lower().endswith(EXTS):
            continue
        if name in seen:
            print(f'  WARNING: duplicate filename {name} in {root} (already copied from {seen[name]}) - skipped')
            continue
        seen[name] = root
        shutil.copy2(os.path.join(root, name), os.path.join(DST, name))
        copied.append(name)

with open(os.path.join(DST, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(sorted(copied), f, indent=2)

print(f'Copied {len(copied)} files to {DST}/')
for n in sorted(copied):
    print('  -', n)
if len(copied) != 15:
    print(f'\nNOTE: expected 15 reports, found {len(copied)}. '
          'If some are missing, check the pipeline wrote them under reports/ with an image extension.')
print('\nReload: cd react_frontend && npm run dev   (restart if it was already running)')