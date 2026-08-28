import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';

/**
 * Gets a configured Azure Blob Service Client instance.
 * Requires AZURE_STORAGE_CONNECTION_STRING environment variable.
 *
 * @returns BlobServiceClient instance
 * @throws Error if AZURE_STORAGE_CONNECTION_STRING is not configured
 */
export function getAzureBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error(
      'AZURE_STORAGE_CONNECTION_STRING environment variable is not configured',
    );
  }

  return BlobServiceClient.fromConnectionString(connectionString);
}

/**
 * Gets an Azure Container Client for the specified container.
 *
 * @param containerName - Name of the Azure Blob Storage container
 * @returns ContainerClient instance
 */
export function getAzureContainerClient(
  containerName: string,
): ContainerClient {
  const blobServiceClient = getAzureBlobServiceClient();
  return blobServiceClient.getContainerClient(containerName);
}

/**
 * Generates a SAS URL for an Azure blob with read permissions.
 *
 * @param fileKey - The blob name/path within the container
 * @param containerName - Name of the Azure Blob Storage container
 * @param expiryMinutes - Number of minutes until the SAS token expires (default: 60)
 * @returns SAS URL string with read permissions
 * @throws Error if connection string is invalid or missing required components
 */
export async function generateSasUrl(
  fileKey: string,
  containerName: string,
  expiryMinutes: number = 60,
): Promise<string> {
  const blobServiceClient = getAzureBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(fileKey);

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountNameMatch = connectionString?.match(/AccountName=([^;]+)/);
  const accountKeyMatch = connectionString?.match(/AccountKey=([^;]+)/);

  if (!accountNameMatch || !accountKeyMatch) {
    throw new Error(
      'Invalid Azure Storage Connection String: Missing AccountName or AccountKey',
    );
  }

  const accountName = accountNameMatch[1];
  const accountKey = accountKeyMatch[1];
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasOptions = {
    containerName,
    blobName: fileKey,
    permissions: BlobSASPermissions.parse('r'), // read only
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000),
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    credential,
  ).toString();
  return `${blobClient.url}?${sasToken}`;
}

/**
 * Uploads a file to Azure Blob Storage.
 *
 * @param fileBuffer - The file buffer to upload
 * @param fileName - Original filename
 * @param mimeType - MIME type of the file
 * @param userId - User ID for folder structure
 * @param category - Category/folder name (default: 'uploads')
 * @param containerName - Optional container name (defaults to AZURE_STORAGE_CONTAINER_NAME env var or 'mobile-app')
 * @returns Object containing the SAS URL and blob key
 * @throws Error if upload fails
 */
export async function uploadBlobFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: string,
  category: string = 'uploads',
  containerName?: string,
): Promise<{ url: string; key: string }> {
  const container =
    containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'mobile-app';
  const containerClient = getAzureContainerClient(container);

  // Create container if it doesn't exist
  await containerClient.createIfNotExists();

  // Build blob path: user/{userId}/{category}/{fileName}
  const blobName = `user/${userId}/${category}/${fileName}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the file
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  // Generate SAS URL
  const expiryMinutes = parseInt(
    process.env.AZURE_SAS_EXPIRY_MINUTES || '60',
    10,
  );
  const sasUrl = await generateSasUrl(blobName, container, expiryMinutes);

  return {
    url: sasUrl,
    key: blobName,
  };
}

/**
 * Deletes a file from Azure Blob Storage.
 *
 * @param fileKey - The blob name/path to delete
 * @param containerName - Optional container name (defaults to AZURE_STORAGE_CONTAINER_NAME env var or 'mobile-app')
 * @throws Error if deletion fails
 */
export async function deleteBlobFile(
  fileKey: string,
  containerName?: string,
): Promise<void> {
  const container =
    containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'mobile-app';
  const containerClient = getAzureContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(fileKey);

  await blockBlobClient.delete();
}

/**
 * Gets a SAS URL for a blob file.
 *
 * @param fileKey - The blob name/path
 * @param containerName - Optional container name (defaults to AZURE_STORAGE_CONTAINER_NAME env var or 'mobile-app')
 * @param expiryMinutes - Optional expiry time in minutes (defaults to AZURE_SAS_EXPIRY_MINUTES env var or 60)
 * @returns SAS URL string with read permissions
 */
export async function getBlobFileUrl(
  fileKey: string,
  containerName?: string,
  expiryMinutes?: number,
): Promise<string> {
  const container =
    containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'mobile-app';
  const expiry =
    expiryMinutes || parseInt(process.env.AZURE_SAS_EXPIRY_MINUTES || '60', 10);

  return generateSasUrl(fileKey, container, expiry);
}
