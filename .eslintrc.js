module.exports = {
  extends: '@ythub',
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
  rules: {
    'arca/no-default-export': 'off',
    'promise/param-names': 'off',
  },
}
