# Prompt Library

A modern, client-side web application for managing and organizing your AI prompts. Built with Vue 3, TypeScript, and SQLite (running in the browser via WebAssembly).

## Features

- **Create, Edit, Delete Prompts**: Full CRUD operations for your prompt library.
- **Categorization**: Organize prompts by custom categories.
- **Tagging System**: Add multiple tags to prompts for flexible organization.
- **Search & Filter**: Real-time search across titles, content, and tags.
- **Favorites**: Mark important prompts as favorites for quick access.
- **Copy to Clipboard**: One-click copying of prompt content.
- **Export/Import**: Backup your entire library or transfer data between devices.
- **Persistent Storage**: Data is stored locally in your browser using IndexedDB.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Dark/Light Mode**: Toggle between themes for comfortable viewing.

## Tech Stack

- **Frontend Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Database**: [SQLite](https://www.sqlite.org/index.html) via [sql.js](https://sql.js.org/) (WebAssembly)
- **Persistence**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb)
- **Icons**: [Lucide Icons](https://lucide.dev/)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── PromptCard.vue
│   ├── PromptModal.vue
│   ├── SearchBar.vue
│   └── ...
├── composables/      # Composable functions
├── db/               # Database utilities and schema
│   └── index.ts
├── router/           # Vue Router configuration
├── stores/           # Pinia stores
│   └── promptStore.ts
├── views/            # Page components
│   ├── DashboardView.vue
│   ├── FavoritesView.vue
│   └── ...
├── App.vue           # Root component
└── main.ts           # Application entry point
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd prompt-library
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist/` directory.

## Usage Guide

### Adding a Prompt
1. Click the "New Prompt" button on the dashboard.
2. Fill in the title, content, category, and tags.
3. Click "Save" to store the prompt.

### Searching Prompts
- Use the search bar at the top to filter prompts by title, content, or tags.
- Filter by category using the sidebar navigation.

### Managing Categories
- Create new categories when adding/editing a prompt.
- Click on a category in the sidebar to view all prompts within it.

### Exporting/Importing Data
- Go to Settings.
- Click "Export Database" to download a backup file.
- Click "Import Database" to restore from a backup file.

## How It Works

### Client-Side SQLite
This application uses `sql.js`, a JavaScript implementation of SQLite compiled to WebAssembly. This allows you to run a full SQLite database directly in your browser without needing a backend server.

### Data Persistence
Since WebAssembly memory is volatile (data is lost on page refresh), the application automatically saves the SQLite database file to the browser's IndexedDB storage after every write operation. On load, the database is restored from IndexedDB.

## Browser Compatibility

Works on all modern browsers that support:
- WebAssembly
- IndexedDB
- ES6+

Recommended browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
