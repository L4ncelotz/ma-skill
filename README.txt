SKILL VAULT — OFFLINE AGENT SKILLS INVENTORY
==========================================

FILES
  skill-vault.html       Standalone web app with all 75 skills and inline CSS/JavaScript.
  vercel.css             Editable source CSS; HTML already contains this stylesheet.
  template.html          Source HTML structure.
  app.js                 Source JavaScript logic.
  data-seed.json         Built catalog snapshot.
  build.py               Rebuild the standalone HTML from sources (Python 3.10+).
  skill-vault-backup.ps1 Windows PowerShell 5.1+ scanner and skills-only backup tool.
  README.txt             This file.

HOW TO USE
  1) Double-click skill-vault.html. No server, internet, libraries or npm install needed.
  2) Browse categories, select/edit Tier, use the Tier Board, add notes and edit origins.
     Switch between light/dark themes with the moon/sun icon in the top bar.
  3) Click Export JSON. Keep skill-vault.json outside this PC.
     If upgrading from the previous HTML version, export your existing data first
     and Import JSON in the new HTML. Browser storage may be file/URL-specific.
  4) On the old Windows PC, inspect the PowerShell file and run:
     powershell -NoProfile -ExecutionPolicy Bypass -File ".\skill-vault-backup.ps1"
     This creates skill-vault-scan.json and skill-vault-backup-YYYYMMDD-HHMMSS.zip
     in the same folder as the PowerShell script.
  5) In the web app's Migration tab, click Import Scan report, choose
     skill-vault-scan.json, inspect matched paths and Export JSON again.
  6) Save the HTML, JSON, ZIP and the scan report to an external drive.
  7) On the new PC, install your CLIs/agent plugins, manually restore the necessary
     skill folders to appropriate locations, then open HTML and Import JSON.
     Skills installed through plugin/marketplace managers may require reinstalling
     the corresponding packages in addition to restoring their files.

IMPORTANT LIMITATIONS
  - The 72 original names are from the user's supplied OMP inventory. Three new names were added from GitHub links. None were read from this PC.
  - Repository origins are preliminary mappings and should be verified individually.
  - Initial Tier assignments are editable suggestions, not measured skill quality.
  - The three newly added skills start as U (Unranked).
  - skill-level GitHub links are saved in Export JSON and Markdown.
  - An existing 72-skill browser inventory / JSON import is upgraded to include the 3 new skills once.
  - motion-patterns depends on ECC motion-foundations; it is not auto-installed.
  - Browser localStorage is local to the browser and may be cleared. Export JSON.
  - Export JSON includes paths, but NOT actual SKILL.md files.
  - The scanner finds SKILL.md under common global locations and the CURRENT
    project's skill directories. Run it in additional repositories if needed, or
    edit $AdditionalRoots in the script for custom directories.
  - Scanner does NOT guarantee finding every skill OMP loads (e.g. custom paths,
    registry packages, unusual installations or an already running remote agent).
  - ZIP includes only discovered skill folders; credentials, CLI settings,
    extension registrations, MCPs and API keys are NOT backed up by this tool.
  - The script excludes some common sensitive filenames and oversized files,
    but this is NOT a comprehensive secret scan. Review ZIP before sharing.
  - Running this script is not required for using the HTML application.

PROJECT
  Single-file HTML with embedded CSS and vanilla JavaScript. Fully offline.
  Minimal monochrome dashboard inspired by Vercel (not affiliated with Vercel).
  Light is the default theme; use the top bar toggle for dark theme.
  To edit styling in the source kit, modify vercel.css and run: python build.py
  (Opening skill-vault.html directly requires no Python.)
  No analytics, tracking or network requests.

REFERENCE
  OMP skill discovery: https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md
