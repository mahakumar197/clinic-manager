import React, { useState, ReactNode } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CommonIcon from './CommonIcon';
import { LucideIconName } from './lucideIcons';

interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface TabItem {
  label: string;
  content: ReactNode;
  icon?: LucideIconName;
  iconSize?: number;
  disabled?: boolean;
}

interface CommonTabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  header?: ReactNode;
  hideBorder?: boolean;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  indicatorColor?: 'primary' | 'secondary';
  textColor?: 'primary' | 'secondary' | 'inherit';
  onChange?: (index: number) => void;
}

export const CommonTabs: React.FC<CommonTabsProps> = ({
  tabs,
  defaultTab = 0,
  header,
  hideBorder = false,
  variant = 'standard',
  indicatorColor = 'primary',
  textColor = 'primary',
  onChange,
}) => {
  const [value, setValue] = useState(defaultTab);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: hideBorder ? 0 : 1,
          borderColor: 'divider',
          "@media (max-width: 375px)": {
            flexDirection: "column",
            alignItems: "flex-start",
          },
        }}
      >
        {header && <Box sx={{ pb: 1 }}>{header}</Box>}
        <Tabs
          value={value}
          onChange={handleChange}
          variant={variant}
          indicatorColor={indicatorColor}
          textColor={textColor}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon ? <CommonIcon name={tab.icon} size={tab.iconSize || 18} /> : undefined}
              iconPosition="start"
              disabled={tab.disabled}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                minHeight: '48px',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};
