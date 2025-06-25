// components/timestamp.jsx
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

const formatDate = (dateStr, type = 'full') => {
  const date = new Date(dateStr);

  if (type === 'relative') {
    return formatDistanceToNow(date, { addSuffix: true }); 
  }

  if (type === 'short') {
    return format(date, 'MMM d, yyyy'); 
  }

  return format(date, 'PPpp'); 
};

const Timestamp = ({ date, type = 'full' }) => {
  if (!date) return null;

  return (
    <time dateTime={date}>
      {formatDate(date, type)}
    </time>
  );
};

export default Timestamp;
