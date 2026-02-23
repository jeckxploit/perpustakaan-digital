const fs = require('fs');
const path = require('path');

// Create simple PNG icon programmatically
// This creates a blue square with a white book icon

function createPNGIcon(size, outputPath) {
  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const width = size;
  const height = size;
  const bitDepth = 8;
  const colorType = 6; // RGBA
  const compressionMethod = 0;
  const filterMethod = 0;
  const interlaceMethod = 0;
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = bitDepth;
  ihdrData[9] = colorType;
  ihdrData[10] = compressionMethod;
  ihdrData[11] = filterMethod;
  ihdrData[12] = interlaceMethod;
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    ihdrCrc
  ]);
  
  // Create image data (blue background with white book)
  const rawData = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const bookWidth = Math.floor(width * 0.4);
  const bookHeight = Math.floor(height * 0.5);
  
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // Blue background (#3b82f6)
      let r = 59, g = 130, b = 246, a = 255;
      
      // Draw book icon (white)
      const bookLeft = centerX - bookWidth;
      const bookRight = centerX + bookWidth;
      const bookTop = centerY - Math.floor(bookHeight / 2);
      const bookBottom = centerY + Math.floor(bookHeight / 2);
      
      // Book cover
      if (x >= bookLeft && x <= bookRight && y >= bookTop && y <= bookBottom) {
        // Check if it's the spine (left part)
        const spineWidth = Math.floor(bookWidth * 0.2);
        if (x >= bookLeft && x <= bookLeft + spineWidth) {
          // Spine - darker
          r = 255; g = 255; b = 255; a = 255;
        } else if (x > bookLeft + spineWidth && x <= bookRight) {
          // Cover - white with slight gradient
          r = 255; g = 255; b = 255; a = 255;
        }
      }
      
      // Add "P" letter for Perpustakaan (simple representation)
      const letterCenterX = centerX + Math.floor(bookWidth * 0.3);
      const letterCenterY = centerY;
      const letterSize = Math.floor(Math.min(width, height) * 0.15);
      
      if (x >= letterCenterX - letterSize && x <= letterCenterX + letterSize &&
          y >= letterCenterY - letterSize && y <= letterCenterY + letterSize) {
        // Simple "P" shape
        const relativeX = x - (letterCenterX - letterSize);
        const relativeY = y - (letterCenterY - letterSize);
        const pWidth = letterSize * 2;
        const pHeight = letterSize * 2;
        
        // Vertical line of P
        if (relativeX < pWidth * 0.3 && relativeY >= 0) {
          r = 59; g = 130; b = 246; a = 255;
        }
        // Top horizontal and curve of P
        if (relativeY < pHeight * 0.5 && relativeY > 0 && 
            relativeX >= 0 && relativeX < pWidth * 0.8) {
          r = 59; g = 130; b = 246; a = 255;
        }
        // Middle horizontal of P
        if (relativeY >= pHeight * 0.45 && relativeY <= pHeight * 0.55 &&
            relativeX >= 0 && relativeX < pWidth * 0.8) {
          r = 59; g = 130; b = 246; a = 255;
        }
      }
      
      rawData.push(r, g, b, a);
    }
  }
  
  // Compress with simple deflate (using zlib)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  const idatChunk = Buffer.concat([
    Buffer.from([0, 0, 0, compressed.length]),
    Buffer.from('IDAT'),
    compressed,
    idatCrc
  ]);
  
  // IEND chunk
  const iendCrc = crc32(Buffer.from('IEND'));
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND'),
    iendCrc
  ]);
  
  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, png);
  console.log(`Created ${outputPath} (${size}x${size})`);
}

// CRC32 implementation
function crc32(data) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c >>> 0;
  }
  
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return Buffer.from([(crc ^ 0xffffffff) >>> 24, ((crc ^ 0xffffffff) >>> 16) & 0xff, ((crc ^ 0xffffffff) >>> 8) & 0xff, (crc ^ 0xffffffff) & 0xff]);
}

// Create icons
createPNGIcon(192, path.join(__dirname, '..', 'public', 'icons', 'icon-192x192.png'));
createPNGIcon(512, path.join(__dirname, '..', 'public', 'icons', 'icon-512x512.png'));

console.log('✅ PWA icons created successfully!');
