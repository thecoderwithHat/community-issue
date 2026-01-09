# CI Reporter 🏙️

An AI-powered civic issue reporting & resolution tracking platform that bridges the gap between citizens and authorities. Built with Next.js, Firebase, and Google Gemini AI.

![CI Reporter](https://img.shields.io/badge/Status-Production--Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange)
![Gemini](https://img.shields.io/badge/Google-Gemini-blue)

## ✨ Features

### 🏠 For Citizens (Users)
- **Multi-Input Reporting**: Report issues via text, image, or voice
- **AI-Powered Analysis**: Automatic issue classification, severity assessment, and keyword extraction using Google Gemini 1.5 Flash
- **Smart Routing**: Intelligent department routing based on issue type and location
- **Real-Time Tracking**: Track complaint status from submission to resolution
- **Location Services**: GPS-based location tagging for accurate issue mapping
- **Complaint Timeline**: Detailed status updates and resolution tracking

### 🏛️ For Officials
- **Official Dashboard**: Comprehensive dashboard for managing civic issues
- **Issue Clustering**: Group similar issues by location and type
- **Priority Queue**: Severity-based issue prioritization
- **Authority Routing**: Automated routing to appropriate departments
- **Analytics & Insights**: AI-generated summaries and impact metrics
- **Resolution Tracking**: Monitor and update issue statuses

### 🔐 Authentication & Security
- **Multi-Authentication**: Google Sign-In and Email/Password authentication
- **Role-Based Access**: Separate interfaces for citizens and officials
- **Protected Routes**: Secure access to all features
- **User Profiles**: Role-based user management with Firestore

### 🤖 AI-Powered Features
- **Issue Classification**: Automatic categorization (Pothole, Garbage, Streetlight, etc.)
- **Severity Assessment**: High/Medium/Low priority classification
- **Keyword Extraction**: Intelligent keyword generation for better searchability
- **Authority Routing**: Smart department assignment based on issue type
- **Daily Summaries**: AI-generated official reports and insights

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Gemini API Key**:
   - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Firebase Project**:
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore Database
   - Generate a service account key for server-side operations

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd community-issue
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here

   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Server-side)
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
   FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
community-issue/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── classify/            # Issue classification endpoint
│   │   └── official/            # Official dashboard APIs
│   ├── login/                   # Authentication pages
│   ├── signup/
│   ├── report/                  # Issue reporting interface
│   ├── official/                # Official dashboard
│   └── page.tsx                 # Landing page
├── components/                  # Reusable components
│   ├── auth/                    # Authentication components
│   └── ProtectedRoute.tsx       # Route protection wrapper
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Client-side Firebase config
│   ├── firebaseAdmin.ts         # Server-side Firebase config
│   └── routing.ts               # Authority routing logic
└── types/                       # TypeScript type definitions
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database for issue persistence
- **Firebase Admin SDK** - Server-side operations

### AI & External Services
- **Google Gemini 1.5 Flash** - AI-powered issue analysis
- **Google Maps API** - Location services (optional)

## 🔧 API Endpoints

### Issue Classification
```
POST /api/classify
```
Analyzes issue descriptions and images, returns classification, routing, and tracking data.

**Request Body:**
```json
{
  "description": "Large pothole on Main Street",
  "image": "base64_encoded_image",
  "location": { "lat": 12.9714, "lng": 77.6408 }
}
```

**Response:**
```json
{
  "issueType": "Pothole",
  "severity": "High",
  "urgency": "Immediate",
  "keywords": ["pothole", "road", "safety"],
  "authority": "Public Works Department",
  "complaintId": "ISS-12345",
  "status": "Submitted"
}
```

### Official Summary
```
POST /api/official/summary
```
Generates AI-powered summaries for official dashboards.

## 🎯 Usage Examples

### Reporting an Issue
1. Navigate to `/report`
2. Enter issue description or upload an image
3. Allow location access for accurate mapping
4. Submit - AI automatically classifies and routes the issue
5. Track progress through the complaint timeline

### Official Dashboard
1. Navigate to `/official` (requires official role)
2. View priority issues and clusters
3. Monitor resolution progress
4. Access AI-generated insights

## 🔐 Authentication Flow

1. **Sign Up/Login**: Users can authenticate via Google or Email/Password
2. **Role Selection**: During signup, users choose between "Resident" or "Official"
3. **Protected Routes**: All features require authentication
4. **Role-Based Access**: Officials get access to dashboard features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Self-hosted with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered issue analysis
- **Firebase** for authentication and database services
- **Next.js** for the amazing React framework
- **Tailwind CSS** for beautiful styling

## 📞 Support

For support, email support@cireporter.io or join our community discussions.

---

**Built with ❤️ for better communities**
