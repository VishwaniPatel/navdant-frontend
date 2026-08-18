import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../utils/types/navigation';
// import { RootStackParamList } from '../screens/PatientRegistrationForm';


export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// export const navigateToLogin = () => {
//   if (!navigationRef.isReady()) {
//     console.warn('⚠️ Navigation ref not ready');
//     return;
//   }

//   try {
//     // Now TypeScript knows "Login" is a valid route name
//     navigationRef.navigate('Login');
//     console.log('✅ Navigated to Login');
//   } catch (error) {
//     console.error('❌ Navigation failed:', error);
//     // Optional fallback: use reset
//     try {
//       navigationRef.reset({
//         index: 0,
//         routes: [{ name: 'Login' }],
//       });
//     } catch (fallbackError) {
//       console.error('❌ Reset also failed:', fallbackError);
//     }
//   }
// };