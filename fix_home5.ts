import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

// 1103 should be           </div>
// 1104 should be         </motion.div>
// 1105 should be     (empty line)

lines[1103] = "        </motion.div>"; // Wait, line 1104 index is 1103? Let's check!
// Let's just find the pattern:
let replacement = `            })}
          </div>
        </motion.div>
      {/* Daily Fact Modal */}
      <AnimatePresence>`;

let search = `            })}
          </div>
        </motion.div>

      {/* Daily Fact Modal */}
      <AnimatePresence>`;
// wait my latest file content actually has:
// 1103: `          </div>`
// 1104: `        </motion.div>`
// 1105: ``
// 1106: `      {/* Daily Fact Modal */}`
// wait line 1106 has Daily Fact Modal? Wait, no, it was 1107!

// Let me just write a simple script that matches the bottom structure and replaces it smoothly.

content = content.replace(/}\)}\s*<\/div>\s*<\/div>\s*<\/motion.div>\s*\{\/\* Daily Fact Modal \*\/\}\s*<AnimatePresence>/g, 
`            })}
          </div>
        </motion.div>
      {/* Daily Fact Modal */}
      <AnimatePresence>`);

content = content.replace(/}\)}\s*<\/div>\s*<\/motion.div>\s*\{\/\* Daily Fact Modal \*\/\}\s*<AnimatePresence>/g, 
`            })}
          </div>
        </motion.div>
      {/* Daily Fact Modal */}
      <AnimatePresence>`);

content = content.replace(/}\)}\s*<\/div>\s*<\/div>\s*\{\/\* Daily Fact Modal \*\/\}\s*<AnimatePresence>/g, 
`            })}
          </div>
        </motion.div>
      {/* Daily Fact Modal */}
      <AnimatePresence>`);

fs.writeFileSync('src/screens/Home.tsx', content);
