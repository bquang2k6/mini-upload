const express = require('express');
const { google } = require('googleapis');
const path = require('path');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==== Google Drive API config ====
const CLIENT_ID = process.env.YOUR_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET;
const REDIRECT_URI = process.env.YOUR_REDIRECT_URI;
const REFRESH_TOKEN = process.env.YOUR_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN) {
  console.error('❌ Thiếu environment variables!');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });
app.use(express.json());

// ==== Cache cho upload root folder ====
let uploadRootFolderId = null;

async function ensureUploadRoot() {
  if (uploadRootFolderId) return uploadRootFolderId;
  
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='UploadServer' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive'
  });
  
  if (res.data.files.length > 0) {
    uploadRootFolderId = res.data.files[0].id;
  } else {
    const folderMeta = {
      name: 'UploadServer',
      mimeType: 'application/vnd.google-apps.folder'
    };
    const folder = await drive.files.create({
      resource: folderMeta,
      fields: 'id'
    });
    uploadRootFolderId = folder.data.id;
  }
  return uploadRootFolderId;
}

// ==== Helper: Tạo folder theo path ====
async function getOrCreateFolderByPath(folderPath, parentId) {
  let currentParent = parentId;
  if (!folderPath) return currentParent;
  
  const parts = folderPath.split('/').filter(Boolean);
  for (const part of parts) {
    const res = await drive.files.list({
      q: `'${currentParent}' in parents and mimeType='application/vnd.google-apps.folder' and name='${part.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    if (res.data.files.length > 0) {
      currentParent = res.data.files[0].id;
    } else {
      const folderMeta = {
        name: part,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [currentParent]
      };
      const folder = await drive.files.create({
        resource: folderMeta,
        fields: 'id'
      });
      currentParent = folder.data.id;
    }
  }
  return currentParent;
}

// ==== Helper: Tạo share link ====
async function getOrCreateShareLink(fileId) {
  const perms = await drive.permissions.list({ fileId });
  let hasAnyone = perms.data.permissions &&
                  perms.data.permissions.some(p =>
                    p.type === 'anyone' && (p.role === 'reader' || p.role === 'writer')
                  );
                  
  if (!hasAnyone) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        fields: 'id'
      });
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      if (!String(err).includes('alreadyExists')) {
        console.error('Cấp quyền chia sẻ lỗi:', err?.errors || err?.message);
      }
    }
  }
  
  for (let i = 0; i < 3; ++i) {
    const meta = await drive.files.get({
      fileId,
      fields: 'webViewLink, permissions'
    });
    const anyonePerm = (meta.data.permissions||[]).some(p =>
      p.type === 'anyone' && (p.role === 'reader' || p.role === 'writer')
    );
    if (anyonePerm) return meta.data.webViewLink;
    await new Promise(r => setTimeout(r, 600));
  }
  
  const meta = await drive.files.get({
    fileId,
    fields: 'webViewLink'
  });
  return meta.data.webViewLink;
}

// ==== 🚀 API MỚI: Lấy access token cho client ====
app.post('/get-upload-token', async (req, res) => {
  try {
    // Lấy access token từ refresh token
    const { credentials } = await oauth2Client.refreshAccessToken();
    const accessToken = credentials.access_token;
    
    res.json({ 
      accessToken,
      expiresIn: credentials.expiry_date 
    });
  } catch (err) {
    console.error('Lỗi lấy access token:', err);
    res.status(500).json({ error: 'Không thể lấy access token' });
  }
});

// ==== 🚀 API MỚI: Tạo upload session cho direct upload ====
app.post('/create-upload-session', async (req, res) => {
  try {
    const { fileName, mimeType, parentId, relativePath } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'Thiếu tên file' });
    }
    
    const rootId = await ensureUploadRoot();
    let targetParentId = parentId || rootId;
    
    // Xử lý relativePath để tạo folder nếu cần
    let folderPath = '';
    if (relativePath) {
      const parts = relativePath.split('/');
      if (parts.length > 1) {
        folderPath = parts.slice(0, -1).join('/');
      }
    }
    
    if (folderPath) {
      targetParentId = await getOrCreateFolderByPath(folderPath, targetParentId);
    }
    
    // Kiểm tra file đã tồn tại chưa (để ghi đè)
    const existed = await drive.files.list({
      q: `'${targetParentId}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive'
    });
    
    let fileId = null;
    let isUpdate = false;
    
    if (existed.data.files.length > 0) {
      fileId = existed.data.files[0].id;
      isUpdate = true;
    }
    
    // Trả về thông tin để client tự tạo upload session
    res.json({
      success: true,
      targetParentId,
      fileName,
      mimeType: mimeType || 'application/octet-stream',
      fileId, // null nếu tạo mới, có giá trị nếu update
      isUpdate
    });
    
  } catch (err) {
    console.error('Lỗi tạo upload session:', err);
    res.status(500).json({ error: 'Không thể tạo upload session' });
  }
});

// ==== 🚀 API MỚI: Hoàn tất upload (cập nhật metadata, tạo share link) ====
app.post('/complete-upload', async (req, res) => {
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'Thiếu file ID' });
    }
    
    // Lấy thông tin file
    const fileInfo = await drive.files.get({
      fileId,
      fields: 'id, name, size, modifiedTime'
    });
    
    // Tạo share link
    const shareLink = await getOrCreateShareLink(fileId);
    
    res.json({
      success: true,
      file: {
        id: fileInfo.data.id,
        name: fileInfo.data.name,
        size: fileInfo.data.size,
        modifiedTime: fileInfo.data.modifiedTime,
        shareLink
      }
    });
    
  } catch (err) {
    console.error('Lỗi hoàn tất upload:', err);
    res.status(500).json({ error: 'Không thể hoàn tất upload' });
  }
});

// ==== API cũ: Lấy quota dung lượng ====
app.get('/storage', async (req, res) => {
  try {
    const about = await drive.about.get({ fields: 'storageQuota' });
    res.json(about.data.storageQuota);
  } catch (err) {
    res.status(500).json({ error: 'Không lấy được thông tin dung lượng', detail: err.message });
  }
});

// ==== API cũ: List files ====
app.get('/files', async (req, res) => {
  try {
    const rootId = await ensureUploadRoot();
    const parentId = req.query.parentId || rootId;
    
    const result = await drive.files.list({
      q: `'${parentId}' in parents and trashed=false`,
      fields: 'files(id, name, modifiedTime, size, mimeType, webViewLink)',
      spaces: 'drive'
    });
    
    const files = await Promise.all((result.data.files || []).map(async f => {
      const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
      let shareLink = f.webViewLink;
      
      if (!isFolder && !shareLink) {
        shareLink = await getOrCreateShareLink(f.id);
      }
      
      return {
        ...f,
        isFolder,
        shareLink
      };
    }));
    
    res.json(files);
  } catch (err) {
    res.status(500).json([]);
  }
});

// ==== API cũ: Lấy thông tin folder ====
app.get('/folderinfo/:id', async (req, res) => {
  try {
    const result = await drive.files.get({
      fileId: req.params.id,
      fields: 'id, name'
    });
    res.json({ id: result.data.id, name: result.data.name });
  } catch (err) {
    res.status(404).json({});
  }
});

// ==== API cũ: Tạo thư mục ====
app.post('/create-folder', async (req, res) => {
  try {
    const rootId = await ensureUploadRoot();
    const parentId = req.body.parentId || rootId;
    const name = req.body.name;
    
    if (!name) return res.status(400).json({ error: 'Thiếu tên thư mục' });
    
    const existed = await drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    if (existed.data.files.length > 0) {
      return res.json({ id: existed.data.files[0].id, name: existed.data.files[0].name });
    }
    
    const folderMeta = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };
    
    const folder = await drive.files.create({
      resource: folderMeta,
      fields: 'id, name'
    });
    
    res.json({ id: folder.data.id, name: folder.data.name });
  } catch (err) {
    res.status(500).json({ error: 'Tạo thư mục lỗi' });
  }
});

// ==== API cũ: Download file ====
app.get('/download/:id', async (req, res) => {
  try {
    const meta = await drive.files.get({
      fileId: req.params.id,
      fields: 'name'
    });
    
    const driveRes = await drive.files.get(
      { fileId: req.params.id, alt: 'media' },
      { responseType: 'stream' }
    );
    
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.data.name)}"`);
    driveRes.data.pipe(res);
  } catch (err) {
    res.status(404).send('Không tìm thấy file');
  }
});

// ==== API cũ: Xóa file ====
app.delete('/delete/:id', async (req, res) => {
  try {
    await drive.files.delete({ fileId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: 'Xóa lỗi' });
  }
});

// ==== Serve static files ====
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;