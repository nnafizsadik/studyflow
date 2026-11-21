# StudyFlow — Student Task & Study Planner

A minimal, responsive dashboard for organizing assignments, tasks, study sessions, deadlines, and academic progress.

**Designed & developed by [Nafiz Sadik](https://nafizsadik.me).**

[Open the hosted website](https://rayhan-studyflow-demo.proud-fern-8742.chatgpt.site) · [Developer website](https://nafizsadik.me)

The hosted website currently has private access. You can run the downloaded code locally without a hosted account.

## Technologies used

The website uses **HTML, CSS, and vanilla JavaScript only**.

| Technology | Purpose |
| --- | --- |
| HTML5 | Page structure, forms, navigation, native dialogs, and accessible labels |
| CSS3 | Layouts, cards, typography, colors, transitions, responsive breakpoints, and dark mode |
| JavaScript | Navigation, task management, session scheduling, calendar rendering, timers, analytics, preferences, and backups |
| CSS Grid and Flexbox | Responsive dashboard, calendar, forms, and navigation layouts |
| CSS custom properties | Shared theme colors, surfaces, borders, and reusable styling |
| Inline SVG | Interface icons and decorative sparklines embedded in the source |
| Browser DOM and events | Interactive controls, forms, keyboard shortcuts, and screen updates |
| `localStorage` | Browser-local workspace and timer persistence |
| Native `<dialog>` | Task/session editors and confirmation dialogs |
| `Date` and locale formatting | Calendar calculations, deadlines, and readable dates/times |
| `FormData` | Reading submitted form values |
| `Blob`, object URLs, and file input | Downloading JSON backups and importing saved workspaces |
| `crypto.randomUUID()` | Unique record IDs, with a fallback when unavailable |
| Browser timers and visibility events | Focus countdowns and updates after returning to the page |

There are no frameworks, third-party JavaScript libraries, package installations, external fonts, external image dependencies, API keys, databases, or build steps required to run the app. Icons and charts are rendered from the included HTML, CSS, JavaScript, and inline SVG.

## Features

- **Overview dashboard:** completed tasks, study time, tasks due today, completion rate, upcoming work, and study sessions.
- **Task management:** create, edit, delete, complete, and reopen tasks; add subjects, notes, deadlines, and priorities.
- **Search and filtering:** search task titles, subjects, and notes; filter by subject, status, or priority; sort by date, priority, or title.
- **Assignments:** track assignments and mark them submitted using the completion checkbox.
- **Monthly calendar:** browse months, return to today, select a date, and view its tasks and study sessions.
- **Study planner:** schedule sessions with subjects, dates, times, durations, and notes; reject overlapping unfinished sessions and sessions crossing midnight.
- **Focus timer:** start, pause, and reset a focus or break timer. Running timers use the clock so they can resume correctly after a reload.
- **Analytics:** view activity over 7 or 14 days, subject completion, overall progress, and weekly study totals.
- **Weekly goals:** set a target number of study hours.
- **Preferences:** edit the profile name and course, select light or dark appearance, adjust timer durations, and enable compact task spacing.
- **Deadline reminders:** see overdue tasks and deadlines within the next two days inside the app.
- **Backup and restore:** export workspace data as JSON and restore a validated StudyFlow backup.
- **Fresh start:** clear workspace records from Settings while keeping profile preferences.
- **Responsive and accessible interface:** mobile navigation, keyboard shortcuts, labeled controls, keyboard focus indicators, reduced-motion support, and dialogs.

## Files included

The repository contains:

```text
studyflow/
├── index.html     # Page structure and forms
├── styles.css     # Complete visual design and responsive styles
├── app.js         # All app logic and browser storage
├── README.md      # This guide
└── LICENSE        # MIT license
```

The website files are at the repository root. No build output, hosting configuration, or installation step is required to run this copy.

## Download and run on your local PC

### 1. Download and extract

1. On [this GitHub repository](https://github.com/nnafizsadik/studyflow), choose **Code → Download ZIP**, or [download the main branch directly](https://github.com/nnafizsadik/studyflow/archive/refs/heads/main.zip).
2. Extract the ZIP. On Windows, right-click it and choose **Extract All**. On macOS, double-click it.
3. Open the extracted `studyflow-main` folder containing `index.html`, `styles.css`, and `app.js`. Keep all three files together.

If you already use Git, you can download the project by cloning it instead:

```bash
git clone https://github.com/nnafizsadik/studyflow.git
cd studyflow
```

### 2. Open directly — no installation required

Double-click **index.html**, or right-click it and choose **Open with** your browser.

Use a current browser that supports native HTML dialogs, such as Chrome, Edge, Firefox, or Safari. The app runs locally, and you do not need Node.js, npm, Python, a database, or an API key for this method.

Browsers can restrict persistent storage for pages opened with a `file://` address. If changes do not survive closing or reloading the page, use the optional local-server method below.

### 3. Optional: run through a local server

This gives the app a consistent local web address for browser storage. **Python is only an optional way to serve the files; the website itself still uses only HTML, CSS, and JavaScript.**

If Python is already installed:

1. Open a terminal in the extracted or cloned folder containing `index.html`.
2. Run the command for your operating system.

**Windows — PowerShell or Command Prompt:**

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

**macOS or Linux — Terminal:**

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

3. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
4. Leave the terminal open while using the app. Press **Ctrl+C** to stop the server.

If the Python command is unavailable, use the direct-open method or an existing static web server. If port 8000 is in use, choose another port, such as 8001, and open that port in your browser. A different port uses a separate browser-storage location.

## Getting started

1. Open **Settings** and edit your name, course, weekly study goal, and timer preferences. The default profile name is **Nafiz Sadik**.
2. Explore the sample workspace. When ready, export a backup if needed, then use **Clear workspace** in Settings to start with your own tasks.
3. Select **New task**, enter the details, and save it. Choose **Assignment** as the type when tracking a submission.
4. Open **Study planner** and choose **Plan session** to reserve study time.
5. Complete tasks and sessions as you finish them, and review **Analytics** to see your progress.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus task search |
| `N` | Create a new task when not typing in a field |
| `Esc` | Close an open dialog, reminders, or mobile navigation |

## Data storage and backups

- Workspace data is stored in this browser on this device under `studyflow.workspace.v1`.
- Tasks, sessions, preferences, focus history, and timer state are saved locally. There is no cloud synchronization or remote application database.
- The profile is a local workspace profile, not an online login account.
- Clearing site data, changing browsers, using another device, or changing the local site address can make your saved workspace unavailable.
- Browser storage is not encrypted by the app. Avoid using the notes fields for passwords or other secrets.
- To keep a copy, open **Settings → Export backup**. To restore it, choose **Settings → Import**, select the JSON file, and confirm the replacement.
- Importing a backup replaces the current workspace and resets the timer. Export the current workspace first if you need to keep it.
- If browser storage is unavailable or full, the app displays a warning. Export a backup before leaving the page.

## How study time and progress work

- Completing a task updates task statistics. Completing an assignment marks it submitted.
- Planned study time counts when a session is marked **Done**, using its scheduled date.
- Focus time counts only after a complete focus countdown finishes. Paused or reset countdowns do not add study time.
- A completed focus countdown is recorded once and switches to break mode. Break time does not count as study time.
- Use either a planned-session completion or a focus timer for the same study block to avoid counting that block twice.
- Weekly goals use a Monday–Sunday calendar week. Dates and times follow the device’s local time zone.
- Reminders appear inside StudyFlow while it is open. They do not send emails, push notifications, or background alerts.
- The initial sample records are included in demo analytics until you clear the workspace.

## Customization

- Edit **index.html** to change static text, the page title, footer credit, or form structure.
- Edit **styles.css** to change colors, spacing, typography, breakpoints, and theme styling. Shared colors are defined with CSS custom properties near the start of the file.
- Edit **app.js** to change sample records, subjects, defaults, and app behavior.
- Saved preferences take precedence over initial defaults. Use Settings to change an existing workspace profile.
- Save your edits and refresh the browser. No compilation or build command is required.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| The page has no styling or buttons do not work | Extract the ZIP fully and keep `index.html`, `styles.css`, and `app.js` together. Open the extracted HTML file, not a preview inside the ZIP. |
| The server shows a folder listing | Start it in the extracted or cloned folder containing `index.html`. |
| Changes disappear after reopening | Avoid private browsing, check browser storage permissions, and try the local-server method. |
| A backup cannot be imported | Choose a valid StudyFlow JSON export smaller than 5 MB. Invalid files leave the existing workspace unchanged. |
| A session will not save | Check its title, date, start time, and duration. Move it away from overlapping unfinished sessions and keep it within one day. |
| There are no search results | Clear the search text and reset subject, status, and priority filters. |
| The hosted site asks for access | Use an authorized account for the private hosted version, or run the downloaded copy locally. |

## Verification performed

The initial implementation passed **21 automated logic checks** covering backup validation, invalid dates and leap days, safe text rendering, weekly totals, timer behavior, scheduling conflicts, and task editing.

Browser checks covered task creation, editing, completion, deletion, search and filters, reload persistence, assignment listing, calendar navigation, session planning and completion, overlap rejection, timer pause/reload/reset, analytics periods, appearance settings, reminders, and backup export/restore.

Responsive layouts were checked at **320 px, 390 px, 768 px, and 1440 px** widths. These checks describe the implementation review, not a guarantee for every browser or device.

## Credits

**Design & development: [Nafiz Sadik](https://nafizsadik.me)**

Website: [nafizsadik.me](https://nafizsadik.me)

## License

This project is available under the [MIT License](LICENSE). Copyright © 2026 Nafiz Sadik.
