# e-Ration PDS - Public Distribution System

A modern, secure, and intelligent Public Distribution System (PDS) for India with React + Vite frontend.

## 🚀 Features

### Three Powerful Portals

#### 1. **Citizen Portal**
- View monthly quota allocation
- Check distribution history
- Download digital receipts
- Find nearby Fair Price Shops
- File grievances online

#### 2. **Dealer Portal**
- Manage shop inventory in real-time
- Distribute rations digitally
- Request stock replenishment
- View registered citizens
- Track monthly distributions

#### 3. **Admin Portal**
- Monitor entire PDS network
- AI-powered demand forecasting
- Smart inventory management
- Approve restock requests
- Generate system-wide reports and analytics

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Backend API**: Spring Boot (Port 8080)

## 📦 Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🔐 Default Test Accounts

### Citizen
- Username: `citizen1`
- Password: `Citizen@123`

### Dealer
- Username: `dealer1`
- Password: `Dealer@123`

### Admin
- Username: `admin`
- Password: `Admin@123`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js          # API configuration
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── CitizenDashboard.jsx
│   │   ├── DealerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── NotFound.jsx
│   │   ├── Home.css
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   └── NotFound.css
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Features Breakdown

### Landing Page
- Hero section with gradient background
- Feature cards with hover animations
- Three portal descriptions
- Problems solved section
- Call-to-action sections
- Responsive footer

### Authentication
- Modern login/register forms
- Role-based registration (Citizen/Dealer/Admin)
- Conditional form fields based on role
- Form validation
- Smooth animations

### Citizen Dashboard
- Overview stats cards
- Recent distributions table
- Monthly quota view
- Distribution history
- Nearby dealers map
- Grievance filing system

### Dealer Dashboard
- Inventory management
- Stock level monitoring
- Low stock alerts
- Distribution interface
- Citizen management
- Restock request system

### Admin Dashboard
- Network-wide statistics
- AI-powered forecasting with charts
- Real-time inventory monitoring
- Dealer & citizen management
- Advanced analytics with graphs
- System settings

## 🔧 Configuration

### API Endpoint
Update the base URL in `src/api/axios.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});
```

### CORS
The gateway has been configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React CRA)
- `http://localhost:4200` (Angular)

## 📊 Charts & Visualization

- **Forecasting Charts**: Time-series line charts showing predicted demand
- **Distribution Trends**: Bar charts for monthly analytics
- **Stock Distribution**: Pie charts for inventory visualization
- **Regional Performance**: Progress bars for regional stats

## 🎯 Smart Forecasting

The Admin portal includes AI-powered demand forecasting that:
- Predicts future demand based on historical data
- Shows confidence intervals (upper/lower bounds)
- Provides actionable insights
- Recommends restock priorities

## 📱 Responsive Design

Fully responsive for:
- Desktop (1920px+)
- Laptop (1280px - 1920px)
- Tablet (768px - 1280px)
- Mobile (320px - 768px)

## 🚦 Getting Started Workflow

1. **Register** as Citizen/Dealer/Admin
2. **Login** with your credentials
3. Navigate to your role-specific dashboard
4. Explore features based on your role

### For Citizens:
1. Check your quota
2. View distribution history
3. Find nearby dealers

### For Dealers:
1. Add stock to inventory
2. Distribute rations to citizens
3. Request restocks when low

### For Admins:
1. Monitor network stats
2. View demand forecasts
3. Manage dealers & citizens
4. Analyze system performance

## 🌟 Key Highlights

- ✅ Modern, gradient-based UI design
- ✅ Smooth animations and transitions
- ✅ Role-based access control
- ✅ Real-time data updates
- ✅ Interactive charts and graphs
- ✅ Toast notifications for feedback
- ✅ Mobile-first responsive design
- ✅ Secure authentication flow

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

## 📄 License

Government of India - Digital India Initiative

---

**Built with ❤️ for a transparent and efficient Public Distribution System**
