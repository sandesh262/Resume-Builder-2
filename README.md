# AI Resume Builder

A modern, AI-powered resume builder application that helps users create, analyze, and optimize their professional resumes with ease. The platform offers a user-friendly interface for uploading, previewing, and managing resumes with powerful AI-driven analysis.

## ✨ Features

- **Resume Upload & Preview** - Easily upload and preview your PDF resumes
- **AI-Powered Analysis** - Get instant feedback on your resume content
- **Cover Letter Generation** - Create tailored cover letters for job applications
- **Modern UI/UX** - Clean, responsive design for all devices
- **Secure Authentication** - User accounts with secure login
- **Resume History** - Track and manage multiple versions of your resume

## 🚀 Tech Stack

### Frontend
- **React 19** - Frontend library for building user interfaces
- **React Router** - For client-side routing
- **PDF.js & PDF-lib** - For PDF rendering and manipulation
- **Framer Motion** - For smooth animations and transitions
- **React Hot Toast** - For user notifications
- **Tailwind CSS** - For responsive styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - For authentication
- **Bcrypt** - For password hashing

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- MongoDB (v7.0 or higher)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Resume-Builder-2.git
   cd Resume-Builder-2
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the development servers**
   - In the backend directory:
     ```bash
     npm run dev
     ```
   - In the frontend directory:
     ```bash
     npm start
     ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## 📝 Usage

1. **Sign up** for a new account or **log in** if you already have one
2. **Upload** your existing resume or start from scratch
3. **Preview** and edit your resume using the built-in tools
4. **Generate** a cover letter based on job descriptions
5. **Download** your polished resume in PDF format

## 🌟 Features in Development

- [ ] Advanced AI resume scoring
- [ ] Job matching based on resume content
- [ ] Multi-language support
- [ ] Resume template gallery
- [ ] Integration with job boards

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- And all other open-source libraries used in this project
