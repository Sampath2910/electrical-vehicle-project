# ⚡ Smart EV Charging Station Platform
## Beginner-Friendly Installation, Build, and Operations Guide

> **Project Name**: Smart EV Charging Station: Time-of-Day (ToD) Tariff & Priority Preemption System  
> **Target Application**: Electric Two-Wheelers (1.0 kW to 3.3 kW Single-Phase AC)  
> **Status**: Live & Running Locally on Port 3000 (Frontend) and Port 8080 (Backend)  
> **Author / Guide Created For**: Beginners, Teammates, and Project Evaluators  

---

## 📌 1. Project Overview & Key Features

This project is a complete **IoT-enabled Smart Electric Two-Wheeler (2W) Charging Infrastructure Platform**. It solves real-world power quality, dynamic billing, and emergency eviction challenges faced by EV charging stations in India.

### Core Features Explained Simply:
1. **Time-of-Day (ToD) Tariff Billing (Commercial LT-6 Category)**:
   - **Off-Peak (10:00 PM – 06:00 AM)**: **₹8.00 / kWh** ($S_1$) — Lowest rate when grid demand is light.
   - **Standard (06:00 AM – 06:00 PM)**: **₹10.50 / kWh** ($S_2$) — Daytime solar & standard rate.
   - **Peak (06:00 PM – 10:00 PM)**: **₹14.00 / kWh** ($S_3$) — Evening peak demand surcharge.

2. **Emergency Priority Preemption Eviction Protocol (Bay #02)**:
   - Reserved VIP/Emergency Bay for urgent charging or emergency vehicles (Ambulance / Fire Brigade).
   - If an emergency trigger is activated on the Admin panel or hardware button, an active session enters a **120-second eviction sequence**.
   - Visual alerts flash red, an active buzzer beeps rapidly, and a 120-second countdown runs.
   - If the vehicle is not unplugged within 120 seconds, the hardware relay automatically trips power and charges a **₹500.00 penalty**.

3. **2-Wheeler Metrology & Power Quality (PZEM-004T Metrology Engine)**:
   - Real-time single-phase AC measurements (Voltage 230V, Current ≤ 14.3A, Active Power kW, Power Factor 0.98, THD 2.1%).
   - Presets for Indian 2-Wheelers: **Ather 450X** (3.7 kWh), **Ola S1 Pro** (4.0 kWh), **TVS iQube** (3.4 kWh), **Ultraviolette F77** (10.3 kWh), **Revolt RV400** (3.24 kWh).

4. **Dynamic Bharat-QR & UPI Gateway**:
   - Generates instant QR codes for payment via Google Pay, PhonePe, Paytm, or BHIM UPI upon charging completion.

---

## 🛠️ 2. System Architecture & Installed Software Packages

### A. Technology Stack Overview

| Layer | Framework / Technology | Role & Function |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | User interface, metrology graphs, live control panel |
| **Styling** | Tailwind CSS v4, Lucide Icons, Framer Motion | Modern dark-mode UI & dynamic animations |
| **Charts & Graphics** | Recharts | Live metrology (Voltage, Current, kW, THD) telemetry graphs |
| **Backend** | Spring Boot 3.2.4 (Java 17) | REST API, WebSocket streams, business logic |
| **Database** | H2 In-Memory DB (Fallback) / PostgreSQL | Data persistence for chargers, sessions, and invoices |
| **Messaging** | Eclipse Paho MQTT Client, WebSockets | IoT live telemetry stream |
| **IoT Hardware Bench** | ESP32 Firmware C++, PZEM-004T Sensor | Hardware relay cutoff, metrology, and buzzer |

---

### B. Packages & Dependencies Installed

#### 1. Frontend npm Dependencies (`frontend/package.json`):
- `next`: `16.3.7` — Next.js App Router framework
- `react`: `19.2.8` — Core React engine
- `react-dom`: `19.2.8` — React DOM rendering
- `recharts`: `^3.10.1` — Real-time telemetry charts
- `lucide-react`: `^1.48.0` — UI Icon set
- `framer-motion`: `^13.4.6` — Smooth transition animations
- `clsx`: `^2.1.1` — Dynamic CSS class utility
- `tailwind-merge`: `^3.7.0` — Tailwind class conflict resolution
- `tailwindcss`: `^4` — Modern CSS styling engine
- `typescript`: `^5` — Type safety and auto-complete

#### 2. Backend Maven Dependencies (`backend/pom.xml`):
- `spring-boot-starter-web`: RESTful web service framework
- `spring-boot-starter-security`: JWT authentication and security rules
- `spring-boot-starter-data-jpa`: Database ORM mapping
- `h2`: In-memory SQL database (Runs out-of-the-box without PostgreSQL setup)
- `postgresql`: Production SQL database driver
- `spring-boot-starter-data-redis`: Live cache and session telemetry
- `spring-boot-starter-websocket`: Real-time web socket data streaming
- `org.eclipse.paho.client.mqttv3`: MQTT client for IoT telemetry connection
- `lombok`: Boilerplate reduction for Java classes

---

## 💻 3. Prerequisites for Running on Any Laptop

Before running this project on a new laptop (your friend's laptop or your laptop), ensure the following software is installed:

1. **Node.js (v18 or higher)**: Download from [nodejs.org](https://nodejs.org/) (Includes `npm`).
2. **Java JDK 17 (OpenJDK 17 or Eclipse Temurin 17)**: Download from [adoptium.net](https://adoptium.net/).
3. **Apache Maven (3.8 or higher)**: Download from [maven.apache.org](https://maven.apache.org/).

> **Note**: Verify installation by opening PowerShell and running:
> ```powershell
> node -v
> npm -v
> java -version
> mvn -v
> ```

---

## 🚀 4. Complete Step-by-Step Terminal Commands (Beginner Guide)

Follow these exact steps to set up and run the project from scratch.

### Step 1: Extract the Project Zip File
Open **PowerShell** in the directory where the `.zip` file is located, and run:

```powershell
# Extract zip file into current directory
Expand-Archive -Path "electrical-vehicle-project-main (1).zip" -DestinationPath "." -Force

# Change directory into extracted folder
cd "electrical-vehicle-project-main"
```

---

### Step 2: Configure Environment Variables
Create `.env.local` inside the `frontend` folder.

```powershell
# Navigate to frontend folder
cd frontend

# Create .env.local file with configuration settings
Set-Content -Path ".env.local" -Value @"
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws-ev
NEXT_PUBLIC_DATA_MODE=mock
"@
```

---

### Step 3: Install Frontend Dependencies
Run `npm install` inside the `frontend` folder:

```powershell
# Make sure you are inside the frontend directory
npm install
```
*(This installs all required npm packages like Next.js, React, Tailwind, Lucide, Recharts)*

---

### Step 4: Compile and Build the Spring Boot Backend

Open a new PowerShell window, navigate to the `backend` folder, and compile the Java project:

```powershell
# Navigate to backend folder
cd "electrical-vehicle-project-main\backend"

# Compile backend code using Maven
mvn clean compile
```

---

### Step 5: Start the Backend Server (Port 8080)

Run the backend Spring Boot server:

```powershell
# Run backend server
mvn spring-boot:run
```

- **Output**: You will see `Started SmartEvApplication in X seconds` and `Tomcat started on port 8080`.
- **Database**: Backend uses H2 in-memory database by default (`jdbc:h2:mem:smartevdb`).

---

### Step 6: Start the Frontend Web Application (Port 3000)

Open another PowerShell window, navigate to the `frontend` folder, and start the development server:

```powershell
# Navigate to frontend directory
cd "electrical-vehicle-project-main\frontend"

# Start Next.js development server
npm run dev
```

- **Output**: You will see `- Local: http://localhost:3000`.
- **Browser**: Open your browser and go to [http://localhost:3000](http://localhost:3000).

---

### Step 7: (Optional) Run the IoT Telemetry Simulator

If you want to simulate live MQTT hardware telemetry data from the PZEM-004T sensor:

```powershell
# Navigate to project root directory
cd "electrical-vehicle-project-main"

# Run MQTT simulator script
node iot/simulator/mqtt_simulator.js
```

---

## 🧭 5. How to Navigate and Test the Live Application

Once `http://localhost:3000` is open in your browser, here are the main pages to demonstrate:

| URL Route | Feature / Screen | What to Demo |
| :--- | :--- | :--- |
| `http://localhost:3000/` | **Landing Page** | Overview of Smart Moto EV platform, Indian 2W charging features |
| `http://localhost:3000/dashboard` | **Rider Dashboard** | Registered EV bikes (Ather, Ola, TVS, Ultraviolette), session controls |
| `http://localhost:3000/chargers` | **Station Network** | Hardware Bay #01 (3.3 kW 2W AC Bench) & Network Fleet |
| `http://localhost:3000/charging/ses-active-01` | **Active Charging & Metrology** | Real-time PZEM-004T charts (Voltage 230V, Current 14.3A, THD 2.1%), ToD rate |
| `http://localhost:3000/admin` | **Admin Suite & Priority Override** | Trigger 120-second emergency preemption eviction sequence |
| `http://localhost:3000/bills` | **Bills & Bharat-QR UPI Gateway** | Generate section 6 tax invoices with dynamic GST and UPI payment QR |

---

## 🧮 6. Billing Formula & Audit Calculation

The total billed amount for any EV charging session is calculated dynamically using the formula:

$$\text{Total Amount} = (\text{Energy kWh} \times \text{ToD Rate}) + \text{Service Fee (₹5.00)} + 18\% \text{ GST} + (\text{Emergency Penalty ₹500 if applicable})$$

### Example Calculation:
- **Vehicle**: Ather 450X (Charged **3.0 kWh**)
- **Time Block**: Peak Hours ($S_3$ = ₹14.00 / kWh)
- **Energy Cost**: $3.0 \times 14.00 = \text{₹42.00}$
- **Service Fee**: $\text{₹5.00}$
- **Subtotal**: $42.00 + 5.00 = \text{₹47.00}$
- **GST (18%)**: $47.00 \times 0.18 = \text{₹8.46}$
- **Total Payable**: $\text{₹55.46}$

---

## 📋 7. Quick Checklist for Teammates & Friends

If sharing this project with a friend, send them this simple checklist:

1. [ ] Install Node.js v18+, Java JDK 17, and Maven.
2. [ ] Unzip `electrical-vehicle-project-main (1).zip`.
3. [ ] Open terminal in `frontend`, run `npm install`, then `npm run dev`.
4. [ ] Open terminal in `backend`, run `mvn spring-boot:run`.
5. [ ] Open browser at `http://localhost:3000`.

---

> **Summary**: The project is completely set up, fully built, and actively running on your laptop. You can now share this document file (`SMART_EV_PROJECT_BEGINNER_GUIDE.md`) directly or print/export it to PDF!
