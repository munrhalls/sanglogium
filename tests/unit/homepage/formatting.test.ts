import { describe, test, expect } from 'vitest';
import { firstLetterToUpperCase, CategoryNode } from '../../../lib/utils/formatting';

describe('Formatting Utilities', () => {
  describe('firstLetterToUpperCase', () => {
    test('converts first letter to uppercase', () => {
      expect(firstLetterToUpperCase('hello')).toBe('Hello');
      expect(firstLetterToUpperCase('world')).toBe('World');
    });

    test('handles single character strings', () => {
      expect(firstLetterToUpperCase('a')).toBe('A');
      expect(firstLetterToUpperCase('b')).toBe('B');
    });

    test('handles empty string', () => {
      expect(firstLetterToUpperCase('')).toBe('');
    });

    test('preserves rest of string', () => {
      expect(firstLetterToUpperCase('hELLO')).toBe('HELLO');
      expect(firstLetterToUpperCase('hello WORLD')).toBe('Hello WORLD');
    });

    test('handles already capitalized strings', () => {
      expect(firstLetterToUpperCase('Hello')).toBe('Hello');
      expect(firstLetterToUpperCase('World')).toBe('World');
    });

    test('handles special characters', () => {
      expect(firstLetterToUpperCase('123abc')).toBe('123abc');
      expect(firstLetterToUpperCase('!hello')).toBe('!hello');
      expect(firstLetterToUpperCase(' hello')).toBe(' hello');
    });
  });

  describe('CategoryNode interface', () => {
    test('creates valid CategoryNode object', () => {
      const node: CategoryNode = {
        id: 'test-id',
        title: 'Test Category',
        slug: 'test-category',
        path: '/test-category'
      };

      expect(node.id).toBe('test-id');
      expect(node.title).toBe('Test Category');
      expect(node.slug).toBe('test-category');
      expect(node.path).toBe('/test-category');
    });

    test('creates CategoryNode with optional fields', () => {
      const node: CategoryNode = {
        id: 'test-id-2',
        title: 'Test Category 2',
        slug: 'test-category-2',
        path: '/test-category-2',
        icon: 'test-icon',
        parentId: 'parent-id',
        group: 'test-group'
      };

      expect(node.icon).toBe('test-icon');
      expect(node.parentId).toBe('parent-id');
      expect(node.group).toBe('test-group');
    });

    test('creates CategoryNode with groups array', () => {
      const node: CategoryNode = {
        id: 'test-id-3',
        title: 'Test Category 3',
        slug: 'test-category-3',
        path: '/test-category-3',
        groups: [
          { title: 'Group 1', items: [] },
          { title: 'Group 2', items: [] }
        ]
      };

      expect(node.groups).toHaveLength(2);
      expect(node.groups![0].title).toBe('Group 1');
      expect(node.groups![1].title).toBe('Group 2');
    });
  });
});
