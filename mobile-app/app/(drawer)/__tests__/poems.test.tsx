import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import PoemsScreen from '../poems';
import { poemsApi } from '../../../api/poems';

// Mock the API
jest.mock('../../../api/poems', () => ({
  poemsApi: {
    getPoems: jest.fn(),
    getTags: jest.fn(),
    deletePoem: jest.fn(),
  },
}));

const mockPoems = [
  {
    _id: '1',
    title: 'Test Poem 1',
    content: 'Content 1',
    tags: ['love'],
    authorId: { _id: 'user-1', firstName: 'Test' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Test Poem 2',
    content: 'Content 2',
    tags: ['sad'],
    authorId: { _id: 'user-2', firstName: 'Partner' },
    createdAt: new Date().toISOString(),
  },
];

const mockAuthorStats = [
  { _id: 'user-1', count: 1, firstName: 'Test' },
  { _id: 'user-2', count: 1, firstName: 'Partner' },
];

describe('PoemsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (poemsApi.getPoems as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        poems: mockPoems,
        totalCount: 2,
        authorStats: mockAuthorStats,
      },
    });
    (poemsApi.getTags as jest.Mock).mockResolvedValue({
      success: true,
      data: ['love', 'sad'],
    });
  });

  it('renders correctly and fetches poems', async () => {
    const { getByText } = render(<PoemsScreen />);

    expect(getByText('Şiirlerimiz')).toBeTruthy();

    await waitFor(() => {
      expect(poemsApi.getPoems).toHaveBeenCalled();
      expect(getByText('Test Poem 1')).toBeTruthy();
      expect(getByText('Test Poem 2')).toBeTruthy();
    });
  });

  it('filters by tag when tag is pressed', async () => {
    const { getAllByText } = render(<PoemsScreen />);

    await waitFor(() => {
      expect(getAllByText('#love').length).toBeGreaterThan(0);
    });

    fireEvent.press(getAllByText('#love')[0]);

    await waitFor(() => {
      expect(poemsApi.getPoems).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'love' }),
        'fake-token'
      );
    });
  });

  it('filters by author when author stat is pressed', async () => {
    const { getAllByText } = render(<PoemsScreen />);

    await waitFor(() => {
      expect(getAllByText('Partner').length).toBeGreaterThan(0);
    });

    fireEvent.press(getAllByText('Partner')[0]);

    await waitFor(() => {
      expect(poemsApi.getPoems).toHaveBeenCalledWith(
        expect.objectContaining({ author: 'user-2' }),
        'fake-token'
      );
    });
  });

  it('opens new poem modal when write button is pressed', async () => {
    const { getByText } = render(<PoemsScreen />);

    await waitFor(() => {
      const writeBtn = getByText('Yaz');
      fireEvent.press(writeBtn);
    });

    expect(getByText('Yeni Şiir Yaz')).toBeTruthy();
  });

  it('navigates to tips page when tip card is pressed', async () => {
    const { getByText } = render(<PoemsScreen />);

    fireEvent.press(getByText('Yazma İpuçları'));
    expect((global as any).mockRouter.push).toHaveBeenCalledWith('/poems-tips');

    fireEvent.press(getByText('Romantik Sözler'));
    expect((global as any).mockRouter.push).toHaveBeenCalledWith('/poems-romantic');
  });

  it('shows error toast when API fails', async () => {
    (poemsApi.getPoems as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<PoemsScreen />);

    await waitFor(() => {
      expect((global as any).mockToast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        message: 'Şiirler yüklenirken bir sorun oluştu.',
      }));
    });
  });

  it('shows empty state when no poems found', async () => {
    (poemsApi.getPoems as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        poems: [],
        totalCount: 0,
        authorStats: [],
      },
    });

    const { getByText } = render(<PoemsScreen />);

    await waitFor(() => {
      expect(getByText('Henüz Şiir Yok')).toBeTruthy();
    });
  });

  it('triggers delete confirmation and calls API on confirm', async () => {
    const { getAllByTestId } = render(<PoemsScreen />);
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert');

    await waitFor(() => {
      expect(getAllByTestId('poem-card').length).toBeGreaterThan(0);
    });

    // Find delete button on first card
    const deleteBtn = getAllByTestId('delete-poem-btn')[0];
    fireEvent.press(deleteBtn);

    expect(alertSpy).toHaveBeenCalledWith(
      'Şiiri Sil',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Vazgeç' }),
        expect.objectContaining({ text: 'Sil' }),
      ])
    );

    // Simulate pressing "Sil"
    const deleteAction = alertSpy.mock.calls[0][2]?.find(b => b.text === 'Sil');
    (poemsApi.deletePoem as jest.Mock).mockResolvedValue({ success: true });
    
    if (deleteAction?.onPress) {
      await deleteAction.onPress();
    }

    expect(poemsApi.deletePoem).toHaveBeenCalledWith('1', 'fake-token');
    expect((global as any).mockToast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      message: 'Şiir silindi.',
    }));
  });

  it('opens poem detail modal when card is pressed', async () => {
    const { getAllByTestId, getByText } = render(<PoemsScreen />);

    await waitFor(() => {
      fireEvent.press(getAllByTestId('poem-card')[0]);
    });

    // Detail modal should show content
    expect(getByText('Content 1')).toBeTruthy();
  });
});
