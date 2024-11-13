import { runWebTestFunction } from "../src/runners/webRunner.js";
import { describe, it, assertEqual, } from '../src/testRunner.js';


await runWebTestFunction(testFunction, {
    quiet: true,
    showSummary: true
});

function testFunction() {
    describe('First Layer', () => {
        it('First', () => {
            assertEqual(1, 2, 'Expected 1 to equal 1');
        });
        it('Second', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
        it('Third', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });

        secondFunction();
    });
}

function secondFunction() {
    describe('Second Layer', () => {
        it('First', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
        it('Second', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
        it('Third', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
        thirdFunction();
    });
}

function thirdFunction() {
    describe('Third Layer', () => {
        it('First', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
        it('Second', () => {
            assertEqual(1, 2, 'Expected 1 to equal 1');
        });
        it('Third', () => {
            assertEqual(1, 1, 'Expected 1 to equal 1');
        });
    });
}