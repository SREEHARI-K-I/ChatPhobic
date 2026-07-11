# ChatPhobic:Real-Time Full-Stack Chat Application

A high-fidelity, real-time global chat room built using a fully decoupled **MVC (Model-View-Controller)** structural architecture on the backend and an optimized React Single Page Application (SPA) frontend. Featuring dynamic theme styling, strict user password authentication, and instant full-duplex messaging streams.

---

## 📂 Project Directory Structure

```text
Realtime_Chat_App/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── chatController.js
│   ├── models/
│   │   └── messageModel.js
│   ├── routes/
│   │   └── chatRoutes.js
│   ├── dist/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md

Backend Server setup

cd backend
npm install
node server.js

Frontend

cd frontend
npm install
npm run dev

Design Decisions & Engineering Assumptions
1.Decoupled Architecture (Backend MVC + Frontend SPA): To meet clean code standards, the backend encapsulates distinct pipeline functions. Core data state tracking sits inside the Model layer (messageModel.js), path parsing relies on Express routers (chatRoutes.js), and execution control passes to the Controller tier (chatController.js).

2.Frictionless In-Memory Data Tier: To guarantee a robust developer testing workflow across any host machine without requiring external local software runtime prerequisites or throwing operating system native module compilation dependencies, the system utilizes an optimized, volatile memory tier tracking users and messages instantly in JavaScript state spaces.

3.Isolated Identity Guard (Authentication + Sessions): Upgraded the baseline requirement to feature user accounts with explicit passwords. New profiles are generated on the Sign up pane, valid inputs match via the Log in engine, and a clean Log out configuration cleans up socket loops and destroys local active states seamlessly.

4.Instagram Inspired UI Theme: Avoided plain layout elements in favor of a modern dark-mode aesthetics grid. It uses custom Instagram gradient fills for self messages, contrasting charcoal bubbles for inbound streams, dynamic single-character sender avatars, and intuitive status lines.

#Username:Sreehari
#password:#123

#Username:Rohan
#password:#123

