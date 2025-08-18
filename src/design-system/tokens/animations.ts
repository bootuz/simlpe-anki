// Design System Animation and Transition Tokens

export const durations = {
  instant: '0ms',
  fastest: '100ms',
  faster: '150ms',
  fast: '200ms',
  normal: '300ms',
  slow: '400ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom easing curves
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  soft: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
  // Specific use case easings
  'flip-card': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'scale-in': 'cubic-bezier(0, 0, 0.2, 1)',
  'fade-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'slide-up': 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const keyframes = {
  // Existing keyframes from tailwind.config.ts
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
  'flip-to-back': {
    '0%': { transform: 'rotateY(0deg)' },
    '50%': { transform: 'rotateY(90deg)' },
    '100%': { transform: 'rotateY(180deg)' },
  },
  'flip-to-front': {
    '0%': { transform: 'rotateY(180deg)' },
    '50%': { transform: 'rotateY(90deg)' },
    '100%': { transform: 'rotateY(0deg)' },
  },
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  
  // Additional common animations
  'scale-in': {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  'scale-out': {
    '0%': { opacity: '1', transform: 'scale(1)' },
    '100%': { opacity: '0', transform: 'scale(0.95)' },
  },
  'slide-up': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-down': {
    '0%': { opacity: '0', transform: 'translateY(-10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-left': {
    '0%': { opacity: '0', transform: 'translateX(10px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  'slide-right': {
    '0%': { opacity: '0', transform: 'translateX(-10px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  'bounce-in': {
    '0%': { opacity: '0', transform: 'scale(0.3)' },
    '50%': { opacity: '1', transform: 'scale(1.05)' },
    '70%': { transform: 'scale(0.9)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  'glow': {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  'pulse-glow': {
    '0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary) / 0.5)' },
    '50%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.8)' },
  },
  'shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'spin-slow': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  'wiggle': {
    '0%, 100%': { transform: 'rotate(-3deg)' },
    '50%': { transform: 'rotate(3deg)' },
  },
} as const;

export const animations = {
  // Existing animations
  'accordion-down': `accordion-down ${durations.fast} ${easings.out}`,
  'accordion-up': `accordion-up ${durations.fast} ${easings.out}`,
  'flip-to-back': `flip-to-back ${durations.slower} ${easings['flip-card']}`,
  'flip-to-front': `flip-to-front ${durations.slower} ${easings['flip-card']}`,
  'fade-in': `fade-in ${durations.slow} ${easings['fade-in']}`,
  
  // New animations
  'scale-in': `scale-in ${durations.fast} ${easings['scale-in']}`,
  'scale-out': `scale-out ${durations.fast} ${easings.in}`,
  'slide-up': `slide-up ${durations.normal} ${easings['slide-up']}`,
  'slide-down': `slide-down ${durations.normal} ${easings.out}`,
  'slide-left': `slide-left ${durations.normal} ${easings.out}`,
  'slide-right': `slide-right ${durations.normal} ${easings.out}`,
  'bounce-in': `bounce-in ${durations.slower} ${easings.bounce}`,
  'glow': `glow ${durations.slowest} ${easings['in-out']} infinite`,
  'pulse-glow': `pulse-glow 2s ${easings['in-out']} infinite`,
  'shimmer': `shimmer 2s ${easings.linear} infinite`,
  'spin-slow': `spin-slow 3s ${easings.linear} infinite`,
  'wiggle': `wiggle 1s ${easings['in-out']} infinite`,
  
  // Combined animations
  'bounce-fade-in': `bounce-in ${durations.slower} ${easings.bounce}, fade-in ${durations.slow} ${easings.out}`,
  'scale-fade-in': `scale-in ${durations.fast} ${easings['scale-in']}, fade-in ${durations.fast} ${easings.out}`,
} as const;

// Transition presets for common component states
export const transitions = {
  // Basic transitions
  all: `all ${durations.normal} ${easings['in-out']}`,
  colors: `color ${durations.fast} ${easings['in-out']}, background-color ${durations.fast} ${easings['in-out']}, border-color ${durations.fast} ${easings['in-out']}`,
  opacity: `opacity ${durations.fast} ${easings['in-out']}`,
  shadow: `box-shadow ${durations.normal} ${easings['in-out']}`,
  transform: `transform ${durations.normal} ${easings['in-out']}`,
  
  // Component-specific transitions
  button: `all ${durations.fast} ${easings['in-out']}`,
  card: `box-shadow ${durations.normal} ${easings['in-out']}, transform ${durations.normal} ${easings['in-out']}`,
  modal: `opacity ${durations.normal} ${easings['in-out']}, transform ${durations.normal} ${easings['in-out']}`,
  tooltip: `opacity ${durations.faster} ${easings.out}, transform ${durations.faster} ${easings.out}`,
  dropdown: `opacity ${durations.fast} ${easings.out}, transform ${durations.fast} ${easings.out}`,
  flashcard: `transform ${durations.slower} ${easings['flip-card']}`,
  
  // Smooth transitions for enhanced UX
  smooth: `all ${durations.normal} ${easings.soft}`,
  'smooth-fast': `all ${durations.fast} ${easings.soft}`,
  'smooth-slow': `all ${durations.slow} ${easings.soft}`,
} as const;

// Animation variants for different states
export const motionVariants = {
  // Fade variants
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  // Scale variants
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  
  // Slide variants
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  
  // Stagger variants for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
} as const;

// CSS classes for common animations
export const animationClasses = {
  'animate-fade-in': 'animate-fade-in',
  'animate-scale-in': 'animate-scale-in',
  'animate-slide-up': 'animate-slide-up',
  'animate-bounce-in': 'animate-bounce-in',
  'animate-glow': 'animate-glow',
  'animate-pulse-glow': 'animate-pulse-glow',
  'animate-shimmer': 'animate-shimmer',
  'animate-spin-slow': 'animate-spin-slow',
  'animate-wiggle': 'animate-wiggle',
  
  // Transition classes
  'transition-all': 'transition-all duration-300 ease-in-out',
  'transition-colors': 'transition-colors duration-200 ease-in-out',
  'transition-transform': 'transition-transform duration-300 ease-in-out',
  'transition-opacity': 'transition-opacity duration-200 ease-in-out',
  'transition-shadow': 'transition-shadow duration-300 ease-in-out',
  
  // Hover effects
  'hover-lift': 'hover:transform hover:scale-105 transition-transform duration-200',
  'hover-glow': 'hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300',
  'hover-float': 'hover:transform hover:-translate-y-1 transition-transform duration-200',
} as const;