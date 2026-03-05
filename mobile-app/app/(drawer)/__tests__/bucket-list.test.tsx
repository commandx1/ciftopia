import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import BucketListScreen from '../bucket-list';
import { bucketListApi } from '../../../api/bucket-list';

// Mock the API
jest.mock('../../../api/bucket-list', () => ({
  bucketListApi: {
    getBucketList: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockItems = [
  {
    _id: '1',
    title: 'Visit Paris',
    description: 'See the Eiffel Tower',
    category: 'travel',
    isCompleted: false,
    authorId: { _id: 'user-1', firstName: 'Test' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Eat Sushi',
    description: 'Best sushi in Tokyo',
    category: 'experience',
    isCompleted: true,
    authorId: { _id: 'user-2', firstName: 'Partner' },
    createdAt: new Date().toISOString(),
  },
];

describe('BucketListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bucketListApi.getBucketList as jest.Mock).mockResolvedValue(mockItems);
  });

  it('renders correctly and fetches bucket list', async () => {
    const { getByText } = render(<BucketListScreen />);

    expect(getByText('Hayallerimiz ✨')).toBeTruthy();

    await waitFor(() => {
      expect(bucketListApi.getBucketList).toHaveBeenCalled();
      expect(getByText('Visit Paris')).toBeTruthy();
      expect(getByText('Eat Sushi')).toBeTruthy();
    });
  });

  it('shows progress correctly', async () => {
    const { getByText } = render(<BucketListScreen />);

    await waitFor(() => {
      expect(getByText(/50/)).toBeTruthy(); // Matches %50
      expect(getByText(/1\/2/)).toBeTruthy(); // Matches 1/2
    });
  });

  it('toggles item completion when check button is pressed', async () => {
    const { getAllByTestId, getByText } = render(<BucketListScreen />);

    await waitFor(() => {
      expect(getByText('Visit Paris')).toBeTruthy();
    });

    // Mock successful update
    (bucketListApi.update as jest.Mock).mockResolvedValue({
      ...mockItems[0],
      isCompleted: true,
    });

    const toggleBtn = getAllByTestId('toggle-complete-btn')[0];
    fireEvent.press(toggleBtn);

    await waitFor(() => {
      expect(bucketListApi.update).toHaveBeenCalledWith('1', { isCompleted: true }, 'fake-token');
    });
  });

  it('shows empty state when no dreams found', async () => {
    (bucketListApi.getBucketList as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<BucketListScreen />);

    await waitFor(() => {
      expect(getByText('Birlikte neler yapmak istiyorsunuz?')).toBeTruthy();
    });
  });
});
