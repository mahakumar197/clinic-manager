import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader } from '@mui/material';
import { ReactNode } from 'react';

interface CustomCardProps extends MuiCardProps {
  title?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
}

/**
 * Custom Card component wrapper around MUI Card
 * Provides consistent card styling with optional title
 */
const Card = ({ title, headerAction, noPadding = false, children, ...props }: CustomCardProps) => {
  return (
    <MuiCard
      {...props}
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
        ...props.sx,
      }}
    >
      {title && <CardHeader title={title} action={headerAction} />}
      <CardContent sx={{ p: noPadding ? 0 : 3 }}>{children}</CardContent>
    </MuiCard>
  );
};

export default Card;