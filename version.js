// Bump VERSION on every release and add a line to CHANGES. Also update the ?v= numbers in index.html
// (npm test fails if they don't match), so phones load the new files instead of cached old ones.
// Format: major.minor.patch. minor = new features, patch = fixes and new exercises only.
const VERSION = '1.2.0';
const CHANGES = {
  '1.2.0': ['Profile with your stats: XP by day, accuracy by exercise type, weakest lessons, memory strength', 'Version number and this "What\'s new" card', 'Sound setting moved to the profile', 'Fix: exercises you got right were counted as weak'],
  '1.1.0': ['Smart review: exercises you miss come back, ones you know wait longer', 'New exercises: Build the line and Trace the variable', '299 exercises, at least 8 per lesson', 'Quitting asks first, streak fix'],
  '1.0.0': ['First version'],
};
