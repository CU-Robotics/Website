# CU Robotics Website

A modern, responsive website for the CU Robotics VEX competition team at the University of Colorado Boulder.

## Features

- **Bold CU Boulder Black & Gold Theme** - Official university colors with modern design
- **Interactive 3D Robot Viewer** - Three.js powered model viewer with orbit controls
- **JSON-Driven Content** - Easy updates without touching HTML code
- **Smooth Animations** - Scroll-triggered animations and parallax effects
- **Mobile Responsive** - Fully responsive design with mobile menu
- **Modern CSS** - CSS Grid, Flexbox, Custom Properties, and Glassmorphism effects

## Quick Start

1. Open `index.html` in a web browser
2. For local development, use a local server (required for JSON loading):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## File Structure

```
website/
├── index.html              # Homepage
├── team.html               # Team/Leaders page
├── projects.html           # Projects showcase
├── achievements.html       # Awards timeline
├── contact.html            # Contact form
├── README.md               # This file
│
├── css/
│   └── styles.css          # All styles (CSS variables, components, responsive)
│
├── js/
│   ├── main.js             # Animations, navigation, JSON loading
│   └── robot-viewer.js     # Three.js 3D viewer
│
├── data/
│   ├── achievements.json   # Competition awards (edit this!)
│   ├── leaders.json        # Team members (edit this!)
│   └── robots.json         # Robot info & 3D models (edit this!)
│
├── images/
│   ├── logo.png            # Team logo
│   ├── hero.jpg            # Homepage hero image
│   ├── [name]-[surname].png # Team member photos
│   ├── discord-icon.png    # Social icons
│   ├── instagram-icon.png
│   ├── youtube-icon.png
│   ├── robots/             # Robot photos (add here)
│   └── achievements/       # Achievement photos (add here)
│
└── models/
    └── [robot-name].glb    # 3D robot models (add here)
```

---

## Editing Content

### Team Members (`data/leaders.json`)

Add or edit team members by modifying the JSON file:

```json
{
  "leadership": [
    {
      "name": "New Person",
      "role": "Their Role",
      "photo": "images/new-person.png",
      "major": "Engineering",
      "year": "Junior",
      "bio": "Short bio here (2-3 sentences max).",
      "email": "email@colorado.edu",
      "linkedin": "https://linkedin.com/in/profile",
      "github": "https://github.com/username"
    }
  ],
  "members": [
    // Non-leadership team members go here
  ]
}
```

**Photo Requirements:**
- Square aspect ratio (400x400px minimum)
- PNG or JPG format
- Save to `images/` folder
- Use lowercase with hyphens: `first-last.png`

### Achievements (`data/achievements.json`)

Add achievements by year:

```json
{
  "achievements": [
    {
      "year": "2026",
      "items": [
        {
          "competition": "Competition Name",
          "award": "Award Won",
          "description": "Brief description of the achievement.",
          "image": "images/achievements/photo.jpg",
          "date": "2026-03-15"
        }
      ]
    }
  ]
}
```

**Tips:**
- Add new years at the TOP of the array
- Images are optional but recommended
- Date format: YYYY-MM-DD
- Keep descriptions concise (1-2 sentences)

### Robots (`data/robots.json`)

Add robot information and 3D models:

```json
{
  "robots": [
    {
      "id": "robot-name-year",
      "name": "Robot Name",
      "season": "2025-2026",
      "status": "active",
      "description": "Brief robot description.",
      "image": "images/robots/robot-photo.jpg",
      "model3d": "models/robot-name.glb",
      "specs": {
        "drivetrain": "6-Motor Mecanum",
        "intake": "Dual Roller",
        "weight": "14.8 lbs"
      },
      "features": [
        "Feature 1",
        "Feature 2"
      ]
    }
  ]
}
```

**Important:**
- Only ONE robot should have `"status": "active"` at a time
- The active robot is featured on the homepage 3D viewer

---

## Adding 3D Robot Models

### Supported Formats
- **GLB** (preferred) - Single binary file
- **GLTF** - JSON with external assets

### Creating Models

1. **Export from CAD:**
   - Fusion 360: File → Export → Select GLB
   - SolidWorks: Use third-party converter
   - Blender: File → Export → glTF 2.0 (.glb)

2. **Optimize for Web:**
   - Keep file size under 10MB
   - Reduce polygon count if needed
   - Use [gltf.report](https://gltf.report/) to check and optimize

3. **Scale:**
   - Model should be approximately 2 units tall
   - Or use real-world scale (the viewer auto-fits)

4. **Save:**
   - Place in `models/` folder
   - Use lowercase with hyphens: `robot-name-2026.glb`

5. **Update robots.json:**
   ```json
   "model3d": "models/robot-name-2026.glb"
   ```

### Troubleshooting 3D Models

- **Model not loading?** Check browser console for errors
- **Model too small/large?** The viewer auto-scales, but check your export settings
- **Textures missing?** Use GLB format (embeds textures) or ensure texture paths are correct
- **Slow loading?** Optimize with gltf.report or Blender's Decimate modifier

---

## Adding Images

### Robot Images
```
images/robots/
├── atlas-2026.jpg
├── titan-2025.jpg
└── phoenix-2024.jpg
```
- Recommended: 16:9 aspect ratio, minimum 800px wide
- Update `robots.json` with the path

### Achievement Images
```
images/achievements/
├── vex-worlds-2026.jpg
├── state-championship-2025.jpg
└── skills-award-2025.jpg
```
- Recommended: 16:9 aspect ratio, minimum 800px wide
- Update `achievements.json` with the path

### Team Photos
- Square aspect ratio (1:1)
- Minimum 400x400 pixels
- Save directly in `images/` folder
- Naming: `firstname-lastname.png`

---

## Customization

### Colors
Edit CSS variables in `css/styles.css`:

```css
:root {
  --cu-gold: #CFB87C;      /* Main accent */
  --cu-black: #000000;      /* Primary background */
  --cu-charcoal: #1C1C1C;   /* Secondary background */
  /* ... more variables */
}
```

### Fonts
The site uses Google Fonts:
- **Display:** Space Grotesk (headings)
- **Body:** Inter (paragraphs)
- **Mono:** JetBrains Mono (technical text)

Change in `<head>` of each HTML file.

### Social Links
Update in all HTML files and `data/leaders.json`:
- Discord: `https://discord.gg/curobotics`
- Instagram: `https://instagram.com/curobotics`
- YouTube: `https://youtube.com/@curobotics`

### Google Form Links
Search and replace `your-form-id` with your actual Google Form ID.

---

## Technical Details

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dependencies (loaded via CDN)
- Three.js r128 - 3D rendering
- Three.js OrbitControls - Camera controls
- Three.js GLTFLoader - Model loading
- Three.js DRACOLoader - Compressed model support

### Performance Tips
- Images are lazy-loaded when possible
- 3D models load asynchronously
- Animations use CSS transforms (GPU accelerated)
- Consider WebP format for images

---

## Deployment

### Static Hosting (Recommended)
Works with any static host:
- **GitHub Pages** - Free, automatic deploys
- **Netlify** - Free tier available
- **Vercel** - Free tier available
- **CU Boulder web hosting** - Check with IT

### GitHub Pages Setup
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select branch (usually `main`)
4. Wait for deployment

---

## Troubleshooting

### JSON not loading
- Must use a web server (not `file://` protocol)
- Check browser console for CORS errors
- Verify JSON syntax at [jsonlint.com](https://jsonlint.com/)

### 3D viewer blank
- Check if Three.js CDN is loading
- Verify model path in `robots.json`
- Check browser console for WebGL errors

### Animations not working
- Elements need `animate-on-scroll` class
- Check if JavaScript is loading
- Verify Intersection Observer support

### Mobile menu not working
- Check if `main.js` is loaded
- Verify `.mobile-menu` and `.mobile-menu-btn` exist

---

## Contributing

1. Make changes to content via JSON files
2. Test locally with a web server
3. Submit changes for review

For code changes, please discuss with the web team first.

---

## Credits

- **Design & Development:** CU Robotics Web Team
- **Theme:** CU Boulder Official Brand Colors
- **3D Library:** Three.js
- **Fonts:** Google Fonts

---

## License

This website is property of CU Robotics at the University of Colorado Boulder.

---

*Last updated: January 2026*
