import { TipItem } from '../components/TipsCarousel';

export const carouselTips: TipItem[] = [
  {
    id: '1',
    icon: 'qrcode-scan',
    title: 'Scan QR Code',
    description: 'Find any patient instantly by scanning their QR code from the home screen',
    gradientColors: ['#667eea', '#764ba2'], // Purple gradient
    iconColor: '#667eea',
  },
  {
    id: '2',
    icon: 'magnify',
    title: 'Smart Search',
    description: 'Search by patient name, ID, or phone number for quick access',
    gradientColors: ['#f093fb', '#f5576c'], // Pink/red gradient
    iconColor: '#f5576c',
  },
  {
    id: '3',
    icon: 'file-certificate',
    title: 'Quick Certificate',
    description: 'Generate medical certificate in 1 click from patient profile',
    gradientColors: ['#4facfe', '#00f2fe'], // Blue gradient
    iconColor: '#4facfe',
  },
  {
    id: '4',
    icon: 'tune',
    title: 'Date Filters',
    description: 'Filter patients by registration year or month to find records easily',
    gradientColors: ['#43e97b', '#38f9d7'], // Green gradient
    iconColor: '#2ecc71',
  },
  {
    id: '5',
    icon: 'whatsapp',
    title: 'WhatsApp Share',
    description: 'Share patient smart cards and certificates directly to WhatsApp',
    gradientColors: ['#25D366', '#128C7E'], // WhatsApp gradient
    iconColor: '#25D366',
  },
];