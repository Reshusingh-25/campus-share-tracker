# ⚡ CampusShare • Smart Equipment Tracking System
> Complete Working Module for College Labs, Hackathons & Campus Inventory Management

---

## 📌 1. Problem Statement
In colleges and universities, departments manage dozens to hundreds of valuable assets (laptops, cinema cameras, 4K projectors, VR kits, robotic boards). 
**Key challenges faced by lab administrators:**
1. **No Real-Time Visibility:** Lack of instant clarity on who holds which laptop/camera, when it was checked out, and when it is due.
2. **Missing & Delayed Returns:** Equipment remains unreturned past project deadlines without automated alerts.
3. **Condition & Damage Accountability:** When equipment returns damaged (scratched lenses, broken USB ports), it is difficult to determine whose possession caused the defect.
4. **Manual Paperwork:** Paper registers are easily misplaced, illegible, and slow to audit.

---

## 🚀 2. Proposed & Developed Solution
**CampusShare Equipment Hub** transforms manual college inventories into an intelligent, QR-driven, real-time tracking web application:

1. **Unique Equipment ID System (`LAP101`, `CAM201`, `PRO301`):**
   - Distinct prefixes for each category: Laptops (`LAP`), Cameras (`CAM`), Projectors (`PRO`), VR/AR (`VR`), Lab Kits (`IOT`), Audio (`MIC`).
2. **Live QR Generation & Physical Scanner:**
   - Offline, instantaneous QR code generation for every asset.
   - Built-in HTML5 webcam scanner + 1-click **Hackathon Presentation Simulator** (scans test QR codes with synthesized audio feedback).
3. **Fast Issue (Check-Out) Workflow:**
   - Student ID verification with autocomplete (`STU102`, `STU108`, `STU205`).
   - Quick return date presets (+1 day, +3 days, +1 week).
   - Digital log of purpose and bundled accessories.
4. **Condition-Checked Return (Check-In):**
   - Lab In-Charge inspects condition (`Good`, `Minor Wear`, or `Damaged / Repair Needed`).
   - Damaged equipment is immediately moved to `Maintenance` with damage notes and incident logging.
5. **Overdue Detection & Multi-Channel Reminder:**
   - Real-time comparison against return deadlines.
   - Glowing overdue alert banner.
   - 1-Click WhatsApp / SMS / Email automated reminder generator.
6. **Brother P-Touch Style Label Printer (`P-touch Editor 6` Compatible):**
   - High-contrast, printable asset tag stickers with asset ID, department branding, QR code, and barcode strip.
   - Designed for Brother continuous label tape (62mm / 36mm) or standard A4 sticky sheets.
7. **Complete Transaction Audit Trail:**
   - Immutable chronological ledger of every checkout, check-in, repair, and registration.
   - 1-click JSON export and dataset reset for demonstration.

---

## 🗄️ 3. Database Schema

| Field Name | Type | Example | Description |
|---|---|---|---|
| `id` | String (PK) | `LAP101` | Unique Equipment ID |
| `name` | String | `Apple MacBook Pro 14" M2` | Full asset name / model |
| `category` | String | `Laptop` / `Camera` / `Projector` | Hardware category |
| `serial` | String | `SN-APL-882194` | Hardware serial number |
| `location` | String | `Innovation Lab - Rack A2` | Physical shelf/cabinet storage |
| `status` | Enum | `Available` \| `Issued` \| `Overdue` \| `Maintenance` | Current lifecycle state |
| `condition` | Enum | `Good` \| `Minor Wear` \| `Damaged` | Physical state |
| `studentId` | String (FK) | `STU102` | Roll number of current borrower |
| `studentName` | String | `Rohan Sharma` | Student's full name |
| `studentPhone` | String | `+91 98765 43210` | Contact for SMS/WhatsApp notices |
| `issueDate` | ISO 8601 | `2026-10-30T10:30` | Check-out timestamp |
| `returnDate` | ISO 8601 | `2026-11-02T17:00` | Agreed return deadline |
| `purpose` | String | `Deep Learning Hackathon` | Academic project reason |
| `totalIssues` | Number | `14` | Total times borrowed |

---

## 💻 4. Running the Project Locally

The project is 100% self-contained with Vanilla HTML5, CSS3, and JavaScript (with bundled offline QR libraries).

```bash
# Navigate to the project directory
cd C:\Users\singh\.gemini\antigravity-ide\scratch\campus-share-tracker

# Start local server (Python)
python -m http.server 5500

# Open in browser
http://localhost:5500
```

---

## 🏆 5. Hackathon Presentation Talking Points
1. **Zero External Cloud Lock-in:** Works 100% offline in college labs, saving local storage with instant offline QR rendering.
2. **End-to-End Cycle:** Walk judges from printing the Brother label sticker, sticking it on the laptop, scanning it via webcam, issuing to a student, detecting an overdue condition, to returning and inspecting physical condition.
3. **Sound & Haptics:** Audio synthesizer delivers realistic hardware scanner beeps without external MP3 files.
