/**
 * White-Label Brand Configuration
 *
 * Change these values to rebrand the entire application.
 * No need to search through code — everything reads from here.
 */

export const brand = {
  // Basic identity
  name: 'Unfazed',
  tagline: 'Therapy Practice Management',
  description: 'Run your therapy practice. Not your paperwork.',

  // Logo — first letter of `name` is used by default
  logoLetter: 'U',

  // Colors — these are Tailwind class names
  // To fully rebrand, also update the CSS in index.css
  colors: {
    primary: 'emerald',
    primaryClass: 'bg-emerald-600',
    primaryHoverClass: 'hover:bg-emerald-700',
    primaryTextClass: 'text-emerald-600',
    primaryBgClass: 'bg-emerald-50',
    primaryBorderClass: 'border-emerald-500',
  },

  // Contact
  supportEmail: 'support@unfazed.com',
  website: 'https://unfazed.com',

  // Legal
  termsUrl: '/terms',
  privacyUrl: '/privacy',

  // Social (optional)
  twitter: '',
  linkedin: '',
  instagram: '',
};

export default brand;