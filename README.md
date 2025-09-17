# PodcastPilot 🎙️

**Transform articles into engaging conversations**

PodcastPilot is an AI-powered application that converts written content into natural, engaging podcast conversations between two hosts. Using advanced AI technologies, it generates realistic dialogue and synthesizes high-quality audio with professional voices.

## ✨ Features

- **🤖 AI Script Generation**: Uses OpenAI GPT-5 to create natural conversations between two hosts
- **🎵 Voice Synthesis**: ElevenLabs integration for realistic text-to-speech audio
- **🎭 Multiple Voices**: Choose from professional male and female voice options
- **⚙️ Customizable Settings**: Adjust podcast length, tone, and voice preferences
- **📊 Real-time Progress**: Track generation progress with live status updates
- **🎧 Audio Player**: Built-in player with playback controls and speed adjustment
- **💾 Download Options**: Export podcasts in MP3 and M4A formats
- **📱 Modern UI**: Clean, responsive interface built with React and shadcn/ui
- **📄 Document Upload**: Support for .docx and .txt file uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sirakinb/PodcastPilot.git
   cd PodcastPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
   PORT=4000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4000`

## 🎯 How to Use

1. **Input Content**: Paste your article, blog post, or any text content (minimum 100 characters)
2. **Choose Settings**:
   - **Target Length**: Brief (3-5 min), Standard (5-8 min), Detailed (8-12 min), or In-depth (12-15 min)
   - **Discussion Tone**: Professional, Conversational, Casual, or Academic
   - **Voice Selection**: Pick male and female host voices
3. **Generate**: Click "Generate Podcast" and watch the real-time progress
4. **Listen & Download**: Play your generated podcast and download in your preferred format

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe server code
- **OpenAI API** - GPT-5 for script generation
- **ElevenLabs API** - Voice synthesis
- **Multer** - File upload handling

## 📁 Project Structure

```
PodcastPilot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and config
├── server/                 # Express backend
│   ├── services/           # Business logic
│   │   ├── openai.ts      # OpenAI integration
│   │   └── tts.ts         # ElevenLabs integration
│   ├── routes.ts          # API endpoints
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
└── generated_audio/        # Generated podcast files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## 🎭 Voice Options

### Male Voices
- **David** - Professional, authoritative
- **James** - Warm, conversational
- **Michael** - Clear, engaging
- **Ryan** - Dynamic, energetic

### Female Voices
- **Sarah** - Professional, articulate
- **Emma** - Friendly, approachable
- **Lisa** - Sophisticated, clear
- **Rachel** - Warm, engaging

## 📊 API Endpoints

- `POST /api/generate-podcast` - Start podcast generation
- `GET /api/podcast/:id/status` - Check generation status
- `GET /api/audio/:fileName` - Stream audio files
- `POST /api/upload-document` - Upload document files
- `POST /api/analyze-content` - Analyze content structure
- `GET /api/podcasts/recent` - Get recent generations

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

The application serves both the API and frontend from a single server, making deployment simple and efficient.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-5 language model
- **ElevenLabs** for realistic voice synthesis
- **shadcn/ui** for beautiful UI components
- **Vercel** for the amazing developer experience

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/sirakinb/PodcastPilot/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**© 2025 PodcastPilot. Transform articles into engaging conversations.**

Made with ❤️ by [@sirakinb](https://github.com/sirakinb)
