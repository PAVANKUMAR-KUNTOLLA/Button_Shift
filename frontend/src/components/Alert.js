import React from 'react';
import { Alert } from 'flowbite-react';

function AlertComponent({ criticality, message }) {
  let color;

  switch (criticality) {
    case 'info':
      color = 'info';
      break;
    case 'warning':
      color = 'warning';
      break;
    case 'error':
      color = 'danger';
      break;
    case 'success':
      color = 'success';
      break;
    default:
      color = 'info';
  }

  return (
    <Alert color={color} onDismiss={() => alert('Alert dismissed!')}>
      <span className="font-medium">{message}</span>
    </Alert>
  );
}

export default AlertComponent;
