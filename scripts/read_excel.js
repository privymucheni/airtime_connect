const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve('sample_airtime_distribution.xlsx');
console.log('Reading file:', filePath);

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log('Total Rows:', data.length);
console.log('Rows data:');
console.log(JSON.stringify(data, null, 2));

// Calculate statistics
let totalAmount = 0;
const networkCounts = {};
const amountByNetwork = {};

data.forEach((row, index) => {
  const amount = parseFloat(row.Amount || row.amount || 0);
  totalAmount += amount;

  const phone = String(row["Phone Number"] || row.Phone || row.phone || row.MSISDN || row.msisdn || '');
  let network = 'Unknown';
  if (phone.startsWith('+26377') || phone.startsWith('26377') || phone.startsWith('077') || phone.startsWith('77') || phone.startsWith('+26378') || phone.startsWith('26378') || phone.startsWith('078') || phone.startsWith('78')) {
    network = 'Econet';
  } else if (phone.startsWith('+26371') || phone.startsWith('26371') || phone.startsWith('071') || phone.startsWith('71')) {
    network = 'NetOne';
  } else if (phone.startsWith('+26373') || phone.startsWith('26373') || phone.startsWith('073') || phone.startsWith('73')) {
    network = 'Telecel';
  } else if (!phone) {
    network = 'Empty/Invalid';
  }

  networkCounts[network] = (networkCounts[network] || 0) + 1;
  amountByNetwork[network] = (amountByNetwork[network] || 0) + amount;
});

console.log('\n--- Summary Statistics ---');
console.log('Total Amount:', totalAmount);
console.log('Network Counts:', JSON.stringify(networkCounts, null, 2));
console.log('Amount By Network:', JSON.stringify(amountByNetwork, null, 2));
