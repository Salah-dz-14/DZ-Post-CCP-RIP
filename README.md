# Baridi RIP 🇩🇿 (بريدي RIP)

**Baridi RIP** is a highly polished, feature-rich Progressive Web Application (PWA) designed for Algerian postal account holders (Algérie Poste). It allows users to instantly and safely convert their **CCP** (Compte Courant Postal) account numbers into a standard **RIP** (Relevé d'Identité Postale) number, calculate verification keys, simulate cash withdrawal fees, and generate printable RIP certificates with offline QR codes—completely client-side.

The application is built using **React 19**, **Vite**, and **Tailwind CSS**, adhering to the highest standards of user experience, speed, privacy, and full offline capability.

---

## ✨ Features Breakdown

### 1. Smart Input Sanitization & Keyless / Keyed Guidance
* **Clear User Guidance**: Guidance in Arabic, French, and English for entering account numbers with or without keys (e.g., `12345678` or `12345678/45`).
* **Real-time Key Verification**: Automatically checks if a user-supplied key matches the algorithmically calculated key.
* **Automatic Formatting**: Filters out slashes, dashes, and extra spaces seamlessly.

### 2. Instant CCP to RIP & Verification Key Calculation
* **CCP Key Calculation**: Instant calculation of the 2-digit verification key for traditional CCP accounts (Modulo 100 weighted algorithm).
* **RIP Key Generation**: Generation of the 2-digit RIP verification key required for bank transfers (ISO 7064 Modulo 97 algorithm).
* **Full RIP String Generation**: Compiles the official 20-digit RIP number formatted as:
  `007 99999 [10-Digit CCP] [2-Digit RIP Key]`
* **International IBAN Generation**: Compiles the official Algerian IBAN `DZ56 0079 9999 XXXX XXXX XX`.

### 3. CCP Cash Withdrawal & Edahabia ATM Fee Calculator
* **Official Algérie Poste Tax Brackets**: Calculates exact withdrawal fees for post office counter transactions.
* **Reverse Balance Mode**: Determines the maximum cash you can withdraw given a total available account balance.
* **Edahabia ATM (DAB/GAB) Simulator**: Calculates transaction fees for Algérie Poste ATMs (35 DA) and Interbank CIB ATMs (60 DA).
* **Quick Preset Chips**: Fast one-tap buttons for common amounts (5,000 DA, 10,000 DA, 20,000 DA, 50,000 DA, 100,000 DA, 200,000 DA).

### 4. Printable RIP Slip & Offline Vector QR Code
* **Official Slip Preview**: Generates an Algérie Poste styled digital certificate with custom account holder name.
* **Pure Offline SVG QR Code**: Renders a vector QR code containing account details without sending data to external APIs.
* **One-Click Printing / PDF Export**: Built-in support for printing clean physical slips or saving as PDF via `window.print()`.

### 5. 100% Offline PWA & Isolated Storage
* **Service Worker Caching**: Fully installable as a Progressive Web App (PWA) on mobile and desktop home screens. Works 100% offline without active internet.
* **Local Storage Persistence**: Calculation history and bookmarked favorite accounts are saved securely in local storage. Requests persistent storage permission (`navigator.storage.persist()`).
* **Zero Server Transmission**: No external databases, server APIs, or tracking analytics. Financial details never leave the browser.

### 6. Secure Backup & Recovery Engine
* **JSON Export**: Download saved accounts to an offline JSON backup file.
* **JSON Import**: Restore saved accounts from a backup file on any device.

---

## 📐 Mathematical Formulation (Algorithms)

Algerian CCP accounts use the ISO 7064 Modulo 97 algorithm for verification keys.

### 1. Clé CCP (CCP Key)
Weighted sum of digits for a 10-digit padded CCP account:
$$K_{ccp} = \left( \sum_{i=0}^{9} \text{digit}_i \times (13 - i) \right) \pmod{100}$$

### 2. Clé RIP (RIP Key)
The 20-digit Relevé d'Identité Postale consists of:
- **Bank Code** (3 digits): `007` (Algérie Poste)
- **Guichet Code** (5 digits): `99999`
- **CCP Number** (padded to 10 digits with leading zeros)
- **RIP Key** (2 digits)

$$S = \text{"007"} + \text{"99999"} + \text{Pad10}(CCP)$$
$$K_{rip} = 97 - \left( (S \times 100) \pmod{97} \right)$$

---

## 🚀 Quick Start

### 1. Installation
Install dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```text
├── components/          # High-fidelity React components
│   ├── BackupRestore.tsx     # Backup and recovery engine (JSON file IO)
│   ├── FeeCalculator.tsx     # Official withdrawal & ATM tax simulator
│   ├── HistoryLog.tsx        # Calculation history log manager
│   ├── LanguageSwitcher.tsx  # Dynamic multi-lingual toggle
│   ├── PrivacyInfo.tsx       # Safety, privacy, and developer card
│   ├── ResultCard.tsx        # Breakdown card with copy/share buttons
│   ├── RipCertificate.tsx    # Printable slip & offline QR code renderer
│   └── SavedAccountCard.tsx  # Favorite account bookmarks card
├── utils/               # Algorithmic & offline modules
│   ├── ccp-logic.ts          # Modulo 97 math, IBAN, and fee calculations
│   └── qr-code.ts            # Pure offline SVG QR Code generator
├── App.tsx              # Application shell & tab navigation hub
├── constants.tsx        # Localized dictionaries (AR, FR, EN)
├── types.ts             # TypeScript definitions
└── index.css            # Tailwind CSS imports & global styles
```

---

*Developed with ❤️ for the Algerian web utility ecosystem.*
