import { helloLuci } from './luciModule.js';

export function helloCodi(name) {
  console.log(helloLuci());
  return `woof woof: ${name}`;
}
