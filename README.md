# Pythings – Creative Code Puzzles

[My Notes](notes.md)

Pythings is a python learning website. You solve puzzles and make cool pixel art by writing Python code. Try game levels (like coding your way through a maze), drawing challenges (where you match a picture using code), or just freestyle your own art. See your code run instantly, get feedback, and share your creations with friends!


> [!NOTE]
>  This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
>  If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

## 🚀 Specification Deliverable

> [!NOTE]
>  Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### 🚀 Elevator Pitch
Pythings is a web platform where users solve visual puzzles and create art by writing Python code, allowing people to learn python in a fun environment. You can play games, make art, and even compete with friends. There is also a tutorial to get you set up with the basics. 


### Design
![Design image](sceetch.png)
I plan to make it snaked themed (because python), with green and black being the main color scheme. You can see the tentative designs of a terminal and game environment as well.

## ✨ Key Features
- **User Authentication:** Register, login, and track your progress.
- **In-Browser Python Editor:** Write and run code with a Bit-like API.
- **Beginner Mode:** Learn how to code in python with guided tutorials. 
- **Challenge Mode:** Take on geometry challenges, code a character through mazes, or replicate a picture.
- **Free Mode:** Design challenges for yourself and others, create a nice work of art, or simply code. 
- **Auto-Grading & Scoring:** System checks your solution and updates leaderboards.
- **Sharing** View and comment on art made by the community, and try to beat their challenges. 

### Technologies

I am going to use the required technologies in the following ways.

| Technology | Usage |
|------------|-------|
| **HTML**   | Page layout: login, dashboard/menu, editor, gallery. |
| **CSS**    | Responsive, playful UI; animate code output and transitions. |
| **React**  | Componentization: code editor, canvas, puzzles, gallery; client routing; interactivity. |
| **Web Service** | Endpoints for auth, code execution, puzzles, art, comments. |
| **Database** | Store users, code/art, comments, puzzle data, scores. |
| **WebSocket** | Real-time chat, pair coding, leaderboard updates. |

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://yourdomainnamehere.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x]**HTML pages** - I have completed this part of the deliverable.
- [x] **Proper HTML element usage** - I  have completed this part of the deliverable.
- [x] **Links** - I  have completed this part of the deliverable.
- [x] **Text** - I have completed this part of the deliverable.
- [x] **3rd party API placeholder** - I have completed this part of the deliverable.
- [x] **Images** - I have completed this part of the deliverable.
- [x] **Login placeholder** - I have completed this part of the deliverable.
- [x] **DB data placeholder** - I have completed this part of the deliverable.
- [x] **WebSocket placeholder** - I have completed this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body**
- [x] **Navigation elements**
- [x] **Responsive to window resizing**
- [x] **Application elements**
- [x] **Application text content**
- [x] **Application images** 

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite**
- [x] **Components**
- [x] **Router**

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

I've decided to stray away from the maze, and instead, will implement a series of given/user created puzzles.
- [x] **All functionality implemented or mocked out**
- [x] **Hooks**

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Node.js/Express HTTP service** - Created a complete Express backend in `service/index.js` running on port 4000 with cookie-based authentication.
- [x] **Static middleware for frontend** - Added `app.use(express.static('public'))` to serve the built React frontend from the public directory.
- [x] **Calls to third party endpoints** - Integrated the Quotable.io API in `home.jsx` to display random inspirational quotes with technology/education tags.
- [x] **Backend service endpoints** - Created 5 endpoints: `/api/auth/create` (register), `/api/auth/login`, `/api/auth/logout`, `/api/scores` (GET), and `/api/score` (POST).
- [x] **Frontend calls service endpoints** - Updated `login.jsx` to call authentication endpoints and `scores.jsx` to call score endpoints using fetch with credentials.
- [x] **Supports registration, login, logout, and restricted endpoint** - Full authentication system with bcrypt password hashing, UUID tokens, httpOnly cookies, and `verifyAuth` middleware protecting score endpoints.


## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **MongoDB Atlas database created** - Created a MongoDB Atlas cluster and configured network access
- [x] **Stores data in MongoDB** - Created `database.js` module with MongoDB client connection. Score data (email, score, game, date) is stored.
- [x] **Stores credentials in MongoDB** - User credentials are stored in the `user` collection. Implemented `addUser()`, `getUser()`, `getUserByToken()`, and `updateUser()` functions.
- [x] **Restricts functionality based on authentication** - All database operations for scores require authentication. The `verifyAuth` middleware uses `DB.getUserByToken()` to verify user authentication before allowing access.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Backend listens for WebSocket connection** - Created `peerProxy.js` module that uses the `ws` library to handle WebSocket connections. The backend upgrades HTTP connections to WebSocket and maintains a list of active connections.
- [x] **Frontend makes WebSocket connection** - Added WebSocket client code in both `scores.jsx` and `editor.jsx` that connects to the backend WebSocket server using the `/ws` endpoint. Connection protocol automatically adjusts for http/https.
- [x] **Data sent over WebSocket connection** - WebSocket messages are sent when users complete challenges (from editor) and submit scores (from leaderboard). Messages include user info, scores, challenge details, and timestamps.
- [x] **WebSocket data displayed** - Real-time notifications appear in both the Editor and Leaderboard pages showing when other users complete challenges or submit scores. Notifications auto-dismiss after 5 seconds.
- [x] **Application is fully functional** - All features work end-to-end: users can register, login, solve challenges, see real-time activity from other users, and view the leaderboard. No mocks or placeholders remain.
