const XLSX = require('xlsx');
const path = require('path');

const data = [
    {
        "Employee Name": "John Doe",
        "Phone Number": "263771234567",
        "Amount": 10.50
    },
    {
        "Employee Name": "Jane Smith",
        "Phone Number": "263712345678",
        "Amount": 25.00
    },
    {
        "Employee Name": "Alice Johnson",
        "Phone Number": "263732987654",
        "Amount": 5.00
    },
    {
        "Employee Name": "Robert Brown",
        "Phone Number": "263781122334",
        "Amount": 100.00
    },
    {
        "Employee Name": "Sarah Wilson",
        "Phone Number": "263775566778",
        "Amount": 15.75
    },
    {
        "Employee Name": "Invalid Entry",
        "Phone Number": "",
        "Amount": 0
    }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Airtime Distribution");

const filePath = path.join(process.cwd(), 'sample_airtime_distribution.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Excel file generated at: ${filePath}`);
