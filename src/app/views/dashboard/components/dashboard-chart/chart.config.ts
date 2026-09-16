import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register all controllers
Chart.register(
  LineController,
  BarController,
  DoughnutController,
  PieController
);

// Register all elements
Chart.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement
);

// Register all scales
Chart.register(
  CategoryScale,
  LinearScale,
  TimeScale
);

// Register plugins
Chart.register(
  Title,
  Tooltip,
  Legend,
  Filler
);

export { Chart };
