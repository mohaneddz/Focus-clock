Got it ✅ — here’s your **Focus Clock README rewritten in the same style/structure as your Waldo Finder project**:

---

<h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #E63946; display: flex; align-items: center; border-bottom: 3px solid #E63946; padding-bottom: 5px;">
    <img src="screenshots/Icon.png" alt="Focus Clock Icon" style="width: 50px; height: 50px; margin-right: 15px;">
    Focus Clock ⏳
</h1>

Focus Clock is a modern, cross-platform productivity timer app that helps you stay focused with customizable timers and Pomodoro sessions. Built with **Tauri**, **SolidJS**, and **TypeScript** for speed, simplicity, and local performance.

This app was built in just 2 hours and designed specifically for display on a second monitor to keep you focused without cluttering your main screen.

---

## Tech Used 🧑‍💻

![Tauri](https://img.shields.io/badge/Tauri-24C8B1?style=for-the-badge\&logo=tauri\&logoColor=white)
![SolidJS](https://img.shields.io/badge/SolidJS-2D8CFF?style=for-the-badge\&logo=solid\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge\&logo=rust\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)

---

## Core Features ⚡

* 🍅 **Pomodoro Timer:**
  Classic Pomodoro technique with customizable work/break intervals.

* ⏲️ **Custom Timers:**
  Create and manage multiple timers for different tasks.

* 🎨 **Modern UI:**
  Clean, responsive interface powered by SolidJS + TailwindCSS.

* 💻 **Cross-Platform:**
  Works on Windows, macOS, and Linux with Tauri backend.

* 💾 **Persistent Settings:**
  Your preferences and timer configurations are saved locally.

---

## Screenshots 📸

<br>
<img src="screenshots/home.png" alt="Home Screen" width="70%"/>

**Home:** Overview of your timers and recent activity.

<br>
<img src="screenshots/menu.png" alt="Navigation Menu" width="70%"/>

**Navigation Menu:** Quick minimal navigation menu without distractions.

<br>
<img src="screenshots/pomodoro.png" alt="Pomodoro Screen" width="70%"/>

**Pomodoro:** Start sessions with configurable intervals.

<br>
<img src="screenshots/timers.png" alt="Timer Gallery" width="70%"/>

**Timer Gallery:** Manage your custom timers.

<br>
<img src="screenshots/pomodoro settings.png" alt="Settings Screen" width="70%"/>

**Pomodoro Settings:** Here you can save your pomodoro preferences.

<br>
<img src="screenshots/about.png" alt="Settings Screen" width="70%"/>

**About:** About page that describes the project.

---

## Project Structure 📂

```plaintext
src/
├── components/       # Reusable UI components
├── routes/           # Pages and routing
├── hooks/            # Custom hooks for timer logic
├── config/           # App configuration
├── types/            # TypeScript types
└── style/            # TailwindCSS styles

src-tauri/            # Tauri backend (Rust)
├── src/              # Rust source code
└── tauri.conf.json   # Tauri config
```

---

## Setup and Development 🛠️

1. **Prerequisites:**

   * Node.js (v16+)
   * pnpm
   * Rust (latest stable)

2. **Clone and install dependencies:**

   ```sh
   git clone <repository-url>
   cd focus-clock
   pnpm install
   ```

3. **Run in development mode:**

   ```sh
   pnpm start
   ```

4. **Build for production:**

   ```sh
   pnpm build
   pnpm tauri build
   ```

   The app will be available in `src-tauri/target/release/`.

---

## Recommended IDE Setup 💻

* [VS Code](https://code.visualstudio.com/)
* [Tauri for VS Code](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
* [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

## Contributing 👥

Contributions are welcome!
If you want to fix bugs, add features, or improve the codebase:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/MyFeature`)
3. Make your changes and test
4. Push and open a Pull Request

---

## Roadmap 🗺️

### Phase 1: Core Functionality

* [x] Pomodoro timer with intervals
* [x] Custom timers
* [x] Persistent settings

### Phase 2: Enhanced Features

* [ ] Stats and reports
* [ ] Advanced theming
* [ ] Cloud sync

---

## License ⚖️

MIT License – see `LICENSE` file for details.

---

## Contact 📬

* GitHub: [mohaneddz](https://github.com/mohaneddz)
* Email: [mohaned.manaa.dev@gmail.com](mailto:mohaned.manaa.dev@gmail.com)

---

Do you want me to also add **fancy shields for features (like Pomodoro, timers, cross-platform)** to make it match the “flashy” vibe of your old readme?
