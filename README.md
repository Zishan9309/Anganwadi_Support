# Anganwadi Support App 👩‍👧‍👦

A comprehensive, full-stack mobile application designed to digitize and empower Anganwadi Workers (AWWs) in India. This app streamlines student management, vaccination drives, data reporting, and provides AI-powered assistance.

---

## 🚀 Key Features

### 1. 📋 Student Management
* **Digital Enrollment:** Register new students with details like Name, Age, Gender, Parent Name, and **Parent Mobile Number**.
* **Profile Management:** View and edit student profiles.
* **Health Records:** Track Weight, Height, and Nutrition Status (Healthy/Malnourished).

### 2. 💉 Vaccination Drive & Verification
* **SMS Notifications:** Workers can send SMS reminders to parents for pending vaccines directly from the app.
* **Parent Verification Link:** The SMS includes a unique link. When parents click it and confirm "Yes, Done", the database updates automatically.
* **Live Status Tracking:** The app shows a **Green Checkmark (Verified)** ✅ instantly when the parent confirms, locking the record to prevent manual errors.

### 3. 📸 Image Reporting
* **Camera Integration:** Capture photos of center activities or facilities.
* **Cloud Storage:** Uploads the image to the database.
* **Gallery:** View a history of all uploaded images.

### 4. 🤖 AI Chat Assistant
* **Smart Helper:** An integrated chatbot powered by **Llama-3 (via Groq)**.
* **Multilingual:** Answers queries about government schemes (Poshan Abhiyaan, PMMVY), nutrition, and guidelines in **Hindi & English**.

---

## 🛠️ Tech Stack

* **Frontend:** React Native (Expo SDK 54), TypeScript, Expo Router.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose).
* **AI Engine:** Groq API (Llama-3).
* **Key Libraries:** `expo-camera`, `expo-sms`, `react-native-chart-kit`.

---

## 📦 Installation Guide

Follow these steps to set up the project locally.

### Prerequisites
* [Node.js](https://nodejs.org/) (LTS version)
* [Git](https://git-scm.com/)
* **Expo Go App** on your Android/iOS device.
* A **MongoDB Atlas** account (or local MongoDB).

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Anganwadi-Assistant.git](https://github.com/YOUR_USERNAME/Anganwadi-Assistant.git)
cd Anganwadi-Assistant
