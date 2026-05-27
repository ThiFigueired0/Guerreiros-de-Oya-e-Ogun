import fs from 'fs';
import AdmZip from 'adm-zip';

try {
  const zip = new AdmZip("backup.zip");
  zip.extractAllTo("backup_dir", true);
  console.log('Extracted to backup_dir');
  console.log(fs.readdirSync('backup_dir'));
} catch (e) {
  console.error(e);
}
