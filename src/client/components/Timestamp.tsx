import React from 'react';

interface TimestampProps {
  value: Date | string | undefined | null;
}

const padDigit = (d: number): string => {
  if (d < 10) {
    return `0${d}`;
  }
  return `${d}`;
};

const Timestamp = (props: TimestampProps): React.ReactElement => {
  if (props.value === undefined || props.value === null || props.value === '') {
    return <span>--</span>;
  }

  const d = new Date(props.value);

  return (
    <span>
      {d.getFullYear()}-{padDigit(d.getMonth() + 1)}-{padDigit(d.getDate() + 1)}
    </span>
  );
};

export default Timestamp;
