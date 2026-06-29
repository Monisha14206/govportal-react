function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

function generateReferenceNumber(prefix) {
  const now = new Date();
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const randomPart = pad(Math.floor(Math.random() * 100000), 5);
  return `${prefix}-${datePart}-${randomPart}`;
}

module.exports = {
  generateApplicationNumber: () => generateReferenceNumber('APP'),
  generateComplaintNumber: () => generateReferenceNumber('CMP'),
  generateSchemeApplicationNumber: () => generateReferenceNumber('SCH')
};
