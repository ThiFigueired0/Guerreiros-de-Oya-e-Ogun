import fs from 'fs';

let text = fs.readFileSync('src/App.tsx', 'utf8');

const old_open = `<div className={cn(
            "w-36 h-36 rounded-full relative frame-3d mystical-aura",
            settings.darkMode ? "bg-gray-900" : "bg-gradient-to-tr from-brand-navy to-[#001c38]"
          )}>`;

const new_open = `<motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }} className={cn(
            "w-36 h-36 rounded-full relative frame-3d mystical-aura cursor-pointer shadow-[0_10px_40px_rgba(212,175,55,0.4)]",
            settings.darkMode ? "bg-gray-900" : "bg-gradient-to-tr from-brand-navy to-[#001c38]"
          )}>`;

text = text.replace(old_open, new_open);

const old_close = `              )}
            </div>
          </div>
        </motion.div>`;

const new_close = `              )}
            </div>
          </motion.div>
        </motion.div>`;

text = text.replace(old_close, new_close);

const old_social = `<div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />`;
const new_social = `<div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute -inset-2 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100" />`;

text = text.replace(new RegExp(old_social, 'g'), new_social);

fs.writeFileSync('src/App.tsx', text);
