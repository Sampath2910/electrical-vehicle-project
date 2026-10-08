'use client';

import React from 'react';

interface RfidTapSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTapSuccess?: () => void;
  cardIdentifier?: string;
}

export const RfidTapSimulatorModal: React.FC<RfidTapSimulatorModalProps> = () => {
  return null; // RFID System decommissioned - replaced with Dynamic QR & Online UPI Payments
};
