# 🎨 Assets Directory

This directory contains images, diagrams, and other visual assets for the documentation.

## Directory Structure

```
assets/
├── README.md              # This file
├── banner.png            # Main project banner (1200x400)
├── logo.png              # Project logo (512x512)
├── screenshots/          # Application screenshots
│   ├── landing.png       # Landing page
│   ├── chat.png          # Chat interface
│   ├── contract-analysis.png
│   ├── multilingual.png
│   └── dashboard.png
├── architecture/         # Architecture diagrams
│   ├── system-overview.png
│   ├── rag-pipeline.png
│   ├── database-schema.png
│   └── security-flow.png
└── diagrams/             # Technical diagrams
    ├── api-flow.png
    ├── auth-flow.png
    └── deployment.png
```

## Image Guidelines

### Banner (banner.png)
- **Dimensions**: 1200x400 pixels
- **Format**: PNG with transparency
- **Content**: Project name, tagline, Ethiopian flag colors
- **Usage**: README header, social media

### Logo (logo.png)
- **Dimensions**: 512x512 pixels
- **Format**: PNG with transparency
- **Content**: Scales icon with Ethiopian colors
- **Usage**: Favicon, app icon, documentation

### Screenshots
- **Dimensions**: 1920x1080 pixels (or actual screen size)
- **Format**: PNG
- **Quality**: High quality, no compression artifacts
- **Content**: Clean UI, no personal data
- **Annotations**: Use red boxes/arrows for highlights

### Diagrams
- **Format**: PNG or SVG (SVG preferred)
- **Style**: Clean, professional, consistent colors
- **Tools**: draw.io, Figma, Excalidraw
- **Colors**: Use project color scheme

## Creating Assets

### Screenshots

1. **Prepare the application**
   - Use demo data (no real user information)
   - Clean browser (no extensions visible)
   - Consistent window size (1920x1080)

2. **Capture**
   - macOS: Cmd+Shift+4
   - Windows: Win+Shift+S
   - Linux: Screenshot tool

3. **Edit**
   - Crop to relevant area
   - Add annotations if needed
   - Optimize file size (use TinyPNG)

### Diagrams

**Recommended Tools:**
- [draw.io](https://app.diagrams.net/) - Free, web-based
- [Excalidraw](https://excalidraw.com/) - Hand-drawn style
- [Figma](https://www.figma.com/) - Professional design

**Color Scheme:**
```
Primary: #2563EB (Blue)
Secondary: #10B981 (Green)
Accent: #F59E0B (Amber)
Ethiopian Flag: #009639 (Green), #FEDD00 (Yellow), #EF2B2D (Red)
```

## Placeholder Images

Until actual screenshots are available, use placeholder images:

```markdown
![Landing Page](https://via.placeholder.com/1200x800/2563EB/FFFFFF?text=Landing+Page)
```

## Optimization

Before committing images:

1. **Compress images**
   - Use [TinyPNG](https://tinypng.com/)
   - Or ImageOptim (macOS)
   - Target: <500KB per image

2. **Use appropriate formats**
   - Screenshots: PNG
   - Photos: JPEG
   - Diagrams: SVG (or PNG)
   - Icons: SVG

3. **Lazy loading**
   - Large images should be lazy-loaded
   - Use thumbnails for galleries

## Contributing Assets

When adding new assets:

1. Follow naming conventions (lowercase, hyphens)
2. Add descriptive alt text in markdown
3. Update this README with new assets
4. Optimize before committing
5. Include source files if applicable (.fig, .drawio)

## License

All assets in this directory are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) unless otherwise specified.

---

**Need help creating assets?** Open an issue with the `design` label.
