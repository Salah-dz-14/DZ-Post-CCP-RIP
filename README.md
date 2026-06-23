# Baridi RIP 🇩🇿 (بريدي RIP)

**Baridi RIP** is a highly polished, single-screen utility web application designed for Algerian postal account holders (Algérie Poste). It allows users to instantly and safely convert their **CCP** (Compte Courant Postal) account numbers into a standard **RIP** (Relevé d'Identité Postale) number and calculate verification keys completely client-side.

The application is built using **React 18**, **Vite**, and **Tailwind CSS**, adhering to the highest standards of user experience, speed, clean typography, and full responsiveness.

---

## ✨ Features Breakdown

### 1. Smart Input Sanitization & Keyless Guidance
* **Clear User Guidance**: Explicit labels and placeholder hints in Arabic, French, and English guiding users to input their account number **without the slash (/) or extra key digit**.
* **Automatic Formatting**: Handles input gracefully by filtering out unwanted characters, ensuring smooth conversion.

### 2. Instant CCP to RIP & Verification Key Calculation
* **CCP Key Calculation**: Instant calculation of the 2-digit verification key for the traditional CCP account number.
* **RIP Key Generation**: Generation of the 2-digit RIP verification key required for bank transfers.
* **Full RIP String Generation**: Compiles the official 20-digit RIP number formatted as:
  `007 99999 [10-Digit CCP] [2-Digit RIP Key]`

### 3. One-Click App & Account Sharing
* **Universal Account Sharing**: Share computed CCP/RIP data sheet in a clean, beautifully formatted textual card directly to WhatsApp, Telegram, or SMS.
* **Quick App Share Banner**: A sticky, high-visibility interactive banner with responsive hover effects allowing users to share the application's URL and welcoming introduction in one click.

### 4. 100% Offline, Secure & Private Storage
* **Local Persistence**: Calculation history (up to 15 entries) and bookmarked favorite accounts are saved securely in the browser's isolated local storage (`localStorage`).
* **Zero Server Transmission**: No databases, server-side APIs, or cloud platforms are used. Your financial details never leave your device.
* **Storage Preservation**: Proactively requests persistent storage permissions (`navigator.storage.persist()`) so that browsers do not evict saved favorites during system cleanups.

### 5. Advanced Backup & Recovery Engine
* **Secure Export**: Download your favorites list as an encrypted-like plain JSON file to your device.
* **Secure Import**: Restore your favorites from a previously backed-up JSON file at any time on another browser or device.

### 6. Full Multilingual & Responsive Layout
* **Adaptive Languages**: Supports Arabic (with complete Right-To-Left RTL layout structure), French, and English.
* **Mobile-First UX**: Responsive card-based layout featuring a premium Algiers gold and deep blue aesthetic.

---

## 📐 Mathematical Formulation (Algorithms)

Algerian CCP accounts use the ISO 7064 Modulo 97 algorithm for verification keys. Below is the simplified client-side implementation logic:

### 1. Clé CCP (CCP Key)
The key $K_{ccp}$ is computed using the formula:
$$K_{ccp} = 100 - \left( (CCP \times 100) \pmod{97} \right)$$
*(If the remainder is $0$, the key is $97$.)*

### 2. Clé RIP (RIP Key)
The 20-digit Relevé d'Identité Postale consists of:
- **Bank Code** (3 digits): `007` (Algérie Poste)
- **Guichet Code** (5 digits): `99999`
- **CCP Number** (padded to 10 digits with leading zeros)
- **RIP Key** (2 digits)

To calculate the 2-digit RIP key, we compile the base 18-digit sequence:
$$S = \text{"007"} + \text{"99999"} + \text{Pad10}(CCP)$$
We treat this sequence as a large integer, append `"00"`, and compute:
$$K_{rip} = 97 - \left( (S \times 100) \pmod{97} \right)$$

---

## 🔒 Security & Privacy Notice (GitHub & Facebook Ready)

Is it safe to make this repository public on GitHub and share it on Facebook? **Absolutely YES.**

- **No Secrets Exposed**: There are **no API keys, database credentials, or secret variables** in this codebase.
- **Client-Side Security**: The application performs all computations locally inside the visitor's browser.
- **GDPR & Privacy Compliant**: No cookies, tracking pixels, or data collection scripts exist.
- **Vandal-Proof**: Since there is no backend database to compromise, the app is immune to traditional web injection attacks or database leaks.

---

## 🚀 Quick Start

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 3. Build for Production
To compile and optimize the applet into static, production-ready assets:
```bash
npm run build
```

---

## 📂 Project Structure

```text
├── components/          # High-fidelity React components
│   ├── BackupRestore.tsx     # Backup and recovery engine (JSON file IO)
│   ├── HistoryLog.tsx        # Calculation history manager
│   ├── LanguageSwitcher.tsx  # Dynamic multi-lingual toggle
│   ├── PrivacyInfo.tsx       # Safety, offline, and technical details card
│   ├── ResultCard.tsx        # Detail breakdown sheet with copy/share integrations
│   └── SavedAccountCard.tsx  # Interactive bookmark card for favorites
├── utils/               # Algorithmic modules
│   └── ccp-logic.ts          # Core mathematical algorithms (mod 97 verification keys)
├── App.tsx              # Application layout & state hub
├── constants.tsx        # Fully localized dictionaries (AR, FR, EN)
├── main.tsx             # Application mount node
├── types.ts             # Strict TypeScript definitions
└── index.css            # Global CSS imports with custom theme rules
```

---

## 🛠️ Tech Stack & Styling Pairings

- **Framework**: React 18 with Vite.
- **Styling**: Tailwind CSS.
- **Icons**: Scalable vector icons using standard lightweight components.
- **Typography**: 
  - Sans: **Inter** (Primary system legibility font)
  - Displays: **Outfit / Space Grotesk** for clean Arabic & Latin layouts
  - Mono: **JetBrains Mono** for clear financial figures, CCP, and RIP alignment

---

*Developed with ❤️ for the Algerian web utility ecosystem.*
