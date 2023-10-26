const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Source and destination paths for Windows (please adjust as necessary)
const sourceFilePath = 'C:\\Users\\Your-Username\\Downloads\\aadhar.pdf'; // Please replace 'Your-Username' with your actual username
const destDirectory = 'C:\\destination\\path\\here\\'; // Specify your destination directory here
const destFilePath = path.join(destDirectory, 'aadhar.pdf');
const zipFilePath = path.join(destDirectory, 'aadhar.zip');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDirectory)){
    fs.mkdirSync(destDirectory, { recursive: true });
}

// Step 1: Copy the PDF file from the source to the destination
fs.copyFile(sourceFilePath, destFilePath, (err) => {
    if (err) {
        console.error('An error occurred while copying the file.', err);
        return;
    }
    console.log('PDF file copied successfully.');

    // Step 2: Convert the copied PDF file into a ZIP file
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // Listen for all archive data to be written
    output.on('close', function() {
        console.log('Archive created successfully. Total bytes: ' + archive.pointer());
    });

    // Good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
            console.warn('Warning occurred:', err);
        } else {
            // throw error
            throw err;
        }
    });

    // Catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    // Pipe archive data to the file
