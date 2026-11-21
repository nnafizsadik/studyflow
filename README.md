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
- **Data recovery:** if saved data cannot be read, download its original contents from Settings. The app preserves that copy before saving a replacement workspace.
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
├── test/
│   └── app.test.js # Automated regression checks (optional for contributors)
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
- If that saved workspace is unreadable, its original contents are preserved under `studyflow.workspace.v1.recovery` before replacement. Settings offers **Download original data**; this recovery file may need correction before it can be imported.
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

## Running the regression checks

For contributors with Node.js installed, open a terminal in the repository folder and run:

```bash
node --test test/app.test.js
```

No packages or dependencies need to be installed. All **34 regression checks** pass, covering timer completion at button-click boundaries, settings preservation, invalid backup rejection, unreadable-data recovery, deleted-item protection, session scheduling, and deadline refresh across date changes.

These checks run app logic in an isolated browser substitute. They complement the separate browser checks for mobile deadline visibility, keyboard focus, cross-tab interactions, and unsaved profile changes. Node.js is only needed to run these contributor checks; opening the website still requires only a browser.

## Credits

**Design & development: [Nafiz Sadik](https://nafizsadik.me)**

Website: [nafizsadik.me](https://nafizsadik.me)

## License

This project is available under the [MIT License](LICENSE). Copyright © 2026 Nafiz Sadik.

## New to coding? Run StudyFlow step by step

You do not need to know how to code to try this project. Think of StudyFlow as a small website stored in a folder on your computer. Download the folder, unpack it, and open its main page in a browser.

**You only need a computer and a web browser.** You do not need to install Git, Node.js, Python, or a code editor for this first method. The earlier setup sections also include Git and local-server instructions for people who prefer those options.

### Step 1: Download the whole project

1. Open [the StudyFlow GitHub page](https://github.com/nnafizsadik/studyflow).
2. Near the top of the file list, click the green **Code** button.
3. Click **Download ZIP**. A file called `studyflow-main.zip` will usually appear in your computer’s **Downloads** folder.

If you cannot find the button, use [this direct ZIP download](https://github.com/nnafizsadik/studyflow/archive/refs/heads/main.zip).

Download the whole ZIP rather than saving only the README or copying the page text. The website needs its HTML, CSS, and JavaScript files together.

### Step 2: Unpack the ZIP

A ZIP is a package containing the project files. Unpacking it creates a normal folder you can use.

- **Windows:** Open Downloads, right-click `studyflow-main.zip`, choose **Extract All**, and then click **Extract**. Open the folder Windows creates.
- **macOS:** Open Downloads and double-click `studyflow-main.zip`. Open the `studyflow-main` folder that appears.
- **Linux:** Right-click the ZIP and choose your file manager’s extraction option, then open the extracted folder.

Open the extracted folder rather than browsing the files inside the ZIP itself. You may need to open one more folder with the same name before reaching the website files.

### Step 3: Find the website’s starting page

Look for these three files in the same folder:

| File | What it does |
| --- | --- |
| `index.html` | Opens the website. This is the file you will double-click. |
| `styles.css` | Gives the website its colors, spacing, and layout. |
| `app.js` | Makes the buttons, tasks, calendar, and timer work. |

Keep these files together. You do not need to open or edit `styles.css` or `app.js` to use the website.

Some computers hide file extensions. In that case, `index.html` may appear as **index**, with a browser icon or a file type such as **HTML Document**.

### Step 4: Open StudyFlow

Double-click **index.html**. It should open in your default web browser.

If it opens in a text editor instead, close that window, right-click the file, choose **Open with**, and select your web browser, such as Chrome, Edge, Firefox, or Safari.

**That is enough to run the website.** For this method, you do not need to type any commands or upload anything to a server. The planner itself can run offline after you have downloaded and extracted its files.

### Step 5: Check that it is working

You should see the StudyFlow dashboard with the default profile name **Nafiz Sadik**, summary cards, and sample tasks.

Try this small practice task:

1. Click **New task**.
2. Enter a title such as **My first study task**.
3. Choose a subject and a due date.
4. Click **Create task**.
5. Open **My tasks** to find it. Click the checkbox beside it when you want to mark it complete.

If the task appears and its checkbox works, you have successfully run the project on your computer.

### Step 6: Make it yours and keep a backup

Open **Settings**, enter your own name and preferences, and click **Save preferences**. You can keep exploring the sample tasks or use **Clear workspace** when you are ready to start with your own work. Clearing the workspace removes its current tasks and sessions, so export anything you want to keep first.

Your changes are saved in your browser, rather than written into the downloaded code files. To keep a separate copy, choose **Settings → Export backup** and save the downloaded JSON file. Later, **Settings → Import** lets you restore it.

### If something does not look right

- **Only text appears, or the buttons do nothing:** Make sure you extracted the ZIP and that `index.html`, `styles.css`, and `app.js` are still together. Reopen the extracted `index.html` file.
- **You cannot find the download:** Check your browser’s downloads list and your computer’s Downloads folder.
- **Your new task disappears after reopening the page:** Your browser may restrict storage for directly opened files. Follow [the optional local-server instructions](#3-optional-run-through-a-local-server) above, or ask someone comfortable with those steps to help. Export a backup before switching methods.
- **You see a storage warning:** Export a backup before closing the page so you can keep your work.

Once you are comfortable opening the app, the earlier sections explain how to clone it with Git, run it through a local server, and customize the code. You can start with the simple method and explore those options whenever you are ready.
