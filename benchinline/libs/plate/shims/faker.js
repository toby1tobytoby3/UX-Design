// Tiny stand-in for @faker-js/faker: the Plate registry only uses it for its "no API route yet" demo fallback,
// which a real app deletes. Shimmed so it doesn't inflate Plate's measured bundle; never reached with our mock.
const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
export const faker = {
  number: { int: ({ min = 0, max = 10 } = {}) => Math.floor((min + max) / 2) },
  lorem: { words: () => words.slice(0, 2).join(' '), sentence: () => 'Lorem ipsum dolor sit amet.' },
  string: { alphanumeric: (n = 8) => 'x'.repeat(n) },
};
