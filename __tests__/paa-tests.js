'use strict';

const paa = require('..');

const auditsWithHeader = (audit, header) => audit.filter(x => x.heading === header);

test('test that an empty URL fails', () => {
  expect(() => {
    paa('', {}, () => {});
  }).toThrow();
});

test('test that no callback fails', () => {
  expect(() => {
    paa('http://www.google.com', {}, null);
  }).toThrow();
});

test('audit fixture.html', () => {
  paa('__tests__/fixture.html', {}, (error, audit, report) => {
    expect(error).toBeNull();

    expect(audit).not.toBeNull();
    expect(audit.length).not.toBeNull();
    expect(audit.length).not.toEqual(0);

    const ariaReports = auditsWithHeader(audit, 'ARIA state and property values must be valid');
    expect(ariaReports).not.toBeNull();
    expect(ariaReports.length).not.toBeNull();
    expect(ariaReports.length).toBeGreaterThan(0);

    expect(report.length).not.toEqual(0);    
  });
});