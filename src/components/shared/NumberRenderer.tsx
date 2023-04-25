import React, { useMemo } from 'react';
import SimplifyNumber from 'simplify-number';

export enum NumberRendererTypes {
  GOLD,
  ITEMS
};

export type NumberRendererProps = {
  value: number,
  prefix?: string
  type?: NumberRendererTypes
};
const numberCfg = {
  abbrev: ['k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n'],
  decimal: 3,
}

function NumberRenderer({value, prefix = ''}: NumberRendererProps) {
  const updatedValue = useMemo(() => value < 100000 ? value : SimplifyNumber(value, numberCfg), [value]);
  return (
    <span>{prefix}{updatedValue}</span>
  );
}

export default NumberRenderer;