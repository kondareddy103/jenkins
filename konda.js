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
    archive.pipe(output);

    // Append the PDF file to the zip with the name 'aadhar.pdf'
    archive.file(destFilePath, { name: 'aadhar.pdf' });

    // Finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
});







const archiver = require('archiver');
const fs = require('fs');
const { zipFile } = require('./path-to-your-zipFile-function-file'); // update with your actual file path

// Mocks
jest.mock('fs');
jest.mock('archiver');

describe('zipFile function', () => {
  let mockExit;
  let logSpy;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    archiver.mockClear();
    fs.createWriteStream.mockClear();

    // Mock console.log and process.exit
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks after each test
    logSpy.mockRestore();
    mockExit.mockRestore();
  });

  it('should create an archive successfully', () => {
    const mockArchive = {
      on: jest.fn(),
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn(),
      pointer: jest.fn().mockReturnValue(1024),
    };
    const mockStream = { on: jest.fn() };

    archiver.mockReturnValue(mockArchive);
    fs.createWriteStream.mockReturnValue(mockStream);

    zipFile('sourceFilePath', 'zipFilePath');

    expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    expect(mockArchive.on).toHaveBeenCalledWith('warning', expect.any(Function));
    expect(mockArchive.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockArchive.pipe).toHaveBeenCalledWith(mockStream);
    expect(mockArchive.file).toHaveBeenCalledWith('sourceFilePath', { name: 'konda-ibm.pdf' });
    expect(mockArchive.finalize).toHaveBeenCalled();
  });

  it('should handle warnings', () => {
    const mockArchive = {
      on: jest.fn((event, handler) => {
        if (event === 'warning') {
          handler({ code: 'ENOENT' });
        }
      }),
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn(),
    };
    const mockStream = { on: jest.fn() };

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    archiver.mockReturnValue(mockArchive);
    fs.createWriteStream.mockReturnValue(mockStream);

    zipFile('sourceFilePath', 'zipFilePath');

    expect(warnSpy).toHaveBeenCalledWith('Warning occurred:', { code: 'ENOENT' });

    warnSpy.mockRestore();
  });

  it('should handle errors', () => {
    const error = new Error('Archive error');
    const mockArchive = {
      on: jest.fn((event, handler) => {
        if (event === 'error') {
          handler(error);
        }
      }),
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn(),
    };
    const mockStream = { on: jest.fn() };

    archiver.mockReturnValue(mockArchive);
    fs.createWriteStream.mockReturnValue(mockStream);

    expect(() => zipFile('sourceFilePath', 'zipFilePath')).toThrowError(error);
  });
});

