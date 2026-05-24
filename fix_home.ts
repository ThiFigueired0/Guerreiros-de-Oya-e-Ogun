import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Replace dark colors with white since background is always dark blue
content = content.replace(/text-brand-navy/g, 'text-white');
content = content.replace(/text-gray-500/g, 'text-gray-300');
content = content.replace(/text-gray-600/g, 'text-gray-300');
content = content.replace(/text-gray-700/g, 'text-gray-300');

// Fix white cards to be translucent
content = content.replace(/from-\[#fff5f5\] to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-emerald-50 to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-rose-50 to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-indigo-50 to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-brand-gold\/5 to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-\[#f0f7ff\] to-white/g, 'from-white/10 to-white/5 backdrop-blur-md');

// Also update dark mode cards to be translucent white instead of ugly grey to match blue background perfectly
content = content.replace(/from-\[#1A1A1A\] to-\[#141414\]/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-\[#111c18\] to-\[#0d1411\]/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-\[#1c1114\] to-\[#140d0f\]/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-\[#11131c\] to-\[#0d0f14\]/g, 'from-white/10 to-white/5 backdrop-blur-md');
content = content.replace(/from-\[#1A1A1A\] to-\[#111111\]/g, 'from-white/10 to-white/5 backdrop-blur-md');

// Update border colors
content = content.replace(/border-gray-800/g, 'border-white/10');
content = content.replace(/border-\[#fce8e8\]/g, 'border-white/10');
content = content.replace(/border-emerald-100/g, 'border-white/10');
content = content.replace(/border-rose-100/g, 'border-white/10');
content = content.replace(/border-indigo-100/g, 'border-white/10');
content = content.replace(/border-brand-gold\/10/g, 'border-white/10');
content = content.replace(/border-\[#182b22\]/g, 'border-white/10');
content = content.replace(/border-\[#2b181a\]/g, 'border-white/10');
content = content.replace(/border-\[#181d2b\]/g, 'border-white/10');
content = content.replace(/border-blue-100\/50/g, 'border-white/10');

// Convert bg-white or bg-[#1A1A1A] block backgrounds to glass
content = content.replace(/bg-white border-white shadow-sm/g, 'bg-white/10 border-white/10 backdrop-blur-md');
content = content.replace(/bg-white border border-gray-100 shadow-sm/g, 'bg-white/10 border-white/10 backdrop-blur-md');
content = content.replace(/bg-white border border-gray-100 text-white/g, 'bg-white/10 border-white/10 text-white backdrop-blur-md');
content = content.replace(/bg-\[#1A1A1A\] border border-gray-800/g, 'bg-white/10 border border-white/10 backdrop-blur-md');
content = content.replace(/bg-\[#1A1A1A\] border-gray-800/g, 'bg-white/10 border-white/10 backdrop-blur-md');
content = content.replace(/bg-white border-gray-100/g, 'bg-white/10 border-white/10 backdrop-blur-md');

fs.writeFileSync('src/screens/Home.tsx', content);
