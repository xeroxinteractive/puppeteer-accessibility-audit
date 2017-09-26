'use strict';

const auditsWithHeader = (audit, header) => audit.filter(x => x.heading === header);
let paa;

beforeEach(async () => {
  paa = require('..');
})

afterEach(async () => {
  await paa.destroy();
})

test('test that an error is thrown if not launched', async () => {
  await expect(paa.audit('__tests__/fixture.html')).rejects.toMatchSnapshot();
});

test('test that an empty URL fails', async () => {
  await paa.launch();

  await expect(paa.audit('')).rejects.toMatchSnapshot();
});

test('audit fixture.html using async', async () => {
  await paa.launch();

  let {audit, report} = await paa.audit('__tests__/fixture.html');

  expect(audit).not.toBeNull();
  expect(audit.length).not.toBeNull();
  expect(audit.length).not.toEqual(0);

  const ariaReports = auditsWithHeader(audit, 'ARIA state and property values must be valid');
  expect(ariaReports).not.toBeNull();
  expect(ariaReports.length).not.toBeNull();
  expect(ariaReports.length).toBeGreaterThan(0);
  expect(ariaReports).toMatchSnapshot();

  expect(report.length).not.toEqual(0);
});