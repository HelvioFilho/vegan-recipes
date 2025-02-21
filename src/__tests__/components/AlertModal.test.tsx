import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal, Text } from 'react-native';
import { AlertModal } from '@/components/AlertModal';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: React.ComponentProps<typeof Text>) => <Text {...props} />,
  };
});

describe('AlertModal Component', () => {
  const message = 'Test alert message';
  const ChildComponent = () => <Text>Child Content</Text>;

  it('renders correctly when showModal is true', () => {
    const setShowModalMock = jest.fn();
    const { getByText } = render(
      <AlertModal message={message} showModal={true} setShowModal={setShowModalMock}>
        <ChildComponent />
      </AlertModal>
    );

    expect(getByText(message)).toBeTruthy();
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('does not render modal content when showModal is false', () => {
    const setShowModalMock = jest.fn();
    const { queryByText } = render(
      <AlertModal message={message} showModal={false} setShowModal={setShowModalMock}>
        <ChildComponent />
      </AlertModal>
    );

    expect(queryByText(message)).toBeNull();
    expect(queryByText('Child Content')).toBeNull();
  });

  it('calls setShowModal(false) when the close button is pressed', () => {
    const setShowModalMock = jest.fn();
    const { getByRole } = render(
      <AlertModal message={message} showModal={true} setShowModal={setShowModalMock}>
        <ChildComponent />
      </AlertModal>
    );

    const closeButton = getByRole('button');
    fireEvent.press(closeButton);
    expect(setShowModalMock).toHaveBeenCalledWith(false);
  });

  it('calls setShowModal(false) when onRequestClose is triggered', () => {
    const setShowModalMock = jest.fn();
    const { UNSAFE_getByType } = render(
      <AlertModal message={message} showModal={true} setShowModal={setShowModalMock}>
        <ChildComponent />
      </AlertModal>
    );

    const modal = UNSAFE_getByType(Modal);
    modal.props.onRequestClose();
    expect(setShowModalMock).toHaveBeenCalledWith(false);
  });
});
