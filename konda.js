const fs = require('fs');
const archiver = require('archiver');

// Source and destination paths
const sourceFilePath = '/Users/k-r.lingaladinne/Downloads/aadhar.pdf';
const destFilePath = '/Users/k-r.lingaladinne/Downloads/aadhar.pdf'; // Specify your destination file path here
const zipFilePath = '/Users/k-r.lingaladinne/Downloads/aadhar.zip'; // Specify your destination zip file path here

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
    archive.pipe(output);

    // Append the PDF file to the zip with the name 'aadhar.pdf'
    archive.file(destFilePath, { name: 'aadhar.pdf' });

    // Finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
});
