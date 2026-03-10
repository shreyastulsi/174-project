# CS 174A Project

Mini-kart arena racing built with JavaScript, Three.js, and Vite.

## Project Overview

- The app entry point is `index.html`.
- Main gameplay and rendering logic live in `main.js`.
- Dependencies and scripts are defined in `package.json`.

## Prerequisites

- Node.js
- npm

## Setup

Install dependencies from the project root:

```bash
npm install
```

## Run Locally

Start the Vite development server:

```bash
npx vite
```

After the server starts, open the local URL shown in the terminal. It is usually:

```txt
http://localhost:5173/
```

## Build for Production

Create a production build:

```bash
npm run build
```

## Controls

- `W` / `S`: throttle / brake
- `A` / `D`: steer
- `P`: pause / resume
- `C`: reset camera
- `Enter`: advance through the start menu / begin race
- Mouse drag: orbit camera
- Mouse wheel: zoom camera

## File Structure

```txt
174-project/
├─ index.html
├─ main.js
├─ package.json
├─ package-lock.json
├─ assets/
└─ node_modules/   generated locally after npm install
```
