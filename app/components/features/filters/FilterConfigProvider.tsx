import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface FilterConfigProviderProps {
  children: (props: { filters: FilterGroup[] }) => React.ReactNode;
}

export async function FilterConfigProvider({ children }: FilterConfigProviderProps) {
  // TODO: Fetch from CMS in L5
  const mockFilters: FilterGroup[] = [
    {
      field: 'brand',
      label: 'Brand',
      options: [
        { value: 'sennheiser', label: 'Sennheiser' },
        { value: 'sony', label: 'Sony' },
        { value: 'focal', label: 'Focal' },
        { value: 'beyerdynamic', label: 'Beyerdynamic' },
      ],
    },
    {
      field: 'driverType',
      label: 'Driver Type',
      options: [
        { value: 'dynamic', label: 'Dynamic' },
        { value: 'planar', label: 'Planar Magnetic' },
        { value: 'electrostatic', label: 'Electrostatic' },
      ],
    },
  ];

  return <>{children({ filters: mockFilters })}</>;
}
