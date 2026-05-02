#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LANGS = ['es', 'en', 'fr'];
const REQUIRED_CONFIG = ['restaurantName', 'tagline', 'taglineEn', 'taglineFr', 'address', 'whatsappNumber', 'heroImage'];
const BEST_FOR = new Set(['quick-lunch', 'sharing', 'french-specialty', 'local-favorite', 'dessert']);
const DIETARY = new Set(['vegetarian']);

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  } catch (err) {
    errors.push(`${file}: ${err.message}`);
    return null;
  }
}

function isUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function requireText(obj, field, where) {
  if (!obj || typeof obj[field] !== 'string' || !obj[field].trim()) {
    errors.push(`${where}: missing ${field}`);
  }
}

function requireLang(obj, field, where) {
  LANGS.forEach(lang => {
    if (!obj?.[field]?.[lang] || typeof obj[field][lang] !== 'string') {
      errors.push(`${where}: missing ${field}.${lang}`);
    }
  });
}

const menu = readJson('data/menu.json');
const combos = readJson('data/combos.json') || [];
const config = readJson('data/config.json');
readJson('data/specials.json');

if (config) {
  REQUIRED_CONFIG.forEach(field => requireText(config, field, 'data/config.json'));
  if (!isUrl(config.heroImage)) errors.push('data/config.json: heroImage must be http/https URL');
  if (config.storyImage && !isUrl(config.storyImage)) errors.push('data/config.json: storyImage must be http/https URL');
  if (!config.brandStory || LANGS.some(lang => !config.brandStory[lang])) {
    errors.push('data/config.json: brandStory must include es, en, fr');
  }
}

const ids = new Set();
if (!menu?.categories?.length) {
  errors.push('data/menu.json: categories must be a non-empty array');
} else {
  menu.categories.forEach((cat, ci) => {
    const cwhere = `data/menu.json category[${ci}]`;
    requireText(cat, 'id', cwhere);
    requireLang(cat, 'name', cwhere);
    if (!Array.isArray(cat.items) || !cat.items.length) errors.push(`${cwhere}: items must be non-empty`);
    (cat.items || []).forEach((item, ii) => {
      const where = `${cwhere} item[${ii}] ${item.id || '<missing-id>'}`;
      requireText(item, 'id', where);
      if (ids.has(item.id)) errors.push(`${where}: duplicate item id`);
      ids.add(item.id);
      requireLang(item, 'name', where);
      requireLang(item, 'description', where);
      requireLang(item, 'story', where);
      if (!/^\d+$/.test(String(item.price || ''))) errors.push(`${where}: price must be a whole number string`);
      if (item.image && !isUrl(item.image)) errors.push(`${where}: image must be http/https URL`);
      if (item.photoAlt) requireLang(item, 'photoAlt', where);
      ['allergens', 'bestFor', 'dietaryTags', 'addons', 'pairings'].forEach(field => {
        if (!Array.isArray(item[field])) errors.push(`${where}: ${field} must be an array`);
      });
      (item.bestFor || []).forEach(tag => {
        if (!BEST_FOR.has(tag)) warnings.push(`${where}: unknown bestFor tag "${tag}"`);
      });
      (item.dietaryTags || []).forEach(tag => {
        if (!DIETARY.has(tag)) warnings.push(`${where}: unknown dietary tag "${tag}"`);
      });
    });
  });
}

if (!Array.isArray(combos)) {
  errors.push('data/combos.json: must be an array');
} else {
  const comboIds = new Set();
  combos.forEach((combo, idx) => {
    const where = `data/combos.json combo[${idx}] ${combo.id || '<missing-id>'}`;
    requireText(combo, 'id', where);
    if (comboIds.has(combo.id)) errors.push(`${where}: duplicate combo id`);
    comboIds.add(combo.id);
    requireLang(combo, 'name', where);
    requireLang(combo, 'description', where);
    requireLang(combo, 'tag', where);
    if (!Array.isArray(combo.items) || !combo.items.length) errors.push(`${where}: items must be non-empty`);
    (combo.items || []).forEach(id => {
      if (!ids.has(id)) errors.push(`${where}: references missing menu item "${id}"`);
    });
    if (!/^\d+$/.test(String(combo.price || ''))) errors.push(`${where}: price must be a whole number string`);
  });
}

warnings.forEach(w => console.warn(`warning: ${w}`));
if (errors.length) {
  console.error(errors.map(e => `error: ${e}`).join('\n'));
  process.exit(1);
}

console.log(`validate-menu: ok (${ids.size} menu items, ${combos.length} combos)`);
