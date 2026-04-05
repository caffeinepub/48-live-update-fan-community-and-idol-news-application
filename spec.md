# 48 LIVE UPDATE - UI Overhaul v25

## Current State
- Color scheme: soft pink/lavender (OKLCH variables)
- Dark mode: dark purple/lavender background
- Light mode: pinkish-white background
- Search works but has issues (actor timing, query debounce)
- GroupDetailPage has 5 tabs: Member, Jadwal, Berita, Diskografi, Setlist
- No official website link per group

## Requested Changes (Diff)

### Add
- New tab "Website Resmi" in GroupDetailPage with link to each group's official website
- Official website URLs for: AKB48, SKE48, NMB48, HKT48, NGT48, STU48, JKT48, BNK48, MNL48, CGM48, KLP48, TSH48, TPE48
- "No website available" placeholder for groups without known official sites

### Modify
- index.css: Change color palette to black/red/white/blue theme
  - Dark mode: background = pure black (#000000), text = white
  - Light mode: background = pure white (#ffffff), text = dark/black
  - Primary accent color = red (for buttons, highlights, gradients)
  - Secondary accent = blue
  - Border/card colors updated accordingly
- Header: Search fix - ensure search shows results for all content types including members; fix timing/debounce
- GroupDetailPage: Add 6th tab "Website Resmi" showing official website card with external link button

### Remove
- Pink/lavender color references

## Implementation Plan
1. Update index.css OKLCH variables for black/red/white/blue palette
2. Fix search in Header - add proper debounce (300ms), fix enabled condition
3. Add officialWebsites map in GroupDetailPage with group name -> URL mapping
4. Add new TabsTrigger + TabsContent for "Website Resmi" in GroupDetailPage
5. Update TabsList grid-cols from 5 to 6
