// https://github.com/callstack/linaria/issues/392#issuecomment-509926956
const { readFileSync, writeFileSync } = require('fs')
const filePath = require.resolve('linaria/lib/babel/module')
const original = readFileSync(filePath, 'utf-8')

let newContent = original.replace(
  /  cache = {};/,
  '  // cache = {}; -- PATCHED: DO NOTHING HERE'
)

if (!original.includes('setInterval')) {
  newContent += `
  
  // PATCHED: Invalidate Module cache every 20s
  const interval = setInterval(() => {
    cache = {};
  }, 20000);

  interval.unref();
  `
}

writeFileSync(filePath, newContent, 'utf-8')
