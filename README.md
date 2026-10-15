# JCE Department Inspection App
**Jain College of Engineering, Belagavi**  
*Department Cleanliness, Tidiness & Maintenance Quality Audit System*

An official, mobile-friendly institutional inspection and auditing web application featuring 37 institutional parameters across 7 categories, real-time VTU/JCE scoring, performance bands, corrective action plan generation with overdue tracking, canvas signature capture for HODs and the Principal, and official A4 printable reports.

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name to `jce-inspection-app` (or any name you prefer).
3. Choose **Public** (or Private with GitHub Pro).
4. Do **not** initialize with a README (this project already has one).
5. Click **Create repository**.

---

### Step 2: Push This Code to Your GitHub Repository
Open your terminal in this project directory and run:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "Initial commit of JCE Inspection App"

# 4. Rename main branch
git branch -M main

# 5. Link your GitHub repository (replace USERNAME and REPO with yours)
git remote add origin https://github.com/USERNAME/jce-inspection-app.git

# 6. Push to GitHub
git push -u origin main
```

---

### Step 3: Enable GitHub Pages (1-Click)
1. On GitHub, navigate to your repository's **Settings** tab.
2. In the left sidebar, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment** > **Source**, change from *Deploy from a branch* to **GitHub Actions**.
4. That's it! The included `.github/workflows/deploy.yml` workflow will automatically trigger, build the app, and deploy it.
5. Within 1–2 minutes, your live site URL will be displayed at the top of the Pages tab (e.g., `https://USERNAME.github.io/jce-inspection-app/`).

---

## ⚡ Alternative Hosting Options via GitHub

### Option A: Netlify (Free & Instant)
1. Push this repository to GitHub as shown in Step 2.
2. Go to [netlify.com](https://www.netlify.com) and log in with GitHub.
3. Click **Add new site** > **Import an existing project** > **GitHub**.
4. Select your `jce-inspection-app` repository.
5. Set Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy Site**.

### Option B: Vercel (Free & Instant)
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New Project** and import your repository.
3. Framework Preset: **Vite** (auto-detected).
4. Click **Deploy**.

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 📋 Features Included
- **37 Institutional Parameters** across Categories A through G.
- **Official Scoring Formula**: $A / B \times 100\%$ with institutional rating bands (Excellent, Very Good, Satisfactory, Needs Improvement, Unsatisfactory).
- **Safety-Critical Flags** for items #8, #18, #21, #22, and #23.
- **Interactive Digital Signature Pads** for Inspecting HOD, Inspected Department HOD, and Principal.
- **Corrective Action Plan** with auto-generation from low-rated items (1 or 2) and overdue status calculation.
- **Theme Palette Switcher** with 6 institutional themes (Navy & Gold, Royal Blue, Campus Emerald, Crimson, Indigo, Midnight Slate).
- **History & Benchmark Analytics** with trend progression ($\pm \Delta$).
- **Data Export & Portability**: Export to CSV (with all P1–P37 scores), Export JSON, and Import JSON backup.
- **Print / PDF Report**: Formatted to official A4 paper dimensions with zero UI chrome for institutional archiving.
