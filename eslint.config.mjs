import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import stylisticJs from '@stylistic/eslint-plugin-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});
export default [
  {
    ignores: [ 'dist/', '*.json', 'coverage/', 'src/index.js', 'src/js/app.js' ], // отключение проверок для папок
  },
  {
    // определение стандарта и парсинга
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          presets: [ '@babel/preset-env' ],
        },
      },
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  ...compat.extends('airbnb-base'),
  {
    // files: ['src/**/*.js'],
    rules: {
      indent: [ 'error', 2 ], // отступы, авто
      semi: [ 'error', 'always' ], // точка с запятой, авто
      'no-unused-vars': 'off', // не испоьзуемые переменные
      'no-console': 'off', // console.log
    },
  },
  {
    files: [ '*.config.*' ], // правила для конфигов
    rules: {
      'no-underscore-dangle': [ 'off' ], // двойное подчеркивание перед/после переменной
      'import/no-extraneous-dependencies': 'off', // импорт из дев-зависимостей
    },
  },
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      'max-len': [ 'error', { code: 180 } ], // длина строки, нет авто
      quotes: [ 'error', 'single' ], // одинарные кавычки, авто
      'object-property-newline': [ 'error' ], // разбиение объекта по строчно, авто
      'array-bracket-spacing': [ 'error', 'always' ],
      'no-multiple-empty-lines': [ 'error', {
        max: 1, // одна внутренняя
        maxBOF: 1, // одна сверху в импортах
      } ], // пустые строки, авто
    },
  },
  {
    files: [ 'src/js/GamePlay.js' ], // отключение ошибок legacy-кода
    rules: {
      'no-restricted-syntax': [ 'error', 'ForInStatement', 'LabeledStatement', 'WithStatement' ], // для for...of
      'no-alert': 'off', // для alert
    },
  },
  {
    // для тестов
    files: [ '**/*.spec.js', '**/*.test.js' ],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
