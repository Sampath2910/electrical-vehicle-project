# Smart EV Charging Platform — Team Handbook

Welcome. This handbook explains **the entire project** — what it does, how it is built, which file is responsible for what, and **how to change things when you are asked to**.

It is written for team members who did **not** build the project and may be new to web development. Read it top to bottom once; after that, use it as a reference.

## How to use this handbook

- **Presenting / understanding the project for the first time?** Read `00`, `01`, `02` in order.
- **Need to run it on your laptop?** Go to `03 — Setup & Run`.
- **"Where is the code that does X?"** Go to `04 — Codebase Map`.
- **"How does feature X actually work end-to-end?"** Go to `05 — Feature Walkthroughs`.
- **"The manager asked us to change X."** Go straight to `07 — Change Cookbook`.
- **Stuck on a word or a viva question?** Go to `09 — Glossary & Q&A`.

## Documents

| # | Document | What it covers |
|---|----------|----------------|
| 00 | [Project Overview](./00-project-overview.md) | What the product is, the real-world problem, the user roles |
| 01 | [Architecture](./01-architecture.md) | The 3 layers, how they connect, data flow, diagrams |
| 02 | [Tech Stack](./02-tech-stack.md) | Every technology used and *why* |
| 03 | [Setup & Run](./03-setup-and-run.md) | Install, run, demo logins, troubleshooting |
| 04 | [Codebase Map](./04-codebase-map.md) | Folder-by-folder, file-by-file responsibility |
| 05 | [Feature Walkthroughs](./05-feature-walkthroughs.md) | Login, charging, billing, preemption, wallet, admin — traced through the code |
| 06 | [Data Model](./06-data-model.md) | The database, the types, the billing formula |
| 07 | [Change Cookbook](./07-change-cookbook.md) | "If asked to change X, edit file Y" recipes |
| 08 | [API Reference](./08-api-reference.md) | Every endpoint, input and output |
| 09 | [Glossary & Viva Q&A](./09-glossary-and-qa.md) | Jargon decoded + likely examiner questions |

## The 30-second summary

This is a **Smart EV Charging Platform for electric two-wheelers** (scooters/bikes, 1–3.3 kW). A rider can find a charging station, start a charging session, watch live power readings, stop, and get an itemised bill. **Operators** manage one station each; **Admins** manage the whole fleet, set prices (tariffs), and can trigger an **emergency "preemption"** that evicts a parked vehicle from a VIP bay for an ambulance/fire engine.

It is built in **three layers**:
1. A **Next.js website** (what you see and click) — this *also* has its own small built-in server and a `db.json` file acting as a database, so it runs completely on its own.
2. A **Spring Boot (Java) backend** — a more "production-grade" server that the website talks to when it is running.
3. **IoT firmware** for an ESP32 microcontroller + sensors that represent the real charging hardware.

> **Important for demos:** the website runs perfectly **on its own** using its built-in server and `db.json`. The Java backend and the hardware are *optional enhancements*. If the Java backend is off, the website quietly falls back to its own data. (See `01` and `03`.)
