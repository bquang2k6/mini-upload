
**Mini Google Drive** là một dự án giúp bạn upload, quản lý và chia sẻ file qua Google Drive với giao diện web thân thiện. Có thể chạy ngay trên localhost và vercel

---

## � Nội dung chính

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Setup Local](#setup-local)
- [Deploy trên Vercel](#deploy-trên-vercel)
- [Troubleshooting](#troubleshooting)

---

## �💾 Yêu cầu hệ thống

- Node.js >= 16.x
- npm hoặc yarn
- Tài khoản Google (để tạo OAuth2 Client)
- Đã bật Google Drive API (xem hướng dẫn bên dưới)

---

## ✨ Setup Local

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Tạo file `.env`
Copy từ `.env.example`:
```bash
cp .env.example .env
```

### 3. Điền Google Drive API credentials vào `.env`
```env
YOUR_CLIENT_ID=xxx.apps.googleusercontent.com
YOUR_CLIENT_SECRET=xxx
YOUR_REDIRECT_URI=https://developers.google.com/oauthplayground
YOUR_REFRESH_TOKEN=xxx
```

### 4. Chạy dev server (với hot reload)
```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3001** 🎉

---

## 🚀 Deploy trên Vercel

### Bước 1: Chuẩn bị Google Drive API credentials
- Tạo OAuth Client trên [Google Cloud Console](https://console.cloud.google.com/)
- Lấy `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`
- Set `REDIRECT_URI` = `https://developers.google.com/oauthplayground`

### Bước 2: Deploy với Vercel
```bash
npm install -g vercel
vercel
```

Chọn "Y" khi hỏi import settings từ vercel.json

### Bước 3: Set Environment Variables trên Vercel Dashboard

1. Vào project trên Vercel: https://vercel.com/dashboard
2. Chọn project của bạn
3. Vào **Settings > Environment Variables**
4. Thêm 4 biến:
   ```
   YOUR_CLIENT_ID = <your_client_id>
   YOUR_CLIENT_SECRET = <your_client_secret>
   YOUR_REDIRECT_URI = https://developers.google.com/oauthplayground
   YOUR_REFRESH_TOKEN = <your_refresh_token>
   ```

### Bước 4: Redeploy
```bash
vercel --prod
```

✅ Dự án sẽ chạy tại: **https://your-project-name.vercel.app**

---

## 🔍 Troubleshooting

### ❌ Vercel trả lỗi "API not configured" hoặc 503?

**Giải pháp:**
1. Kiểm tra environment variables trên Vercel dashboard
2. Đảm bảo tất cả 4 biến đã được set (không có biến nào trống)
3. Vào **Deployments > Logs** để xem chi tiết lỗi
4. Redeploy: `vercel --prod`

### ❌ Local chạy lỗi "Cannot read property 'files' of null"?

**Giải pháp:**
- Đảm bảo file `.env` tồn tại và có tất cả 4 biến
- Xóa `node_modules` và chạy `npm install` lại
- Chắc chắn `npm run dev` đã được chạy (không phải `node server.js`)

### ❌ Port 3001 bị chiếm dụng?

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

Hoặc thay đổi PORT:
```bash
PORT=3002 npm run dev
```

---

## 📁 Cấu trúc Project

```
.
├── api/
│   └── handler.js              # Serverless handler cho Vercel
├── public/
│   └── index.html              # Frontend (HTML + CSS + JS)
├── server.js                   # Express server + API routes
├── index.js                    # Entry point cho local
├── package.json                # Dependencies
├── vercel.json                 # Cấu hình Vercel
├── .env.example                # Template .env
├── .vercelignore               # Files bỏ qua khi deploy
└── README.md                   # File này
```

---

## 🎯 Features

✅ Upload file lên Google Drive  
✅ Tạo & quản lý folder  
✅ Download file  
✅ Xóa file  
✅ Chia sẻ file (public link)  
✅ Xem dung lượng sử dụng  
✅ Responsive design (mobile-friendly)  
✅ Chạy được trên local + Vercel  
✅ Hot reload khi dev  

---

## � Support

Nếu có vấn đề, vui lòng:
1. Kiểm tra lại Google Drive API credentials
2. Xem Vercel Logs để xác định lỗi
3. Đảm bảo Node.js version >= 16.x

---

## 📜 License

MIT

---

## �🚀 Hướng dẫn cài đặt (Cũ)

### 1. Clone dự án về máy

```bash
git clone https://github.com/bquang2k6/mini-upload.git
cd Thư mục vừa clone về
```

### 2. Cài đặt thư viện phụ thuộc

```bash
npm install express busboy googleapis
```

---

### 3. Lấy CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN

Bạn cần điền trực tiếp các giá trị này vào đầu file `server.js`:

```js
const CLIENT_ID = 'xxx.apps.googleusercontent.com';
const CLIENT_SECRET = 'xxx';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'xxx';
```

#### Cách lấy thông tin này:

**Bước 1: Tạo OAuth Client ID trên Google Cloud**  
- Truy cập [Google Cloud Console](https://console.cloud.google.com/)
- Tạo project mới (hoặc chọn project bạn muốn dùng)
- Vào **APIs & Services > Credentials**
- Nhấn **Create Credentials > OAuth client ID**
- Application type: chọn **Web application**
- Authorized redirect URIs: thêm dòng:
  ```
  https://developers.google.com/oauthplayground
  ```
- Nhấn **Create** và copy **Client ID** và **Client Secret**

**Bước 2: Bật Google Drive API**  
- Vào **APIs & Services > Library**
- Tìm **Google Drive API** > **Enable**

**Bước 3: Lấy Refresh Token**  
- Vào [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- Nhấn biểu tượng bánh răng (cài đặt) → chọn **Use your own OAuth credentials**
- Nhập **Client ID** và **Client Secret**
- Ở Step 1, tìm **Drive API v3** > tick:
  ```
  https://www.googleapis.com/auth/drive
  ```
- Nhấn **Authorize APIs**, đăng nhập Google, cấp quyền, quay lại playground
- Nhấn **Exchange authorization code for tokens**
- Copy **Refresh token** và điền vào `server.js`

---

### 4. Chạy dự án

```bash
node server.js
```
Truy cập vào: [http://localhost:3001](http://localhost:3001)

---

## 📁 Cấu trúc thư mục

```
mini-google-drive/
│
├── server.js         # Code Node.js backend (chứa thông tin OAuth)
├── index.html        # Giao diện web
├── styles.css        # CSS giao diện
├── README.md         # File hướng dẫn này
```

---

## 📢 Lưu ý bảo mật

- **Không chia sẻ mã nguồn chứa CLIENT_SECRET, REFRESH_TOKEN công khai!**
- Nếu bị lộ, phải đổi lại trên Google Cloud.

---

## ❤️ Đóng góp

- Pull request và các ý tưởng cải tiến luôn được chào đón!

---

## 📫 Liên hệ với tôi

- 📞 **SĐT:** 0963 159 294
- 🌐 **Website:** [lowji194.github.io](https://lowji194.github.io)
- 📌 **Facebook:** [Lowji194](https://facebook.com/Lowji194)

---

## ☕ Nếu bạn thấy dự án này hữu ích, một ly cà phê từ bạn sẽ là động lực tuyệt vời để mình tiếp tục phát triển thêm!

<p align="center">
  <img src="https://pay.theloi.io.vn/QR.png?text=QR+Code" alt="Mời cà phê" width="240" />
</p>
