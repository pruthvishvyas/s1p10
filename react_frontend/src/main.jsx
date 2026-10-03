import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler, ArcElement
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)