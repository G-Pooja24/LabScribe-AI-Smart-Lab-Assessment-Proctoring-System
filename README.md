# LabScribe-AI: Smart Lab Assessment & Proctoring System

[![Licence](https://img.shields.io/github/license/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System)](LICENSE)
[![Issues](https://img.shields.io/github/issues/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System)](https://github.com/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System/issues)
[![Stars](https://img.shields.io/github/stars/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System)](https://github.com/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System/stargazers)

**LabScribe-AI** is a professional-grade AI-powered platform designed to streamline laboratory assessments and enhance proctoring through intelligent automation. It leverages state-of-the-art AI models to generate question papers, monitor student performance, and provide real-time feedback.

---

## 🚀 Key Features

- **🤖 AI Paper Generation**: Automatically create comprehensive laboratory question papers using Gemini AI.
- **🛡️ Smart Proctoring**: Real-time monitoring and anomaly detection during assessments.
- **💻 Integrated Terminal**: Built-in xterm support for direct coding and command execution.
- **⚡ Real-time Updates**: Scalable communication using WebSockets (STOMP).
- **📊 Comprehensive Dashboard**: Intuitive interface for instructors to manage labs and track student progress.

---

## 📸 Screenshots

| Dashboard Overview | Assessment View |
|:---:|:---:|
| ![Dashboard](docs/screenshots/dashboard_1.png) | ![Assessment](docs/screenshots/assessment_view.png) |
| **Lab Management** | **About LabScribe** |
| ![Management](docs/screenshots/dashboard_2.png) | ![About](docs/screenshots/about_page.png) |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot (Java 17)
- **Database**: MySQL with Spring Data JPA
- **AI Integration**: Google Gemini AI (via REST API)
- **Communication**: WebSockets (Spring WebSocket + STOMP)
- **Security**: Spring Boot Validation

### Frontend
- **Library**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Terminal**: xterm.js
- **Editor**: Monaco Editor (VS Code core)
- **Styling**: Tailwind CSS / Lucide React

---

## ⚙️ Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL Server
- Gemini AI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/G-Pooja24/LabScribe-AI-Smart-Lab-Assessment-Proctoring-System.git
   cd LabScribe-AI-Smart-Lab-Assessment-Proctoring-System
   ```

2. **Backend Setup**
   - Navigate to `backend/`
   - Update `src/main/resources/application.properties` with your MySQL credentials and Gemini API Key.
   - Run the application:
     ```bash
     ./mvnw spring-boot:run
     ```

3. **Frontend Setup**
   - Navigate to `frontend/`
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community standards.

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

*Developed by [G Pooja](https://github.com/G-Pooja24)*
