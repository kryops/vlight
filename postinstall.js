// https://github.com/callstack/linaria/issues/392#issuecomment-509926956
const { readFileSync, writeFileSync } = require('fs')
const filePath = require.resolve('linaria/lib/babel/extract')
const original = readFileSync(filePath, 'utf-8')
writeFileSync(filePath, original.replace(/\.invalidate\(\)/g, ''), 'utf-8')
