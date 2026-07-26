const { pipeline } = require('stream/promises');
const fs = require('fs');
const got = require('got');
const logger = require("../config/logger");
const axios = require("axios");
const config = require("../config");
const mime = require('mime-types');

const getMediaMessage = async (extension, url, mimeType, interactionId, token) => {
  logger.info('Fetching media (%j %j %j)', extension, url, mimeType)
  let response = await downloadAndWrite(extension, url, mimeType, token);
  if(response){
    return uploadToLocal(response?.file, response?.filePath, response?.mimeType, response?.fileSize, interactionId);
  }
  return null;
}

const downloadAndWrite = async (mediaId, extension, mimeType, token) => {
  let url = `${config.META_BASE_URL}/${config.META_VERSION}/${mediaId}`
  if (!token) {
    return null;
  }
  logger.info('Start Downloading Media %j', url);
  return axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    responseType: 'stream',
    timeout: 300000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
    .then(async response => {
      const contentTypeHeader = response.headers['content-type'];
      console.log('Got Media with API Content-Type:', contentTypeHeader);
      if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
        console.log('⚠️ API returned JSON - streaming base64 decode');
        const fileExtension = mime.extension(mimeType) || 'bin';
        const filePath = `assets/waFile.${Date.now()}.${fileExtension}`;
        const writeStream = fs.createWriteStream(filePath);
        let buffer = '';
        let base64Started = false;
        let base64Ended = false;

        // Process JSON stream chunk by chunk
        for await (const chunk of response.data) {
          const text = chunk.toString();
          buffer += text;

          // Find and extract base64 data from JSON stream
          if (!base64Started) {
            const dataIndex = buffer.indexOf('"data":"');
            if (dataIndex !== -1) {
              base64Started = true;
              buffer = buffer.slice(dataIndex + 8); // Skip '"data":"'
              console.log('Found base64 data start');
            }
          }

          if (base64Started && !base64Ended) {
            // Check for end of base64 string
            const endIndex = buffer.indexOf('"');

            if (endIndex !== -1) {
              // Found end of base64
              const finalBase64 = buffer.slice(0, endIndex);
              const decoded = Buffer.from(finalBase64, 'base64');
              writeStream.write(decoded);
              base64Ended = true;
              console.log('Found base64 data end');
              break;
            } else {
              // Decode in chunks (keep last 4 chars for padding)
              if (buffer.length > 1024 * 1024) { // Process 1MB at a time
                const chunkSize = Math.floor((buffer.length - 4) / 4) * 4;
                const toProcess = buffer.slice(0, chunkSize);
                buffer = buffer.slice(chunkSize);

                const decoded = Buffer.from(toProcess, 'base64');
                writeStream.write(decoded);
                console.log('Decoded chunk:', decoded.length, 'bytes');
              }
            }
          }
        }
        writeStream.end();
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
        const fileSize = fs.statSync(filePath).size;
        console.log('Decoded file size:', fileSize);

        if (fileSize === 0) {
          console.log('File is empty after decoding!');
          return null;
        }
        const file = fs.createReadStream(filePath);

        return {
          file,
          filePath,
          mimeType,
          fileSize
        }
      }
      else {
        console.log('✅ API returned binary - streaming');
        const fileExtension = mime.extension(mimeType) || 'bin';

        const filePath = `assets/waFile.${Date.now()}.${fileExtension}`;

        const writeStream = fs.createWriteStream(filePath);

        await pipeline(response.data, writeStream);

        const fileSize = fs.statSync(filePath).size;
        console.log('Binary file size:', fileSize);

        if (fileSize === 0) {
          console.log('Downloaded file is empty!');
          return null;
        }

        const file = fs.createReadStream(filePath);

        return {
          file,
          filePath,
          mimeType,
          fileSize
        }
      }
    })
    .catch(error => {
      console.log('Error while downloading media', error);
      return null;
    })
}

const uploadToLocal = async (file, filePath, mimeType, fileSize) => {

  let s3bucketUrl = ""
  let FILE_UPLOAD = ""
  try{
    const formData = new FormData();
    formData.append('file', file, {
      filename: filePath,
      contentType: mimeType,
      knownLength: fileSize
    });
    const uploadRes = await got.post(s3bucketUrl, {
      body: formData,
      headers: formData.getHeaders(),
      throwHttpErrors: false,
      timeout: { request: 300000 }
    });

    const { statusCode, body } = uploadRes;
    let data;

    try {
      data = JSON.parse(body);
    }
    catch (err) {
      console.log('Error while parsing response data', err);
      return null;
    }

    if (statusCode === 200 && data?.url) {
      return `${FILE_UPLOAD}${data.url}`;
    }
    else if (statusCode === 400 && data?.error) {
      return {
        message: `${FILE_UPLOAD}${data.error}`,
        uploadError: true
      }
    }
    else {
      return null
    }
  }
  catch (e) {
    console.log('Error while uploading file: ', e);
    if(e?.response?.status === 400 && e?.response?.data?.error){
      return `${FILE_UPLOAD}${e?.response?.data?.error}`
    }
    return null;
  }
  finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✓ Temp file cleaned up');
    }
  }
}

module.exports = {
  downloadAndWrite,
  getMediaMessage
}