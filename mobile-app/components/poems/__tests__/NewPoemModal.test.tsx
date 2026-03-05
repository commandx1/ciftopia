import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewPoemModal from '../NewPoemModal';
import { poemsApi } from '../../../api/poems';

// Mock the API
jest.mock('../../../api/poems', () => ({
  poemsApi: {
    createPoem: jest.fn(),
    updatePoem: jest.fn(),
  },
}));

describe('NewPoemModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for new poem', () => {
    const { getByText, getByPlaceholderText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(getByText('Yeni Şiir Yaz')).toBeTruthy();
    expect(getByPlaceholderText('Şiirinize bir başlık verin...')).toBeTruthy();
  });

  it('renders correctly for editing poem', () => {
    const editingPoem = {
      _id: '1',
      title: 'Existing Title',
      content: 'Existing Content',
      tags: ['Aşk'],
    };

    const { getByText, getByDisplayValue } = render(
      <NewPoemModal 
        visible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        editingPoem={editingPoem}
      />
    );

    expect(getByText('Şiiri Düzenle')).toBeTruthy();
    expect(getByDisplayValue('Existing Title')).toBeTruthy();
    expect(getByDisplayValue('Existing Content')).toBeTruthy();
  });

  it('validates empty fields', async () => {
    const { getByText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const submitBtn = getByText('Paylaş');
    fireEvent.press(submitBtn);

    expect(poemsApi.createPoem).not.toHaveBeenCalled();
    expect((global as any).mockToast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      message: 'Başlık ve içerik boş bırakılamaz.',
    }));
  });

  it('calls createPoem API and handles success', async () => {
    (poemsApi.createPoem as jest.Mock).mockResolvedValue({ success: true });

    const { getByText, getByPlaceholderText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('Şiirinize bir başlık verin...'), 'New Title');
    fireEvent.changeText(getByPlaceholderText('Duygularınızı kağıda dökün...'), 'New Content');
    
    // Select a tag
    fireEvent.press(getByText('Aşk'));

    fireEvent.press(getByText('Paylaş'));

    await waitFor(() => {
      expect(poemsApi.createPoem).toHaveBeenCalledWith(
        {
          title: 'New Title',
          content: 'New Content',
          tags: ['Aşk'],
        },
        'fake-token'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls updatePoem API and handles success', async () => {
    (poemsApi.updatePoem as jest.Mock).mockResolvedValue({ success: true });
    const editingPoem = { _id: '1', title: 'Old Title', content: 'Old Content', tags: [] };

    const { getByText, getByDisplayValue } = render(
      <NewPoemModal 
        visible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        editingPoem={editingPoem}
      />
    );

    fireEvent.changeText(getByDisplayValue('Old Title'), 'Updated Title');

    fireEvent.press(getByText('Güncelle'));

    await waitFor(() => {
      expect(poemsApi.updatePoem).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'Updated Title' }),
        'fake-token'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('toggles tags correctly', async () => {
    (poemsApi.createPoem as jest.Mock).mockResolvedValue({ success: true });
    const { getByText, getByPlaceholderText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('Şiirinize bir başlık verin...'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Duygularınızı kağıda dökün...'), 'Content');

    // Toggle on
    fireEvent.press(getByText('Aşk'));
    fireEvent.press(getByText('Özlem'));
    // Toggle off
    fireEvent.press(getByText('Aşk'));

    fireEvent.press(getByText('Paylaş'));

    await waitFor(() => {
      expect(poemsApi.createPoem).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['Özlem'],
        }),
        'fake-token'
      );
    });
  });

  it('handles API error response', async () => {
    (poemsApi.createPoem as jest.Mock).mockResolvedValue({ success: false, message: 'Server error' });

    const { getByText, getByPlaceholderText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('Şiirinize bir başlık verin...'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Duygularınızı kağıda dökün...'), 'Content');
    fireEvent.press(getByText('Paylaş'));

    await waitFor(() => {
      expect((global as any).mockToast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        message: 'Server error',
      }));
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles unexpected catch error', async () => {
    (poemsApi.createPoem as jest.Mock).mockRejectedValue(new Error('Network fail'));

    const { getByText, getByPlaceholderText } = render(
      <NewPoemModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('Şiirinize bir başlık verin...'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Duygularınızı kağıda dökün...'), 'Content');
    fireEvent.press(getByText('Paylaş'));

    await waitFor(() => {
      expect((global as any).mockToast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        message: 'Bir sorun oluştu.',
      }));
    });
  });
});
