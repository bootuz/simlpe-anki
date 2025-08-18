// Design System - Main Barrel Export

// Tokens
export * from './tokens';

// Components  
export * from './components';

// Utils
export * from './utils';

// Re-export commonly used items for convenience
export {
  // Tokens
  colorTokens,
  semanticColors,
  textStyles,
  typographyClasses,
  spacing,
  shadows,
  
  // Components
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  Heading,
  Text,
  Caption,
  
  // Utils
  getTheme,
  setTheme,
  toggleTheme,
  cn,
} from './tokens';

export { Button, buttonVariants } from './components/Button';
export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription,
  cardVariants 
} from './components/Card';
export { Heading, Text, Caption } from './components/Typography';
export { getTheme, setTheme, toggleTheme } from './utils/theme';
export { commonVariants, stateVariants } from './utils/variants';