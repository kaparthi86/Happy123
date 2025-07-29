# SocialHub - Modern Social Media App

A feature-rich social media application built with Next.js, TypeScript, and Tailwind CSS. This app includes all the essential social media features including posts, interactions, media uploads, and community notes for fact-checking.

## 🚀 Features

### Core Social Media Features
- **Post Creation**: Create posts with text, photos, and videos
- **Rich Media Support**: Upload and display images and videos with previews
- **Interactive Posts**: Like, share, and comment on posts
- **Nested Comments**: Reply to comments with full threading support
- **Real-time Interactions**: Dynamic like counts and engagement metrics

### Community Features
- **Community Notes**: Fact-checking system similar to Twitter's Community Notes
- **Note Voting**: Vote on community notes (helpful/not helpful)
- **Source Citations**: Add sources and references to community notes
- **Trending Topics**: Display trending hashtags and topics
- **User Suggestions**: Discover new users to follow
- **Communities**: Join topic-based communities

### User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Rich Header**: Search functionality, notifications, and user menu
- **Sidebar**: Trending topics, suggested users, and communities
- **Mobile Responsive**: Optimized for all screen sizes
- **File Upload**: Drag-and-drop file uploads with validation
- **Character Limits**: Tweet-like character counting

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular, reusable React components
- **State Management**: Local state with React hooks
- **Mock Data**: Comprehensive mock data for demonstration
- **Utility Functions**: Helper functions for formatting and validation

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Utilities**: Custom utility functions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── Header.tsx           # Main navigation header
│   ├── CreatePost.tsx       # Post creation component
│   ├── PostCard.tsx         # Individual post display
│   ├── CommunityNote.tsx    # Community notes component
│   ├── CommentsModal.tsx    # Comments modal with threading
│   └── Sidebar.tsx          # Right sidebar with trending/suggestions
├── data/
│   └── mockData.ts          # Mock data for demonstration
├── lib/
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript type definitions
```

## 🎯 Key Components

### PostCard
- Displays posts with author information
- Handles media (images/videos) with proper aspect ratios
- Interactive buttons for like, share, comment
- Community notes integration
- Responsive design for all screen sizes

### CreatePost
- Rich text input with character counting
- File upload for images and videos
- Media preview with removal options
- Expandable interface for better UX

### CommunityNote
- Fact-checking information display
- Voting system with visual feedback
- Source citations with external links
- Status indicators (approved, pending, rejected)

### CommentsModal
- Sliding modal interface
- Nested comment threading
- Real-time comment addition
- Like functionality for comments

## 🎨 Design Features

- **Clean Interface**: Modern, minimalist design
- **Consistent Spacing**: Tailwind CSS utility classes
- **Interactive Elements**: Hover states and smooth transitions
- **Visual Hierarchy**: Clear typography and layout structure
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 📱 Responsive Design

The app is fully responsive and works seamlessly across:
- **Desktop**: Full feature set with sidebar
- **Tablet**: Optimized layout with collapsible elements
- **Mobile**: Touch-friendly interface with stacked layout

## 🔧 Customization

### Adding New Features
1. Create new components in `src/components/`
2. Add types to `src/types/index.ts`
3. Update mock data in `src/data/mockData.ts`
4. Integrate with existing components

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Use Tailwind utility classes for component styling

## 🚀 Future Enhancements

- **Real Backend Integration**: Connect to actual API endpoints
- **User Authentication**: Login/signup functionality
- **Real-time Updates**: WebSocket integration for live updates
- **Push Notifications**: Browser notifications for interactions
- **Advanced Search**: Full-text search with filters
- **Direct Messaging**: Private messaging system
- **Story Features**: Instagram-like story functionality
- **Live Streaming**: Video streaming capabilities

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help with the project, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
