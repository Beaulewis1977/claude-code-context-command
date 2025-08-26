/**
 * Test Setup for Security Tests
 * Configures Mocha for ES6 modules and provides expect function
 */

import { strict as assert } from 'assert';

// Simple expect implementation for tests
global.expect = (actual) => {
  return {
    to: {
      equal: (expected) => assert.strictEqual(actual, expected),
      be: {
        true: assert.ok(actual),
        false: assert.ok(!actual),
        a: (type) => assert.strictEqual(typeof actual, type),
        greaterThan: (value) => assert.ok(actual > value)
      },
      throw: (expectedError) => {
        if (typeof actual === 'function') {
          try {
            actual();
            assert.fail('Expected function to throw');
          } catch (error) {
            if (expectedError && expectedError instanceof RegExp) {
              assert.ok(expectedError.test(error.message), `Expected error message to match ${expectedError}`);
            }
          }
        } else {
          assert.fail('Expected a function');
        }
      },
      contain: (values) => {
        if (Array.isArray(values)) {
          values.forEach(value => {
            assert.ok(!actual.includes(value), `Expected ${actual} not to contain ${value}`);
          });
        } else {
          assert.ok(actual.includes(values));
        }
      }
    },
    not: {
      to: {
        throw: () => {
          if (typeof actual === 'function') {
            try {
              actual();
              // Should not throw
            } catch (error) {
              assert.fail('Expected function not to throw');
            }
          }
        },
        contain: (values) => {
          if (Array.isArray(values)) {
            values.forEach(value => {
              assert.ok(!actual.includes(value), `Expected ${actual} not to contain ${value}`);
            });
          } else {
            assert.ok(!actual.includes(values));
          }
        }
      }
    }
  };
};

// Add a simple fail function
global.expect.fail = (message) => assert.fail(message);