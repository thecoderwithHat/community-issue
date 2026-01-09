# AI Community Issue Reporter 🏙️

An AI-powered civic issue reporting & resolution tracking platform.

## Features

- **Multi-Input Issue Reporting**: Report via Text and Image (Voice coming soon).
- **AI-Based Classification**: Automatically identifies issue type, severity, urgency, and responsible department using Google Gemini.
- **Smart Location Tagging**: Captures GPS coordinates for accurate tracking.
- **Routing Logic**: Suggests automatic routing based on AI analysis.

## Getting Started

### Prerequisites

1.  **Google Gemini API Key**: 
    - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Create a `.env.local` file in the root directory and add:
      ```bash
      GEMINI_API_KEY=your_api_key_here
      ```

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the reporter in action.

## Tech Stack

- **Framework**: Next.js (App Router)
- **AI**: Google Gemini (via `@google/generative-ai`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
