import fs

path = "src/App.tsx"
with open(path, "r") as f:
    text = f.read()

old_open = """<div className={cn(
            "w-36 h-36 rounded-full relative frame-3d mystical-aura",
            settings.darkMode ? "bg-gray-900" : "bg-gradient-to-tr from-brand-navy to-[#001c38]"
          )}>"""

new_open = """<motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }} className={cn(
            "w-36 h-36 rounded-full relative frame-3d mystical-aura cursor-pointer shadow-[0_10px_40px_rgba(212,175,55,0.4)]",
            settings.darkMode ? "bg-gray-900" : "bg-gradient-to-tr from-brand-navy to-[#001c38]"
          )}>"""

text = text.replace(old_open, new_open)

old_close = """              )}
            </div>
          </div>
        </motion.div>"""

new_close = """              )}
            </div>
          </motion.div>
        </motion.div>"""

text = text.replace(old_close, new_close)

# Social buttons enhancements:
old_social = """<div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />"""
new_social = """<div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute -inset-2 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100" />"""

text = text.replace(old_social, new_social)

with open(path, "w") as f:
    f.write(text)
