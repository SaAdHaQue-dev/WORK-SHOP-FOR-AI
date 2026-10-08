# SAE ZHCET Racing | Formula Student Hyper-Telemetry Hub

Official single-page website of **SAE ZHCET Racing**, the Formula Student collegiate motorsport team of the **Zakir Husain College of Engineering & Technology (ZHCET), Aligarh Muslim University (AMU)**.

The site is a racing-themed, F1-inspired showcase with a 3D interactive CAD exploded view, a live cockpit HUD, a telemetry analyzer, and a mentorship application form.

---

## Features

- **Cyberpunk preloader** with progress ring and loading bar.
- **Real F1 car hero section** with interactive hotspot pins (front wing, halo, brakes, engine, rear wing).
- **Live Cockpit HUD**: gear, speed, RPM bar, ERS and DRS status, updating in real time.
- **Steering-wheel shift lights** in the header that react to simulated RPM.
- **Engine ignition and roar audio**, synthesized with the Web Audio API (no audio files needed).
- **3D CAD exploded assembly** (Three.js):
  - Procedurally built car: front wing, halo, monocoque, sidepods, V6 engine, rear wing, floor and wheels with brakes and wishbones.
  - Scroll-driven disassembly plus a manual "Explosion Level" slider.
  - 360° auto-orbit, wireframe mode, and camera presets (ISO, Top Aero, Side Chassis, Powertrain, Rear DRS).
  - Floating annotation pins projected from 3D to 2D, laser alignment lines, and a component inspector panel.
  - Toggle between the 3D WebGL view and a 2D blueprint image.
- **CAN-Bus Telemetry Analyzer**: canvas chart of speed vs throttle with Qualifying, Race Pace and Wet Circuit modes.
- **Ambient aero-arrow canvas** (streamlines and chevrons) across the whole page, reacting to the mouse.
- **Chief Designer dossier, gallery, and team crew** sections.
- **Mentorship application form** (name, email, phone, branch/year, domain, motivation) with a success banner.
- Fully responsive layout.

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Markup / Styling | HTML5, CSS3 (custom properties, grid, flexbox, backdrop-filter) |
| Scripting | Vanilla JavaScript (ES6) |
| 3D Engine | [Three.js r128](https://threejs.org/) + OrbitControls (via CDN) |
| Audio | Web Audio API |
| Charts / Effects | HTML5 Canvas 2D |
| Fonts | Google Fonts: Orbitron, Rajdhani, Oswald, Montserrat |

No build step, no framework, no npm install. It is one self-contained HTML file plus an `assets/` folder.

---

## Project Structure

```
.
├── index.html                  # The entire website (HTML + CSS + JS)
├── README.md
└── assets/
    ├── real_f1_car.jpg         # Hero background image
    ├── f1_exploded_assembly.jpg# 2D blueprint view
    ├── amu_logo_theme.png      # AMU emblem (footer)
    ├── media_1787525110747.jpg # Legacy hero background
    ├── media_1787526331668.jpg # Innovation Hub (ID passes)
    ├── media_1787525969536.jpg # Chief Designer photo
    ├── media_1787524660533.jpg # Gallery: wiring
    └── media_1787526074539.jpg # Team photo
```

> Make sure all images listed above exist inside `assets/`, otherwise those sections will show broken images.

---

## Getting Started

### Option 1: Open directly
Double-click `index.html` in a modern browser (Chrome, Edge, Firefox).

### Option 2: Run a local server (recommended)
```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```
Then open `http://localhost:8000`.

An **internet connection is required** for the Google Fonts and Three.js CDN scripts.

---

## Usage Guide

- **Scroll** through the exploded-assembly section to automatically disassemble the car.
- **Drag** the 3D canvas to rotate, **scroll/pinch** to zoom.
- Use the **Explosion Level** slider, **Disassemble All**, **360° Orbit**, **Blueprint Wireframe** and **Reset View** buttons for manual control.
- Click a **hotspot pin** on the hero car or a **3D annotation pin** to focus the camera and open the component inspector.
- Press **PLAY ENGINE ROAR** to hear the synthesized ignition and rev sequence (browsers require a user click before audio can play).
- Switch the telemetry chart between **Qualifying / Race Pace / Wet Circuit**.

---

## Customization

- **Colors**: edit the CSS variables in `:root` (`--f1-red`, `--cyan-telemetry`, `--green-ers`, etc.).
- **Team members and stats**: update the Crew bar, hero stat pills, ticker items, and `componentSpecs` object in the script.
- **Images**: replace files in `assets/` while keeping the same filenames, or update the `src` / `url()` paths.
- **Form backend**: the mentorship form currently only logs to the console (`submitMentorshipForm`). Connect it to Google Forms, Formspree, EmailJS or your own API to actually receive applications.

---

## Notes

- Telemetry values (speed, RPM, G-force, etc.) are **simulated for display**, not live sensor data.
- Some gallery cards use placeholders; add real photos for them in `assets/`.
- The 3D car is procedurally generated from Three.js primitives, so no `.glb` model is needed.
- Performance: pixel ratio is capped at 2 and the aero-arrow count is reduced on mobile.

---

## Credits

- **Created by:** MD Saad Haque
- **Team Lead & Chief Designer:** Yasir Ali
- **Organization:** SAE ZHCET Collegiate Club, Zakir Husain College of Engineering & Technology, Aligarh Muslim University (AMU)

&copy; 2026 SAE ZHCET Racing. Engineered for performance.
