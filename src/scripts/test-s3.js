require('dotenv').config({ path: '.env.local' });
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false
});

const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function testS3Access() {
  try {
    console.log('\n=== Testing S3 Access ===');
    console.log('AWS Config:', {
      region: process.env.AWS_REGION,
      bucketName: S3_BUCKET_NAME,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    // List buckets to verify credentials
    console.log('\nListing buckets...');
    const listBucketsCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listBucketsCommand);
    console.log('Available buckets:', buckets.Buckets.map(b => b.Name));

    // Test upload
    console.log('\nTesting upload...');
    const testKey = 'test-upload.txt';
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: testKey,
      Body: 'Test upload content',
      ContentType: 'text/plain'
    });

    await s3Client.send(uploadCommand);
    console.log('✓ Successfully uploaded test file');

    console.log('\n=== S3 Access Test Complete ===');
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('\nError testing S3 access:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.Code,
      requestId: error.RequestId
    });
    process.exit(1);
  }
}

testS3Access(); 