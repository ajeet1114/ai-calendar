# ConflictFree — Smart Scheduling & Resource Allocation Engine

ConflictFree is a production-quality, responsive scheduling frontend that features natural language scheduling parsing, calendar views, availability heatmaps, conflict advisories, and live simulated socket notifications.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation
1. Clone or copy the project files to your workspace directory.
2. Navigate to the project root directory:
   ```bash
   cd "ai calendar"
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the application.

### Building for Production
To compile and build the static assets for hosting:
```bash
npm run build
```
Vite will output the bundle files in the `dist/` directory.

---

## 🛠 Tech Stack

- **Core**: React 18, Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v4 (configured via direct CSS base layer)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Confetti**: Canvas Confetti (triggers on successful scheduling results)
- **Services**: LocalStorage persistence, custom Regex-based Natural Language Processing engine, and custom Socket.io client simulation

---

## 📂 Folder Structure

```text
src/
├── components/          # Reusable components (Heatmaps, Cards, Avatars, Modals)
├── context/             # Global Context providers (Auth, Meetings, Notifications)
├── pages/               # Page templates (Login, Dashboard, Calendar, Suggestions)
├── services/            # Mock API & WebSockets emulator layer
├── utils/               # Date helpers and initial mock database seed data
├── styles/              # Global Tailwind configuration entries
├── App.jsx              # Routing configurations
└── main.jsx             # React DOM root bootstrapping
```

---

## 🧠 Key Showcase Features

1. **Natural Language Parser**:
   Type scheduling sentences like `"Meet with Bob and Charlie tomorrow at 3pm for 90 minutes in Glass Room Gamma"`. The scheduling parser automatically extracts dates, times, durations, room objects, and participant arrays to draft your meeting instantly.

2. **Team Availability Heatmap**:
   Select required participants in the creation page. The heatmap aggregates and highlights hourly team busy states on the selected day. Click any fully free slot (`Green`) to auto-fill the start hour parameter.

3. **Intelligent Conflict Resolver**:
   If a meeting draft contains room overlaps or attendee double-bookings, the system intercepts the request, maps visual diagnostic explanations of why conflicts occurred, and lists up to 4 optimal alternative times.

4. **Interactive Drag & Drop Calendar**:
   In Day/Week views, click and drag meeting cards into new slots. The engine dynamically updates records, updates local storage, and prompts a Toast alert if you drag into an overlapping conflict.

5. **Simulated Socket.io Notifications**:
   Once logged in, a background simulation triggers mock events every 45 seconds (e.g. colleagues moving meetings or rooms opening up). These events prompt live popup toasts and populate the Notification Center.

6. **Interactive Dark/Light Mode**:
   A seamless theme toggler is integrated into the Navbar and Settings panels, instantly toggling standard Tailwind dark classes.
