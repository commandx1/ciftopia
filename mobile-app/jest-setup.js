import '@testing-library/jest-native/extend-expect';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const icons = [
    'Feather', 'Pen', 'Sparkles', 'Search', 'BookOpen', 'Heart', 'Plus', 
    'ChevronRight', 'ArrowLeft', 'PenSquare', 'X', 'Send', 'Trash2', 
    'Calendar', 'Quote', 'Coffee', 'HeartCrack', 'Infinity', 'Shield', 'Bird',
    'CheckCircle2', 'Circle', 'Clock', 'Map', 'Home', 'Wallet', 'PlusCircle',
    'Film', 'Utensils', 'Check', 'Edit2', 'Star', 'Loader2', 'Info',
    'Filter', 'ChevronDown', 'HeartOff', 'MapPin', 'Smile', 'Frown', 'Mountain',
    'AlignLeft', 'Images', 'CloudUpload', 'PenLine', 'Database', 'ArrowDown',
    'StickyNote', 'Pin', 'History', 'MessageCircle', 'ShieldCheck', 'CreditCard',
    'Search', 'Lock', 'LockOpen', 'Hourglass', 'Activity', 'ChevronRight', 'User'
  ];
  const mockIcons = {};
  icons.forEach(icon => {
    mockIcons[icon] = (props) => React.createElement(View, { ...props, testID: `icon-${icon}` });
  });
  return mockIcons;
});

// Persistent mocks for inspection
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useSegments: () => ([]),
}));

const mockToast = {
  show: jest.fn(),
};

jest.mock('./components/ui/ToastProvider', () => ({
  useToast: () => mockToast,
}));

// Mock AuthContext
const mockUser = {
  _id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  accessToken: 'fake-token',
};

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock axios client
jest.mock('./api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
  LinearGradient: (props) => React.createElement(View, props),
};
});

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, props);
});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Export mocks for tests to use
global.mockRouter = mockRouter;
global.mockToast = mockToast;
global.mockUser = mockUser;
