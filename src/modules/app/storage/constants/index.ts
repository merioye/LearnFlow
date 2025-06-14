import { StorageEntity } from '../enums';

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

const allowedImageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
const allowedDocumentTypes = [
  'application/pdf', // PDF
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'text/csv', // CSV
];
export const allowedFileTypes = new Map<StorageEntity, string[]>([
  [StorageEntity.USER, allowedImageTypes],
  [StorageEntity.USER, allowedDocumentTypes], // temp remove it
]);
