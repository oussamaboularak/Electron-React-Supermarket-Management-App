# Market Manager

A comprehensive supermarket management application built with Electron.js, React.js, and Tailwind CSS.

## Features

- ✅ **Bilingual Support**: Arabic (RTL) and English (LTR) with automatic text direction switching
- ✅ **Dark/Light Mode**: Toggle between themes with persistent settings
- ✅ **Professional UI**: Modern, responsive design using Tailwind CSS
- ✅ **Dashboard**: Interactive charts and statistics using Recharts
- ✅ **Product Management**: Complete CRUD operations with search and filtering
- ✅ **Sales & POS**: Point-of-sale system with barcode scanning and invoice printing
- ✅ **Reports**: Comprehensive analytics and data visualization
- ✅ **Settings**: Configurable store information and data import/export
- ✅ **Local Database**: SQLite for offline data storage
- ✅ **Toast Notifications**: User-friendly alerts and confirmations
- ✅ **Responsive Design**: Works on all screen sizes including tablets

## Technology Stack

- **Frontend**: React.js with JSX, Tailwind CSS
- **Desktop Framework**: Electron.js
- **State Management**: Zustand
- **Database**: SQLite with better-sqlite3
- **Internationalization**: i18next
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd market-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Development mode**:

   **Option A - Automatic (Windows):**
   ```bash
   start-app.bat
   ```

   **Option B - Manual:**
   ```bash
   # Terminal 1: Start React development server
   npm start

   # Terminal 2: Start Electron (after React server is running)
   npm run electron
   ```

   **Option C - Combined (may have issues):**
   ```bash
   npm run electron-dev
   ```

4. **Build for production**:
   ```bash
   npm run electron-pack
   ```

## Project Structure

```
market-manager/
├── public/
│   ├── electron.js          # Electron main process
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Layout/        # Layout components (Header, Sidebar)
│   │   ├── Products/      # Product-related components
│   │   └── Sales/         # Sales-related components
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.jsx  # Dashboard with charts
│   │   ├── Products.jsx   # Product management
│   │   ├── Sales.jsx      # POS system
│   │   ├── Reports.jsx    # Analytics and reports
│   │   └── Settings.jsx   # Application settings
│   ├── store/             # Zustand state management
│   │   ├── useAppStore.js     # App-wide state
│   │   ├── useProductStore.js # Product management
│   │   └── useSalesStore.js   # Sales management
│   ├── i18n/              # Internationalization
│   │   ├── i18n.js        # i18next configuration
│   │   └── locales/       # Translation files
│   ├── utils/             # Utility functions
│   │   ├── database.js    # Database operations
│   │   └── helpers.js     # Helper functions
│   ├── App.jsx            # Main App component
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md             # This file
```

## Key Features Explained

### 1. Bilingual Support
- Automatic RTL/LTR text direction switching
- Complete Arabic and English translations
- Font optimization for both languages

### 2. Dashboard Analytics
- Real-time statistics and KPIs
- Interactive charts for sales trends
- Low stock alerts and notifications

### 3. Product Management
- Add, edit, delete products with validation
- Barcode support for quick identification
- Category-based organization
- Stock level monitoring with alerts

### 4. Point of Sale (POS)
- Barcode scanning for quick product addition
- Customer information management
- Multiple payment methods (cash/card)
- Discount and tax calculations
- Invoice generation and printing

### 5. Reports & Analytics
- Sales reports with date range filtering
- Top-selling products analysis
- Category-wise sales breakdown
- Export functionality (CSV/JSON)

### 6. Settings & Configuration
- Store information management
- Theme and language preferences
- Data backup and restore
- Currency and tax rate configuration

## Database Storage

The application uses JSON file storage for data persistence:

### Storage Locations:

**Electron Mode (Desktop App):**
- **Windows**: `C:\Users\[username]\AppData\Roaming\market-manager\market-manager-data.json`
- **macOS**: `~/Library/Application Support/market-manager/market-manager-data.json`
- **Linux**: `~/.config/market-manager/market-manager-data.json`

**Browser Mode (Development):**
- Data stored in browser's `localStorage`

### Data Structure:
- **products**: Product information and inventory
- **sales**: Sales transactions with embedded items
- **settings**: Application configuration

### Accessing Database Location:
1. Go to **Settings** ⚙️ in the app
2. Scroll to **Database Information** section
3. View the file path and use **Open Location** button
4. Or check `DATABASE_LOCATION.md` for detailed instructions

## Development

### Available Scripts

- `npm start`: Start React development server
- `npm run build`: Build React app for production
- `npm run electron`: Start Electron app (requires built React app)
- `npm run electron-dev`: Start both React and Electron in development mode
- `npm run electron-pack`: Build Electron app for distribution

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routing in `App.jsx`
2. **Components**: Create in appropriate `src/components/` subdirectory
3. **State Management**: Extend existing stores or create new ones in `src/store/`
4. **Database**: Add new tables/queries in `public/electron.js` and `src/utils/database.js`
5. **Translations**: Update both `en.json` and `ar.json` in `src/i18n/locales/`

## Building for Distribution

The app can be built for Windows, macOS, and Linux:

```bash
npm run electron-pack
```

Built applications will be available in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   - The React development server will automatically ask to use another port (e.g., 3001)
   - Choose "yes" when prompted

2. **Electron not starting**:
   - Make sure the React development server is running first
   - Wait for "Compiled successfully!" message before starting Electron
   - Try running `npm run electron` manually after React server is ready

3. **Database/Storage Issues**:
   - The app uses JSON file storage in development mode
   - Data is stored in the user's app data directory
   - In browser mode, localStorage is used as fallback

4. **Build Issues**:
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`

5. **Styling Issues**:
   - Make sure Tailwind CSS is properly configured
   - Check that all CSS imports are correct

### Development Tips

- Use browser developer tools for debugging React components
- Use Electron's built-in developer tools for debugging the main process
- Check the console for any JavaScript errors
- The app works in both browser and Electron environments

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.
