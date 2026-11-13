/** Màu lấy từ Color.kt và ảnh chụp app Android. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { vl: { blue: '#3B82F6', link: '#60A5FA', pink: '#E91E63', navy: '#1A237E', maroon: '#800000', bg: '#F8F9FA', err: '#EF4444' } }, fontFamily: { sans: ['Roboto', 'system-ui', 'sans-serif'] } } },
  plugins: []
};
